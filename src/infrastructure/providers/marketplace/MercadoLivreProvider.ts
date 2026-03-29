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

  async createListing(product: Product, listing: MarketplaceListing, accessToken: string): Promise<ExternalListing> {
    // Auto-predict category from product title if not manually set
    let categoryId = listing.categoryMapping;
    if (!categoryId) {
      try {
        const predictUrl = `${ML_API_URL}/sites/MLB/category_predictor/predict?title=${encodeURIComponent(product.name)}`;
        const predictResponse = await fetch(predictUrl);
        if (predictResponse.ok) {
          const prediction = await predictResponse.json() as any;
          categoryId = prediction.id;
        }
      } catch {
        // Ignore prediction errors, use fallback
      }
    }
    if (!categoryId) {
      categoryId = "MLB270533"; // Fallback: Petiscos para Caes
    }

    const imageUrls = product.images
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ source: img.url }));

    const body = {
      title: product.name.substring(0, 60),
      category_id: categoryId,
      price: listing.price.getValue(),
      currency_id: "BRL",
      available_quantity: product.stock,
      buying_mode: "buy_it_now",
      condition: "new",
      listing_type_id: "gold_pro",
      description: { plain_text: product.description || "" },
      pictures: imageUrls.length > 0 ? imageUrls : undefined,
      seller_custom_field: product.sku,
    };

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
      const causes = Array.isArray(error.cause)
        ? error.cause.map((c: any) => `${c.code || ""}: ${c.message || ""}`).join("; ")
        : "";
      const errorMsg = [error.message, causes, error.error].filter(Boolean).join(" | ");
      throw new Error(errorMsg || `Erro ${response.status} ao criar anúncio no ML`);
    }

    const result = await response.json() as any;

    return {
      externalId: result.id,
      externalUrl: result.permalink,
    };
  }

  async updateListing(listing: MarketplaceListing, product: Product, accessToken: string): Promise<void> {
    if (!listing.externalId) return;

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

  async updateStock(externalId: string, quantity: number, accessToken: string): Promise<void> {
    const response = await fetch(`${ML_API_URL}/items/${externalId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ available_quantity: quantity }),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.message || `Erro ${response.status} ao atualizar estoque no ML`);
    }
  }

  async pauseListing(externalId: string, accessToken: string): Promise<void> {
    const response = await fetch(`${ML_API_URL}/items/${externalId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "paused" }),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.message || `Erro ${response.status} ao pausar anúncio no ML`);
    }
  }

  async activateListing(externalId: string, accessToken: string): Promise<void> {
    const response = await fetch(`${ML_API_URL}/items/${externalId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "active" }),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.message || `Erro ${response.status} ao ativar anúncio no ML`);
    }
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
