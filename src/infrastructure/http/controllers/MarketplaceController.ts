import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListMarketplaceAccountsUseCase } from "../../../application/use-cases/marketplace/ListMarketplaceAccountsUseCase.js";
import { ConnectMarketplaceUseCase } from "../../../application/use-cases/marketplace/ConnectMarketplaceUseCase.js";
import { DisconnectMarketplaceUseCase } from "../../../application/use-cases/marketplace/DisconnectMarketplaceUseCase.js";
import { CreateListingUseCase } from "../../../application/use-cases/marketplace/CreateListingUseCase.js";
import { UpdateListingUseCase } from "../../../application/use-cases/marketplace/UpdateListingUseCase.js";
import { PublishListingUseCase } from "../../../application/use-cases/marketplace/PublishListingUseCase.js";
import { PauseListingUseCase } from "../../../application/use-cases/marketplace/PauseListingUseCase.js";
import { ListMarketplaceListingsUseCase } from "../../../application/use-cases/marketplace/ListMarketplaceListingsUseCase.js";
import { DeleteListingUseCase } from "../../../application/use-cases/marketplace/DeleteListingUseCase.js";
import { SyncStockUseCase } from "../../../application/use-cases/marketplace/SyncStockUseCase.js";
import {
  MarketplacePlatformParam,
  OAuthCallbackSchema,
  CreateListingSchema,
  UpdateListingSchema,
  ListingFiltersSchema,
} from "../../../application/dtos/MarketplaceDTO.js";
import { MarketplacePresenter } from "../presenters/MarketplacePresenter.js";
import { MarketplacePlatform } from "../../../domain/enums/index.js";
import { MercadoLivreProvider } from "../../providers/marketplace/MercadoLivreProvider.js";
import { AppError } from "../../../shared/errors/AppError.js";

function getProvider(platform: MarketplacePlatform) {
  switch (platform) {
    case MarketplacePlatform.MERCADO_LIVRE:
      return new MercadoLivreProvider();
    default:
      throw new AppError(`Marketplace ${platform} ainda não suportado`, 400);
  }
}

export class MarketplaceController {
  // ==================== Accounts ====================

  async listAccounts(request: FastifyRequest, reply: FastifyReply) {
    const useCase = container.resolve(ListMarketplaceAccountsUseCase);
    const accounts = await useCase.execute();
    return reply.send(accounts.map(MarketplacePresenter.accountToHTTP));
  }

  async getAuthUrl(
    request: FastifyRequest<{ Params: { platform: string } }>,
    reply: FastifyReply,
  ) {
    const platform = MarketplacePlatformParam.parse(request.params.platform);
    const provider = getProvider(platform);
    return reply.send({ url: provider.getAuthUrl() });
  }

  async oauthCallback(
    request: FastifyRequest<{ Params: { platform: string } }>,
    reply: FastifyReply,
  ) {
    const platform = MarketplacePlatformParam.parse(request.params.platform);
    const { code } = OAuthCallbackSchema.parse(request.body);
    const provider = getProvider(platform);

    const useCase = container.resolve(ConnectMarketplaceUseCase);
    const account = await useCase.execute(platform, code, provider);

    return reply.status(201).send(MarketplacePresenter.accountToHTTP(account));
  }

  async disconnect(
    request: FastifyRequest<{ Params: { platform: string } }>,
    reply: FastifyReply,
  ) {
    const platform = MarketplacePlatformParam.parse(request.params.platform);

    const useCase = container.resolve(DisconnectMarketplaceUseCase);
    await useCase.execute(platform);

    return reply.status(204).send();
  }

  // ==================== Listings ====================

  async listListings(request: FastifyRequest, reply: FastifyReply) {
    const filters = ListingFiltersSchema.parse(request.query);

    const useCase = container.resolve(ListMarketplaceListingsUseCase);
    const result = await useCase.execute(filters);

    return reply.send({
      data: result.data.map(MarketplacePresenter.listingToHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }

  async createListing(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateListingSchema.parse(request.body);

    const useCase = container.resolve(CreateListingUseCase);
    const listing = await useCase.execute(data);

    return reply.status(201).send(MarketplacePresenter.listingToHTTP(listing));
  }

  async updateListing(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const data = UpdateListingSchema.parse(request.body);

    const useCase = container.resolve(UpdateListingUseCase);
    const listing = await useCase.execute(id, data);

    return reply.send(MarketplacePresenter.listingToHTTP(listing));
  }

  async publishListing(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    // Determine the provider from the listing's account
    const listingUseCase = container.resolve(ListMarketplaceListingsUseCase);
    const accountsUseCase = container.resolve(ListMarketplaceAccountsUseCase);

    const useCase = container.resolve(PublishListingUseCase);
    // For now, default to ML provider — will be improved when we add more marketplaces
    const provider = new MercadoLivreProvider();
    const listing = await useCase.execute(id, provider);

    return reply.send(MarketplacePresenter.listingToHTTP(listing));
  }

  async pauseListing(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const useCase = container.resolve(PauseListingUseCase);
    const provider = new MercadoLivreProvider();
    const listing = await useCase.execute(id, provider);

    return reply.send(MarketplacePresenter.listingToHTTP(listing));
  }

  async deleteListing(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const useCase = container.resolve(DeleteListingUseCase);
    const provider = new MercadoLivreProvider();
    await useCase.execute(id, provider);

    return reply.status(204).send();
  }

  // ==================== Sync & Categories ====================

  async syncStock(request: FastifyRequest, reply: FastifyReply) {
    const accountsUseCase = container.resolve(ListMarketplaceAccountsUseCase);
    const accounts = await accountsUseCase.execute();
    const activeAccounts = accounts.filter((a) => a.isActive);

    const results: Array<{ platform: string; synced: number; errors: number }> = [];

    for (const account of activeAccounts) {
      const provider = getProvider(account.platform);
      const syncUseCase = container.resolve(SyncStockUseCase);
      const result = await syncUseCase.execute(provider, account.id);
      results.push({ platform: account.platform, ...result });
    }

    return reply.send({ results });
  }

  async getCategories(
    request: FastifyRequest<{ Params: { platform: string }; Querystring: { q?: string } }>,
    reply: FastifyReply,
  ) {
    const platform = MarketplacePlatformParam.parse(request.params.platform);
    const provider = getProvider(platform);
    const categories = await provider.getCategories(request.query.q);

    return reply.send(categories);
  }
}
