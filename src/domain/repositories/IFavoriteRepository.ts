export interface FavoriteWithProduct {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productPromoPrice: number | null;
  productImage: string | null;
  createdAt: Date;
}

export interface IFavoriteRepository {
  findByCustomerId(customerId: string): Promise<FavoriteWithProduct[]>;
  findByCustomerAndProduct(customerId: string, productId: string): Promise<{ id: string } | null>;
  add(customerId: string, productId: string): Promise<void>;
  remove(customerId: string, productId: string): Promise<void>;
}
