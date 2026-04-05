import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";
import { MarketplaceListingStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class PauseListingUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
  ) {}

  async execute(id: string, provider: IMarketplaceProvider): Promise<MarketplaceListing> {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new AppError("Anúncio de marketplace não encontrado", 404);
    }

    if (listing.status !== MarketplaceListingStatus.ACTIVE) {
      throw new AppError("Anúncio não está ativo", 400);
    }

    const account = await this.accountRepository.findById(listing.accountId);
    if (!account || !account.isActive) {
      throw new AppError("Conta de marketplace não está ativa", 400);
    }

    // Auto-refresh token if expired
    if (account.isTokenExpired() && account.refreshToken) {
      try {
        const tokens = await provider.refreshToken(account.refreshToken);
        account.updateTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
        await this.accountRepository.update(account);
      } catch {
        throw new AppError("Token expirado e não foi possível renovar. Reconecte o marketplace.", 401);
      }
    }

    if (!account.accessToken) {
      throw new AppError("Token de acesso não disponível. Reconecte o marketplace.", 401);
    }

    if (listing.externalId) {
      try {
        await provider.pauseListing(listing.externalId, account.accessToken);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        listing.markError(message);
        await this.listingRepository.update(listing);
        throw new AppError(`Erro ao pausar anúncio: ${message}`, 502);
      }
    }

    listing.pause();
    return this.listingRepository.update(listing);
  }
}
