import { inject, injectable } from "tsyringe";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";
import { MarketplaceListingStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DeleteListingUseCase {
  constructor(
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
  ) {}

  async execute(id: string, provider?: IMarketplaceProvider): Promise<void> {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new AppError("Anúncio de marketplace não encontrado", 404);
    }

    if (listing.externalId && listing.status === MarketplaceListingStatus.ACTIVE && provider) {
      try {
        await provider.pauseListing(listing.externalId);
      } catch {
        // Best effort — still delete locally
      }
    }

    await this.listingRepository.delete(id);
  }
}
