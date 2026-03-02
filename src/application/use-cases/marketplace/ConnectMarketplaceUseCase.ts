import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";
import { MarketplaceAccount } from "../../../domain/entities/MarketplaceAccount.js";
import { MarketplacePlatform } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { randomUUID } from "crypto";

@injectable()
export class ConnectMarketplaceUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
  ) {}

  async execute(platform: MarketplacePlatform, code: string, provider: IMarketplaceProvider): Promise<MarketplaceAccount> {
    const tokens = await provider.exchangeCode(code);

    let account = await this.accountRepository.findByPlatform(platform);

    if (account) {
      account.updateTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
      account.activate(tokens.sellerId);
      if (tokens.metadata) {
        account.updateMetadata(tokens.metadata);
      }
      return this.accountRepository.update(account);
    }

    account = new MarketplaceAccount({
      id: randomUUID(),
      platform,
      sellerId: tokens.sellerId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
      isActive: true,
      metadata: tokens.metadata ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.accountRepository.create(account);
  }
}
