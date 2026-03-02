import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import { MarketplaceAccount } from "../../../domain/entities/MarketplaceAccount.js";

@injectable()
export class ListMarketplaceAccountsUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
  ) {}

  async execute(): Promise<MarketplaceAccount[]> {
    return this.accountRepository.findAll();
  }
}
