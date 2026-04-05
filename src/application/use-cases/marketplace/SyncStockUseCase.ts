import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";

interface SyncResult {
  synced: number;
  errors: number;
}

@injectable()
export class SyncStockUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(provider: IMarketplaceProvider, accountId: string): Promise<SyncResult> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      return { synced: 0, errors: 0 };
    }

    // Auto-refresh token if expired
    if (account.isTokenExpired() && account.refreshToken) {
      try {
        const tokens = await provider.refreshToken(account.refreshToken);
        account.updateTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
        await this.accountRepository.update(account);
      } catch {
        return { synced: 0, errors: 0 };
      }
    }

    if (!account.accessToken) {
      return { synced: 0, errors: 0 };
    }

    const listings = await this.listingRepository.findPublishedByAccountId(accountId);

    let synced = 0;
    let errors = 0;

    for (const listing of listings) {
      if (!listing.externalId) continue;

      try {
        const product = await this.productRepository.findById(listing.productId);
        if (!product) {
          listing.markError("Produto não encontrado");
          await this.listingRepository.update(listing);
          errors++;
          continue;
        }

        await provider.updateStock(listing.externalId, product.stock, account.accessToken);
        listing.markSynced();
        await this.listingRepository.update(listing);
        synced++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        listing.markError(message);
        await this.listingRepository.update(listing);
        errors++;
      }
    }

    return { synced, errors };
  }
}
