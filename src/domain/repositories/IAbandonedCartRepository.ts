import { PaginationParams } from "./IProductRepository.js";

export interface AbandonedCartItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface AbandonedCartData {
  id: string;
  customerName: string;
  customerEmail: string;
  items: AbandonedCartItem[];
  total: number;
  lastActivity: Date;
}

export interface AbandonedCartResult {
  data: AbandonedCartData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalValue: number;
}

export interface IAbandonedCartRepository {
  findAbandoned(pagination?: PaginationParams): Promise<AbandonedCartResult>;
}
