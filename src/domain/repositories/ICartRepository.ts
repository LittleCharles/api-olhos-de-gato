export interface CartWithItems {
  id: string;
  customerId: string;
  items: CartItemWithProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productPromoPrice: number | null;
  productImage: string | null;
  quantity: number;
}

export interface ICartRepository {
  findByCustomerId(customerId: string): Promise<CartWithItems | null>;
  getOrCreateCart(customerId: string): Promise<string>;
  addItem(cartId: string, productId: string, quantity: number): Promise<void>;
  updateItemQuantity(itemId: string, quantity: number): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  findItemById(itemId: string): Promise<{ id: string; cartId: string; productId: string; quantity: number } | null>;
  findItemByProduct(cartId: string, productId: string): Promise<{ id: string; quantity: number } | null>;
}
