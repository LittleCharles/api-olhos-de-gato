import { Coupon } from "../entities/Coupon.js";

export interface ICouponRepository {
  findAll(): Promise<Coupon[]>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  create(coupon: Coupon): Promise<Coupon>;
  update(coupon: Coupon): Promise<Coupon>;
  delete(id: string): Promise<void>;
  /** Devolve 1 uso ao cupom (piso 0) — pedido cancelado/expirado. */
  releaseUsage(id: string): Promise<void>;
}
