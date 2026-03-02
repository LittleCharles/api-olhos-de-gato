import { MarketplaceAccount } from "../entities/MarketplaceAccount.js";
import { MarketplacePlatform } from "../enums/index.js";

export interface IMarketplaceAccountRepository {
  findById(id: string): Promise<MarketplaceAccount | null>;
  findByPlatform(platform: MarketplacePlatform): Promise<MarketplaceAccount | null>;
  findAll(): Promise<MarketplaceAccount[]>;
  findActive(): Promise<MarketplaceAccount[]>;
  create(account: MarketplaceAccount): Promise<MarketplaceAccount>;
  update(account: MarketplaceAccount): Promise<MarketplaceAccount>;
  delete(id: string): Promise<void>;
}
