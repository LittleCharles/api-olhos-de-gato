import { OrderStatus, PaymentStatus, PaymentMethod } from "../enums/index.js";
import { Money } from "../value-objects/Money.js";

export interface OrderItemProps {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
}

export interface OrderProps {
  id: string;
  customerId: string;
  adminId?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: Money;
  discount: Money;
  total: Money;
  notes?: string | null;
  trackingCode?: string | null;
  pickupLocation?: string | null;
  items: OrderItemProps[];
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get adminId(): string | null | undefined {
    return this.props.adminId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get paymentStatus(): PaymentStatus {
    return this.props.paymentStatus;
  }

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod;
  }

  get subtotal(): Money {
    return this.props.subtotal;
  }

  get discount(): Money {
    return this.props.discount;
  }

  get total(): Money {
    return this.props.total;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get trackingCode(): string | null | undefined {
    return this.props.trackingCode;
  }

  get pickupLocation(): string | null | undefined {
    return this.props.pickupLocation;
  }

  get items(): OrderItemProps[] {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(
      this.props.status,
    );
  }

  updateStatus(status: OrderStatus, adminId?: string): void {
    this.props.status = status;
    if (adminId) {
      this.props.adminId = adminId;
    }
    this.props.updatedAt = new Date();
  }

  updatePaymentStatus(status: PaymentStatus): void {
    this.props.paymentStatus = status;
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error("Pedido não pode ser cancelado neste status");
    }
    this.props.status = OrderStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  confirm(): void {
    this.props.status = OrderStatus.CONFIRMED;
    this.props.updatedAt = new Date();
  }

  markAsPreparing(): void {
    this.props.status = OrderStatus.PREPARING;
    this.props.updatedAt = new Date();
  }

  markAsReady(): void {
    this.props.status = OrderStatus.READY;
    this.props.updatedAt = new Date();
  }

  markAsDelivered(): void {
    this.props.status = OrderStatus.DELIVERED;
    this.props.updatedAt = new Date();
  }

  updateTrackingCode(code: string): void {
    this.props.trackingCode = code;
    this.props.updatedAt = new Date();
  }
}
