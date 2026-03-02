import { MarketplaceListing } from "../entities/MarketplaceListing.js";
import { MarketplaceListingStatus } from "../enums/index.js";

export interface MarketplaceListingFilters {
  accountId?: string;
  productId?: string;
  status?: MarketplaceListingStatus;
}

export interface MarketplaceListingPaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedMarketplaceListings {
  data: MarketplaceListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IMarketplaceListingRepository {
  findById(id: string): Promise<MarketplaceListing | null>;
  findByAccountAndProduct(accountId: string, productId: string): Promise<MarketplaceListing | null>;
  findAll(
    filters?: MarketplaceListingFilters,
    pagination?: MarketplaceListingPaginationParams,
  ): Promise<PaginatedMarketplaceListings>;
  findActiveByAccountId(accountId: string): Promise<MarketplaceListing[]>;
  findByProductId(productId: string): Promise<MarketplaceListing[]>;
  create(listing: MarketplaceListing): Promise<MarketplaceListing>;
  update(listing: MarketplaceListing): Promise<MarketplaceListing>;
  delete(id: string): Promise<void>;
}
