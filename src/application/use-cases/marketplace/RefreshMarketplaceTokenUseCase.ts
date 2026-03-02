import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";
import { MarketplaceAccount } from "../../../domain/entities/MarketplaceAccount.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class RefreshMarketplaceTokenUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
  ) {}

  async execute(account: MarketplaceAccount, provider: IMarketplaceProvider): Promise<MarketplaceAccount> {
    if (!account.refreshToken) {
      throw new AppError("Conta não possui refresh token", 400);
    }

    const tokens = await provider.refreshToken(account.refreshToken);

    account.updateTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);

    return this.accountRepository.update(account);
  }
}
