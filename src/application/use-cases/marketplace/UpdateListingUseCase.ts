import { inject, injectable } from "tsyringe";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { UpdateListingDTO } from "../../dtos/MarketplaceDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateListingUseCase {
  constructor(
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
  ) {}

  async execute(id: string, data: UpdateListingDTO): Promise<MarketplaceListing> {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new AppError("Anúncio de marketplace não encontrado", 404);
    }

    if (data.price !== undefined) {
      listing.updatePrice(Money.create(data.price));
    }

    if (data.categoryMapping !== undefined) {
      listing.updateCategoryMapping(data.categoryMapping);
    }

    return this.listingRepository.update(listing);
  }
}
