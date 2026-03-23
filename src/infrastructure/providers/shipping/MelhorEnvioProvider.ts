import { injectable } from "tsyringe";
import type {
  IShippingProvider,
  ShippingProduct,
  ShippingOption,
} from "../../../application/interfaces/IShippingProvider.js";

const STORE_CEP = "18040-000"; // CEP da loja em Sorocaba

@injectable()
export class MelhorEnvioProvider implements IShippingProvider {
  private baseUrl: string;
  private token: string;

  constructor() {
    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
    this.baseUrl = isSandbox
      ? "https://sandbox.melhorenvio.com.br"
      : "https://melhorenvio.com.br";
    this.token = process.env.MELHOR_ENVIO_TOKEN || "";
  }

  async calculate(
    destinationCep: string,
    products: ShippingProduct[],
  ): Promise<ShippingOption[]> {
    if (!this.token) {
      throw new Error("MELHOR_ENVIO_TOKEN não configurado");
    }

    const totalWeight = products.reduce(
      (sum, p) => sum + p.weight * p.quantity,
      0,
    );

    // Calcula dimensões do pacote (soma volumes, usa maior dimensão)
    let maxWidth = 0;
    let maxHeight = 0;
    let totalLength = 0;

    for (const p of products) {
      maxWidth = Math.max(maxWidth, p.width);
      maxHeight = Math.max(maxHeight, p.height);
      totalLength += p.length * p.quantity;
    }

    // Dimensões mínimas dos Correios
    const width = Math.max(maxWidth, 11);
    const height = Math.max(maxHeight, 2);
    const length = Math.max(Math.min(totalLength, 100), 16);
    const weight = Math.max(totalWeight, 0.3);

    const body = {
      from: { postal_code: STORE_CEP.replace("-", "") },
      to: { postal_code: destinationCep.replace("-", "") },
      package: {
        weight,
        width,
        height,
        length,
      },
    };

    const response = await fetch(
      `${this.baseUrl}/api/v2/me/shipment/calculate`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
          "User-Agent": "OlhosDeGato/1.0",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MelhorEnvio API error:", response.status, errorText);
      throw new Error("Erro ao calcular frete");
    }

    const data = (await response.json()) as any[];

    const options: ShippingOption[] = [];

    for (const item of data) {
      // Pula serviços com erro
      if (item.error) continue;

      options.push({
        serviceId: item.id,
        serviceName: item.name,
        company: item.company?.name || "Transportadora",
        price: parseFloat(item.custom_price || item.price),
        deliveryDays: parseInt(item.custom_delivery_time || item.delivery_time),
      });
    }

    return options;
  }
}
