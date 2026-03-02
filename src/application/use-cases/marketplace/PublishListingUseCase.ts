import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";
import { MarketplaceListingStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class PublishListingUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(id: string, provider: IMarketplaceProvider): Promise<MarketplaceListing> {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new AppError("Anúncio de marketplace não encontrado", 404);
    }

    if (listing.status === MarketplaceListingStatus.ACTIVE) {
      throw new AppError("Anúncio já está ativo", 400);
    }

    const account = await this.accountRepository.findById(listing.accountId);
    if (!account || !account.isActive) {
      throw new AppError("Conta de marketplace não está ativa", 400);
    }

    const product = await this.productRepository.findById(listing.productId);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    try {
      if (listing.externalId) {
        await provider.activateListing(listing.externalId);
        listing.activate();
      } else {
        const result = await provider.createListing(product, listing);
        listing.publish(result.externalId, result.externalUrl);
      }

      return this.listingRepository.update(listing);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      listing.markError(message);
      await this.listingRepository.update(listing);
      throw new AppError(`Erro ao publicar anúncio: ${message}`, 502);
    }
  }
}
