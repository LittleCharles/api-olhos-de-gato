import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { MarketplaceListingStatus } from "../../../domain/enums/index.js";
import { CreateListingDTO } from "../../dtos/MarketplaceDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { randomUUID } from "crypto";

@injectable()
export class CreateListingUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(data: CreateListingDTO): Promise<MarketplaceListing> {
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new AppError("Conta de marketplace não encontrada", 404);
    }

    if (!account.isActive) {
      throw new AppError("Conta de marketplace não está ativa", 400);
    }

    const product = await this.productRepository.findById(data.productId);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    const existing = await this.listingRepository.findByAccountAndProduct(data.accountId, data.productId);
    if (existing) {
      throw new AppError("Este produto já possui um anúncio neste marketplace", 409);
    }

    const listing = new MarketplaceListing({
      id: randomUUID(),
      accountId: data.accountId,
      productId: data.productId,
      externalId: null,
      externalUrl: null,
      price: Money.create(data.price),
      status: MarketplaceListingStatus.DRAFT,
      lastSyncAt: null,
      lastError: null,
      categoryMapping: data.categoryMapping ?? null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.listingRepository.create(listing);
  }
}
