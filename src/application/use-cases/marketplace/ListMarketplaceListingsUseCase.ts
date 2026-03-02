import { inject, injectable } from "tsyringe";
import type {
  IMarketplaceListingRepository,
  PaginatedMarketplaceListings,
} from "../../../domain/repositories/IMarketplaceListingRepository.js";
import { ListingFiltersDTO } from "../../dtos/MarketplaceDTO.js";

@injectable()
export class ListMarketplaceListingsUseCase {
  constructor(
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
  ) {}

  async execute(filters: ListingFiltersDTO): Promise<PaginatedMarketplaceListings> {
    const { page, limit, ...rest } = filters;

    return this.listingRepository.findAll(rest, { page, limit });
  }
}
