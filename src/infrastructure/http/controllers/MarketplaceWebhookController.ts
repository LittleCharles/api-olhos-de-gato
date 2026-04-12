import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListMarketplaceAccountsUseCase } from "../../../application/use-cases/marketplace/ListMarketplaceAccountsUseCase.js";
import { SyncMLOrdersUseCase } from "../../../application/use-cases/marketplace/SyncMLOrdersUseCase.js";
import { MarketplacePlatform } from "../../../domain/enums/index.js";
import type { IMarketplaceProvider } from "../../../application/interfaces/IMarketplaceProvider.js";

interface MLNotification {
  resource: string;
  user_id: number;
  topic: string;
  application_id: number;
  attempts: number;
  sent: string;
  received: string;
}

export class MarketplaceWebhookController {
  async handleNotification(request: FastifyRequest, reply: FastifyReply) {
    // Respond immediately (ML requires response within 500ms)
    reply.send({ received: true });

    const notification = request.body as MLNotification;

    // Only process order notifications
    if (notification.topic !== "orders_v2") {
      return;
    }

    console.log(`[ML Webhook] Order notification: ${notification.resource}`);

    try {
      // Find the marketplace account by seller user_id
      const listAccounts = container.resolve(ListMarketplaceAccountsUseCase);
      const accounts = await listAccounts.execute();
      const account = accounts.find(
        (a) => a.isActive && a.platform === MarketplacePlatform.MERCADO_LIVRE && a.sellerId === String(notification.user_id),
      );

      if (!account) {
        console.log(`[ML Webhook] No active account for user_id ${notification.user_id}`);
        return;
      }

      const provider = container.resolve<IMarketplaceProvider>("MarketplaceProvider");
      const syncUseCase = container.resolve(SyncMLOrdersUseCase);
      const result = await syncUseCase.execute(provider, account.id);

      console.log(
        `[ML Webhook] Sync result: ${result.processed} processed, ${result.skipped} skipped, ${result.stockUpdated} stock updates, ${result.errors.length} errors`,
      );
    } catch (error) {
      console.error("[ML Webhook] Error processing notification:", error);
    }
  }
}
