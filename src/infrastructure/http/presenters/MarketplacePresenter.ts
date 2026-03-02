import { MarketplaceAccount } from "../../../domain/entities/MarketplaceAccount.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";

export class MarketplacePresenter {
  static accountToHTTP(account: MarketplaceAccount) {
    return {
      id: account.id,
      platform: account.platform,
      sellerId: account.sellerId,
      isActive: account.isActive,
      isTokenExpired: account.isTokenExpired(),
      metadata: account.metadata,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  static listingToHTTP(listing: MarketplaceListing) {
    return {
      id: listing.id,
      accountId: listing.accountId,
      productId: listing.productId,
      externalId: listing.externalId,
      externalUrl: listing.externalUrl,
      price: listing.price.getValue(),
      priceFormatted: listing.price.format(),
      status: listing.status,
      lastSyncAt: listing.lastSyncAt?.toISOString() ?? null,
      lastError: listing.lastError,
      categoryMapping: listing.categoryMapping,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    };
  }
}
