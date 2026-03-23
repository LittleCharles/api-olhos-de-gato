import { Order } from "../../../domain/entities/Order.js";

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id,
      customerId: order.customerId,
      adminId: order.adminId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal.getValue(),
      subtotalFormatted: order.subtotal.format(),
      discount: order.discount.getValue(),
      discountFormatted: order.discount.format(),
      total: order.total.getValue(),
      totalFormatted: order.total.format(),
      notes: order.notes,
      trackingCode: order.trackingCode,
      pickupLocation: order.pickupLocation,
      shippingCost: order.shippingCost?.getValue() ?? 0,
      shippingCostFormatted: order.shippingCost?.format() ?? "R$ 0,00",
      shippingService: order.shippingService,
      shippingDays: order.shippingDays,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.getValue(),
        unitPriceFormatted: item.unitPrice.format(),
        total: item.total.getValue(),
        totalFormatted: item.total.format(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  static toListHTTP(order: Order) {
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: order.total.getValue(),
      totalFormatted: order.total.format(),
      trackingCode: order.trackingCode,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
