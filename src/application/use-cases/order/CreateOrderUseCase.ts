import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { ICartRepository } from "../../../domain/repositories/ICartRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Order, OrderItemProps } from "../../../domain/entities/Order.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { OrderStatus, PaymentStatus, PaymentMethod } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

interface CreateOrderInput {
  customerId: string;
  paymentMethod: PaymentMethod;
  addressId?: string;
  notes?: string;
  pickupLocation?: string;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
    @inject("CartRepository")
    private cartRepository: ICartRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const cart = await this.cartRepository.findByCustomerId(input.customerId);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Carrinho vazio", 400);
    }

    const orderItems: OrderItemProps[] = [];
    let subtotal = Money.zero();

    for (const cartItem of cart.items) {
      const product = await this.productRepository.findById(cartItem.productId);

      if (!product) {
        throw new AppError(`Produto "${cartItem.productName}" não encontrado`, 404);
      }

      if (!product.isActive) {
        throw new AppError(`Produto "${product.name}" está indisponível`, 400);
      }

      if (product.stock < cartItem.quantity) {
        throw new AppError(`Estoque insuficiente para "${product.name}"`, 400);
      }

      const unitPrice = product.promoPrice ?? product.price;
      const itemTotal = unitPrice.multiply(cartItem.quantity);

      orderItems.push({
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity: cartItem.quantity,
        unitPrice,
        total: itemTotal,
      });

      subtotal = subtotal.add(itemTotal);
    }

    const discount = Money.zero();
    const total = subtotal;

    const order = new Order({
      id: randomUUID(),
      customerId: input.customerId,
      adminId: null,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: input.paymentMethod,
      subtotal,
      discount,
      total,
      notes: input.notes ?? null,
      trackingCode: null,
      pickupLocation: input.pickupLocation ?? null,
      items: orderItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdOrder = await this.orderRepository.create(order);

    // Clear cart after order creation
    await this.cartRepository.clearCart(cart.id);

    return createdOrder;
  }
}
