import { Product } from "../../domain/entities/Product.js";
import { MarketplaceListing } from "../../domain/entities/MarketplaceListing.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  sellerId: string;
  metadata?: Record<string, unknown>;
}

export interface ExternalListing {
  externalId: string;
  externalUrl: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  children?: MarketplaceCategory[];
}

export interface ExternalOrder {
  externalId: string;
  status: string;
  items: Array<{
    externalProductId: string;
    quantity: number;
    unitPrice: number;
    sku?: string;
  }>;
  total: number;
  buyerName: string;
  buyerEmail?: string;
  createdAt: Date;
}

export interface IMarketplaceProvider {
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<TokenPair>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  createListing(product: Product, listing: MarketplaceListing, accessToken: string): Promise<ExternalListing>;
  updateListing(listing: MarketplaceListing, product: Product, accessToken: string): Promise<void>;
  updateStock(externalId: string, quantity: number, accessToken: string): Promise<void>;
  pauseListing(externalId: string, accessToken: string): Promise<void>;
  activateListing(externalId: string, accessToken: string): Promise<void>;
  getCategories(query?: string): Promise<MarketplaceCategory[]>;
  getOrders(accessToken: string, sellerId: string, since: Date): Promise<ExternalOrder[]>;
}
