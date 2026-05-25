import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import { Order, OrderItemProps } from "../../../domain/entities/Order.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { OrderStatus, PaymentStatus, PaymentMethod } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import type { IAddressRepository } from "../../../domain/repositories/IAddressRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import { CalculateShippingUseCase } from "../shipping/CalculateShippingUseCase.js";

interface CreateOrderInput {
  customerId: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  addressId?: string;
  notes?: string;
  pickupLocation?: string;
  // O cliente só escolhe o serviço; o servidor recota o preço (anti-subfaturamento).
  shippingServiceId?: number;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
    @inject("CustomerRepository")
    private customerRepository: ICustomerRepository,
    @inject("CalculateShippingUseCase")
    private calculateShipping: CalculateShippingUseCase,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // Cliente precisa ter cadastro completo (CPF + telefone) pra finalizar — defesa em camadas
    // contra DevTools tampering (frontend já bloqueia via banner).
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      throw new AppError("Cliente não encontrado", 404);
    }
    // `||` cobre null, undefined e string vazia (legado)
    if (!customer.cpf || !customer.phone || customer.cpf.trim() === "" || customer.phone.trim() === "") {
      throw new AppError(
        "Complete seu cadastro com CPF e telefone antes de finalizar a compra.",
        400,
      );
    }

    // Email verification (LGPD/anti-spam)
    const customerUser = await prisma.user.findUnique({
      where: { id: customer.userId },
      select: { emailVerifiedAt: true },
    });
    if (!customerUser?.emailVerifiedAt) {
      throw new AppError(
        "Confirme seu email antes de finalizar a compra. Verifique sua caixa de entrada.",
        400,
      );
    }

    // Ownership check: prevent IDOR — addressId must belong to the customer placing the order
    // O endereço é congelado como snapshot na Order (delivery only) pra não perder o destino
    // se o cliente editar/deletar o Address depois.
    let shippingAddressSnapshot: {
      recipientName: string | null;
      zipCode: string;
      street: string;
      number: string;
      complement: string | null;
      neighborhood: string;
      city: string;
      state: string;
    } | null = null;

    // Frete calculado no SERVIDOR (anti-subfaturamento). Pickup = 0; delivery = recotação
    // do Melhor Envio pro serviço escolhido. Fora da transação (é chamada HTTP externa).
    let serverShippingCost = Money.zero();
    let serverShippingService: string | null = null;
    let serverShippingDays: number | null = null;

    if (input.addressId) {
      const address = await this.addressRepository.findById(input.addressId);
      if (!address || address.customerId !== input.customerId) {
        throw new AppError("Endereço inválido", 400);
      }
      shippingAddressSnapshot = {
        recipientName: customer.name || input.customerName || null,
        zipCode: address.zipCode,
        street: address.street,
        number: address.number,
        complement: address.complement ?? null,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      };

      // Itens do carrinho pra cotar (leitura leve; a transação relê de forma autoritativa).
      const cartForShipping = await prisma.cart.findUnique({
        where: { customerId: input.customerId },
        select: { items: { select: { productId: true, quantity: true } } },
      });
      if (!cartForShipping || cartForShipping.items.length === 0) {
        throw new AppError("Carrinho vazio", 400);
      }

      const options = await this.calculateShipping.execute({
        zipCode: address.zipCode,
        items: cartForShipping.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      const chosen = options.find((o) => o.serviceId === input.shippingServiceId);
      if (!chosen) {
        throw new AppError("Opção de frete inválida ou indisponível", 400);
      }
      serverShippingCost = Money.create(chosen.price);
      serverShippingService = `${chosen.serviceName} (${chosen.company})`;
      serverShippingDays = chosen.deliveryDays;
    }

    // All DB operations in a single transaction to guarantee atomicity
    const { createdOrder, orderItems, subtotal, shippingCost, total } =
      await prisma.$transaction(async (tx) => {
        // 1. Fetch cart
        const cart = await tx.cart.findUnique({
          where: { customerId: input.customerId },
          include: {
            items: {
              include: {
                product: {
                  include: { images: { where: { isMain: true }, take: 1 } },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new AppError("Carrinho vazio", 400);
        }

        // 2. Validate and decrement stock atomically for each item
        const items: OrderItemProps[] = [];
        let sub = Money.zero();

        for (const cartItem of cart.items) {
          const product = cartItem.product;

          if (!product) {
            throw new AppError(`Produto não encontrado`, 404);
          }

          if (!product.isActive) {
            throw new AppError(`Produto "${product.name}" está indisponível`, 400);
          }

          if (product.stock < cartItem.quantity) {
            throw new AppError(`Estoque insuficiente para "${product.name}"`, 400);
          }

          // Atomic stock decrement within transaction
          const updated = await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: cartItem.quantity } },
          });

          // Safety check: if stock went negative due to concurrent access, abort
          if (updated.stock < 0) {
            throw new AppError(`Estoque insuficiente para "${product.name}"`, 400);
          }

          const unitPrice = product.promoPrice
            ? Money.create(Number(product.promoPrice))
            : Money.create(Number(product.price));
          const itemTotal = unitPrice.multiply(cartItem.quantity);

          items.push({
            id: randomUUID(),
            productId: product.id,
            productName: product.name,
            quantity: cartItem.quantity,
            unitPrice,
            total: itemTotal,
          });

          sub = sub.add(itemTotal);
        }

        // 3. Calculate totals
        const ship = serverShippingCost;
        const tot = sub.add(ship);
        const orderId = randomUUID();

        // 4. Create order with items
        const created = await tx.order.create({
          data: {
            id: orderId,
            customerId: input.customerId,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: input.paymentMethod,
            subtotal: sub.getValue(),
            discount: 0,
            total: tot.getValue(),
            notes: input.notes ?? null,
            pickupLocation: input.pickupLocation ?? null,
            shippingCost: ship.getValue(),
            shippingService: serverShippingService,
            shippingDays: serverShippingDays,
            shippingRecipientName: shippingAddressSnapshot?.recipientName ?? null,
            shippingZipCode: shippingAddressSnapshot?.zipCode ?? null,
            shippingStreet: shippingAddressSnapshot?.street ?? null,
            shippingNumber: shippingAddressSnapshot?.number ?? null,
            shippingComplement: shippingAddressSnapshot?.complement ?? null,
            shippingNeighborhood: shippingAddressSnapshot?.neighborhood ?? null,
            shippingCity: shippingAddressSnapshot?.city ?? null,
            shippingState: shippingAddressSnapshot?.state ?? null,
            items: {
              create: items.map((item) => ({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice.getValue(),
                total: item.total.getValue(),
              })),
            },
          },
          include: {
            items: {
              include: { product: { include: { images: { where: { isMain: true }, take: 1 } } } },
            },
            customer: { include: { user: true } },
            history: { orderBy: { createdAt: "asc" } },
          },
        });

        // 5. Clear cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        // Map to domain entity
        const orderEntity = new Order({
          id: created.id,
          customerId: created.customerId,
          adminId: created.adminId,
          status: created.status as OrderStatus,
          paymentStatus: created.paymentStatus as PaymentStatus,
          paymentMethod: created.paymentMethod as PaymentMethod,
          subtotal: sub,
          discount: Money.zero(),
          total: tot,
          notes: created.notes,
          trackingCode: created.trackingCode,
          pickupLocation: created.pickupLocation,
          shippingCost: ship,
          shippingService: created.shippingService,
          shippingDays: created.shippingDays,
          shippingAddress: shippingAddressSnapshot,
          items: items.map((item, idx) => ({
            ...item,
            productImage: created.items[idx]?.product?.images?.[0]?.url ?? null,
          })),
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        });

        return { createdOrder: orderEntity, orderItems: items, subtotal: sub, shippingCost: ship, total: tot };
      });

    return createdOrder;
  }
}
