import {
  IMarketplaceProvider,
  TokenPair,
  ExternalListing,
  MarketplaceCategory,
  ExternalOrder,
} from "../../../application/interfaces/IMarketplaceProvider.js";
import { Product } from "../../../domain/entities/Product.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";

const ML_API_URL = "https://api.mercadolibre.com";
const ML_AUTH_URL = "https://auth.mercadolivre.com.br/authorization";
const ML_TOKEN_URL = `${ML_API_URL}/oauth/token`;

export class MercadoLivreProvider implements IMarketplaceProvider {
  private get appId(): string {
    return process.env.ML_APP_ID || "";
  }

  private get clientSecret(): string {
    return process.env.ML_CLIENT_SECRET || "";
  }

  private get redirectUri(): string {
    return process.env.ML_REDIRECT_URI || "";
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.appId,
      redirect_uri: this.redirectUri,
    });
    return `${ML_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<TokenPair> {
    const response = await fetch(ML_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.appId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao autenticar com Mercado Livre: ${error}`);
    }

    const data = await response.json() as any;

    // Fetch seller info
    const userResponse = await fetch(`${ML_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const userData = await userResponse.json() as any;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      sellerId: String(data.user_id),
      metadata: {
        nickname: userData.nickname,
        siteId: userData.site_id,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const response = await fetch(ML_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.appId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao renovar token do Mercado Livre: ${error}`);
    }

    const data = await response.json() as any;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      sellerId: String(data.user_id),
    };
  }

  async createListing(product: Product, listing: MarketplaceListing): Promise<ExternalListing> {
    const account = listing.accountId; // Will need access token passed differently
    // For now, we'll fetch it from the listing metadata or pass via a different mechanism

    const imageUrls = product.images
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ source: img.url }));

    const body = {
      title: product.name.substring(0, 60),
      category_id: listing.categoryMapping || "MLB1071", // Default: Acessorios para Animais
      price: listing.price.getValue(),
      currency_id: "BRL",
      available_quantity: product.stock,
      buying_mode: "buy_it_now",
      condition: "new",
      listing_type_id: "gold_special",
      description: { plain_text: product.description || "" },
      pictures: imageUrls.length > 0 ? imageUrls : undefined,
      seller_custom_field: product.sku,
    };

    // Access token will be retrieved from account in the controller layer
    const accessToken = (listing.metadata as any)?.accessToken;
    if (!accessToken) {
      throw new Error("Access token não disponível para criar anúncio");
    }

    const response = await fetch(`${ML_API_URL}/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.message || `Erro ${response.status} ao criar anúncio no ML`);
    }

    const result = await response.json() as any;

    return {
      externalId: result.id,
      externalUrl: result.permalink,
    };
  }

  async updateListing(listing: MarketplaceListing, product: Product): Promise<void> {
    if (!listing.externalId) return;

    const accessToken = (listing.metadata as any)?.accessToken;
    if (!accessToken) return;

    const body = {
      price: listing.price.getValue(),
      available_quantity: product.stock,
    };

    const response = await fetch(`${ML_API_URL}/items/${listing.externalId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.message || `Erro ${response.status} ao atualizar anúncio no ML`);
    }
  }

  async updateStock(externalId: string, quantity: number): Promise<void> {
    // Access token needs to be passed — this will be handled by the job layer
    // For now, this is a placeholder. The actual implementation will use the account token.
    throw new Error("updateStock deve ser chamado via SyncStockUseCase com token do account");
  }

  async pauseListing(externalId: string): Promise<void> {
    // Similar to updateStock — needs access token from the account
    throw new Error("pauseListing deve ser chamado com token do account");
  }

  async activateListing(externalId: string): Promise<void> {
    throw new Error("activateListing deve ser chamado com token do account");
  }

  async getCategories(query?: string): Promise<MarketplaceCategory[]> {
    let url = `${ML_API_URL}/sites/MLB/categories`;

    if (query) {
      url = `${ML_API_URL}/sites/MLB/domain_discovery/search?q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json() as any[];

    if (query) {
      return data.map((item: any) => ({
        id: item.category_id,
        name: item.category_name,
      }));
    }

    return data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
    }));
  }

  async getOrders(accessToken: string, sellerId: string, since: Date): Promise<ExternalOrder[]> {
    const dateFrom = since.toISOString();
    const url = `${ML_API_URL}/orders/search?seller=${sellerId}&order.date_created.from=${dateFrom}&sort=date_desc`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return [];

    const data = await response.json() as any;

    return (data.results || []).map((order: any) => ({
      externalId: String(order.id),
      status: order.status,
      items: (order.order_items || []).map((item: any) => ({
        externalProductId: item.item.id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        sku: item.item.seller_custom_field,
      })),
      total: order.total_amount,
      buyerName: order.buyer?.nickname || "Comprador ML",
      buyerEmail: order.buyer?.email,
      createdAt: new Date(order.date_created),
    }));
  }
}
