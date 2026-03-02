import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import { MarketplacePlatform } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DisconnectMarketplaceUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
  ) {}

  async execute(platform: MarketplacePlatform): Promise<void> {
    const account = await this.accountRepository.findByPlatform(platform);

    if (!account) {
      throw new AppError("Conta de marketplace não encontrada", 404);
    }

    await this.accountRepository.delete(account.id);
  }
}
