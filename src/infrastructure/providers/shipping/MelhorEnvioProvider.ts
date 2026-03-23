import { injectable } from "tsyringe";
import type {
  IShippingProvider,
  ShippingProduct,
  ShippingOption,
} from "../../../application/interfaces/IShippingProvider.js";
import { AppError } from "../../../shared/errors/AppError.js";

const STORE_CEP = "18040000"; // CEP da loja em Sorocaba

const FRIENDLY_NAMES: Record<string, string> = {
  ".Package": "Jadlog Package",
  ".Com": "Jadlog Expresso",
};

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
      throw new AppError("MELHOR_ENVIO_TOKEN não configurado", 500);
    }

    const totalWeight = products.reduce(
      (sum, p) => sum + p.weight * p.quantity,
      0,
    );

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
      from: { postal_code: STORE_CEP },
      to: { postal_code: destinationCep.replace(/\D/g, "") },
      products: [
        {
          weight,
          width,
          height,
          length,
          quantity: 1,
          insurance_value: 0,
        },
      ],
    };

    console.log("MelhorEnvio request:", JSON.stringify(body));

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2/me/shipment/calculate`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            "User-Agent": "OlhosDeGato luis.carlos.lionsoft@gmail.com",
          },
          body: JSON.stringify(body),
        },
      );

      const responseText = await response.text();
      console.log("MelhorEnvio response:", response.status, responseText);

      if (!response.ok) {
        throw new AppError(`Erro ao calcular frete: ${responseText}`, 502);
      }

      const data = JSON.parse(responseText) as any[];

      const options: ShippingOption[] = [];

      for (const item of data) {
        if (item.error) continue;

        const rawName = item.name || "";
        const serviceName = FRIENDLY_NAMES[rawName] || rawName;

        options.push({
          serviceId: item.id,
          serviceName,
          company: item.company?.name || "Transportadora",
          price: parseFloat(item.custom_price || item.price),
          deliveryDays: parseInt(item.custom_delivery_time || item.delivery_time),
        });
      }

      if (options.length === 0) {
        throw new AppError("Nenhuma opção de frete disponível para este CEP", 400);
      }

      return options;
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error("MelhorEnvio fetch error:", err);
      throw new AppError("Erro ao conectar com serviço de frete", 502);
    }
  }
}
