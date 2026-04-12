import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { Order, OrderItemProps } from "../../../domain/entities/Order.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { OrderStatus, PaymentStatus, PaymentMethod } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

interface CreateOrderInput {
  customerId: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  addressId?: string;
  notes?: string;
  pickupLocation?: string;
  shippingCost?: number;
  shippingService?: string;
  shippingDays?: number;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
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
        const ship = input.shippingCost ? Money.create(input.shippingCost) : Money.zero();
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
            shippingService: input.shippingService ?? null,
            shippingDays: input.shippingDays ?? null,
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
          items: items.map((item, idx) => ({
            ...item,
            productImage: created.items[idx]?.product?.images?.[0]?.url ?? null,
          })),
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        });

        return { createdOrder: orderEntity, orderItems: items, subtotal: sub, shippingCost: ship, total: tot };
      });

    // Send order confirmation email OUTSIDE the transaction (non-blocking)
    if (input.customerEmail) {
      try {
        const itemsHtml = orderItems
          .map(
            (item) =>
              `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.unitPrice.getValue().toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.total.getValue().toFixed(2)}</td>
              </tr>`,
          )
          .join("");

        const shippingValue = shippingCost.getValue();

        await this.mailProvider.send({
          to: input.customerEmail,
          subject: `Pedido recebido #${createdOrder.id.slice(0, 8)} - Olhos de Gato`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Pedido recebido!</h2>
              <p>Olá <strong>${input.customerName || "cliente"}</strong>,</p>
              <p>Seu pedido foi recebido com sucesso. Aqui estão os detalhes:</p>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #f8f8f8;">
                    <th style="padding: 10px; text-align: left;">Produto</th>
                    <th style="padding: 10px; text-align: center;">Qtd</th>
                    <th style="padding: 10px; text-align: right;">Preço</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="text-align: right; margin-top: 10px;">
                <p style="margin: 4px 0;">Subtotal: <strong>R$ ${subtotal.getValue().toFixed(2)}</strong></p>
                ${shippingValue > 0 ? `<p style="margin: 4px 0;">Frete: <strong>R$ ${shippingValue.toFixed(2)}</strong></p>` : ""}
                <p style="margin: 4px 0; font-size: 18px; color: #ec4899;">Total: <strong>R$ ${total.getValue().toFixed(2)}</strong></p>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Acompanhe seu pedido na sua conta em nosso site.
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px;">Olhos de Gato - Petshop</p>
            </div>
          `,
        });
      } catch {
        // Email failure should not break the order flow
      }
    }

    return createdOrder;
  }
}
