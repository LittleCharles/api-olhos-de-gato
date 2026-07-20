import { Money } from "../value-objects/Money.js";

export interface CouponProps {
  id: string;
  code: string;
  description?: string | null;
  discountPercent: number;
  minOrderValue?: Money | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Coupon {
  private props: CouponProps;

  constructor(props: CouponProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get discountPercent(): number {
    return this.props.discountPercent;
  }

  get minOrderValue(): Money | null | undefined {
    return this.props.minOrderValue;
  }

  get usageLimit(): number | null | undefined {
    return this.props.usageLimit;
  }

  get usedCount(): number {
    return this.props.usedCount;
  }

  get startsAt(): Date | null | undefined {
    return this.props.startsAt;
  }

  get expiresAt(): Date | null | undefined {
    return this.props.expiresAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isNotStarted(now: Date): boolean {
    return !!this.props.startsAt && this.props.startsAt > now;
  }

  isExpired(now: Date): boolean {
    return !!this.props.expiresAt && this.props.expiresAt < now;
  }

  isExhausted(): boolean {
    return (
      this.props.usageLimit !== null &&
      this.props.usageLimit !== undefined &&
      this.props.usedCount >= this.props.usageLimit
    );
  }

  calculateDiscount(subtotal: Money): Money {
    return Money.create((subtotal.getValue() * this.props.discountPercent) / 100);
  }

  update(
    data: Partial<
      Pick<
        CouponProps,
        | "code"
        | "description"
        | "discountPercent"
        | "minOrderValue"
        | "usageLimit"
        | "startsAt"
        | "expiresAt"
        | "isActive"
      >
    >,
  ): void {
    if (data.code !== undefined) this.props.code = data.code;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.discountPercent !== undefined)
      this.props.discountPercent = data.discountPercent;
    if (data.minOrderValue !== undefined)
      this.props.minOrderValue = data.minOrderValue;
    if (data.usageLimit !== undefined) this.props.usageLimit = data.usageLimit;
    if (data.startsAt !== undefined) this.props.startsAt = data.startsAt;
    if (data.expiresAt !== undefined) this.props.expiresAt = data.expiresAt;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    this.props.updatedAt = new Date();
  }
}
