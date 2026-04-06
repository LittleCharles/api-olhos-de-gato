import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { ICartRepository } from "../../../domain/repositories/ICartRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { Order, OrderItemProps } from "../../../domain/entities/Order.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { OrderStatus, PaymentStatus, PaymentMethod } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

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
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
    @inject("CartRepository")
    private cartRepository: ICartRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
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
    const shippingCost = input.shippingCost ? Money.create(input.shippingCost) : Money.zero();
    const total = subtotal.add(shippingCost);

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
      shippingCost,
      shippingService: input.shippingService ?? null,
      shippingDays: input.shippingDays ?? null,
      items: orderItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdOrder = await this.orderRepository.create(order);

    // Reduce stock for each product
    for (const item of orderItems) {
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }

    // Clear cart after order creation
    await this.cartRepository.clearCart(cart.id);

    // Send order confirmation email
    if (input.customerEmail) {
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
    }

    return createdOrder;
  }
}
