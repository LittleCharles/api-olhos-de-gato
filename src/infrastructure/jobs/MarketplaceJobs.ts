import { container } from "tsyringe";
import { ListMarketplaceAccountsUseCase } from "../../application/use-cases/marketplace/ListMarketplaceAccountsUseCase.js";
import { RefreshMarketplaceTokenUseCase } from "../../application/use-cases/marketplace/RefreshMarketplaceTokenUseCase.js";
import { SyncStockUseCase } from "../../application/use-cases/marketplace/SyncStockUseCase.js";
import { MarketplacePlatform } from "../../domain/enums/index.js";
import { MercadoLivreProvider } from "../providers/marketplace/MercadoLivreProvider.js";
import type { IMarketplaceProvider } from "../../application/interfaces/IMarketplaceProvider.js";
import type { MarketplaceAccount } from "../../domain/entities/MarketplaceAccount.js";

function getProvider(platform: MarketplacePlatform): IMarketplaceProvider {
  switch (platform) {
    case MarketplacePlatform.MERCADO_LIVRE:
      return new MercadoLivreProvider();
    default:
      throw new Error(`Provider não suportado: ${platform}`);
  }
}

async function refreshExpiredTokens(): Promise<void> {
  try {
    const listAccounts = container.resolve(ListMarketplaceAccountsUseCase);
    const accounts = await listAccounts.execute();
    const refreshUseCase = container.resolve(RefreshMarketplaceTokenUseCase);

    for (const account of accounts) {
      if (!account.isActive || !account.refreshToken) continue;

      // Refresh if token expires within the next hour
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (account.tokenExpiresAt && account.tokenExpiresAt > oneHourFromNow) continue;

      try {
        const provider = getProvider(account.platform);
        await refreshUseCase.execute(account, provider);
        console.log(`[Marketplace] Token renovado para ${account.platform}`);
      } catch (error) {
        console.error(`[Marketplace] Erro ao renovar token ${account.platform}:`, error);
      }
    }
  } catch (error) {
    console.error("[Marketplace] Erro no job de refresh de tokens:", error);
  }
}

async function syncStockToMarketplaces(): Promise<void> {
  try {
    const listAccounts = container.resolve(ListMarketplaceAccountsUseCase);
    const accounts = await listAccounts.execute();

    for (const account of accounts) {
      if (!account.isActive) continue;

      try {
        const provider = getProvider(account.platform);
        const syncUseCase = container.resolve(SyncStockUseCase);
        const result = await syncUseCase.execute(provider, account.id);
        console.log(`[Marketplace] Stock sync ${account.platform}: ${result.synced} ok, ${result.errors} erros`);
      } catch (error) {
        console.error(`[Marketplace] Erro no sync de estoque ${account.platform}:`, error);
      }
    }
  } catch (error) {
    console.error("[Marketplace] Erro no job de sync de estoque:", error);
  }
}

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function startMarketplaceJobs(): void {
  console.log("[Marketplace] Jobs iniciados (token refresh: 4h, stock sync: 15min)");

  // Token refresh every 4 hours
  setInterval(refreshExpiredTokens, FOUR_HOURS);

  // Stock sync every 15 minutes
  setInterval(syncStockToMarketplaces, FIFTEEN_MINUTES);

  // Run token refresh once on startup (after a small delay)
  setTimeout(refreshExpiredTokens, 10_000);
}
