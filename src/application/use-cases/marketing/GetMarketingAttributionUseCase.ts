import { injectable } from "tsyringe";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

export interface MarketingChannelRow {
  source: string;
  medium: string;
  campaign: string;
  orders: number;
  paidOrders: number;
  revenue: number;
  revenueFormatted: string;
  aov: number;
}

export interface MarketingAttribution {
  period: string;
  totals: {
    orders: number;
    paidOrders: number;
    revenue: number;
    revenueFormatted: string;
    aov: number;
    aovFormatted: string;
    // Pedidos pagos que vieram de um clique do Google Ads (têm gclid). Atribuição first-party.
    googleAdsOrders: number;
    googleAdsRevenue: number;
    googleAdsRevenueFormatted: string;
  };
  channels: MarketingChannelRow[];
  // false enquanto nenhum pedido tiver UTM/gclid (ex.: antes de começar a rodar Ads).
  hasAttributionData: boolean;
}

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function periodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, 1);
    case "30d":
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Atribuição first-party: cruza os pedidos (receita real PAID) com a origem de marketing
 * capturada no pedido (UTM/gclid). Agregação em JS (mesmo estilo do getSalesChart) — volume
 * baixo numa loja iniciante e evita groupBy com nulls.
 */
@injectable()
export class GetMarketingAttributionUseCase {
  async execute(period: string): Promise<MarketingAttribution> {
    const start = periodStart(period);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start }, status: { not: "CANCELLED" } },
      select: {
        total: true,
        paymentStatus: true,
        source: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        gclid: true,
      },
    });

    const map = new Map<string, MarketingChannelRow>();
    let totOrders = 0;
    let totPaid = 0;
    let totRevenue = 0;
    let gAdsOrders = 0;
    let gAdsRevenue = 0;
    let hasAttribution = false;

    for (const o of orders) {
      const isPaid = o.paymentStatus === "PAID";
      const value = Number(o.total);

      const utmS = o.utmSource?.trim();
      const utmM = o.utmMedium?.trim();
      const utmC = o.utmCampaign?.trim();
      if (utmS || utmM || utmC || o.gclid) hasAttribution = true;

      const source =
        utmS || (o.source && o.source !== "DIRECT" ? o.source.toLowerCase() : "direto");
      const medium = utmM || (utmS ? "(não definido)" : "orgânico/direto");
      const campaign = utmC || "(nenhuma)";
      const key = `${source}||${medium}||${campaign}`;

      let row = map.get(key);
      if (!row) {
        row = {
          source,
          medium,
          campaign,
          orders: 0,
          paidOrders: 0,
          revenue: 0,
          revenueFormatted: "",
          aov: 0,
        };
        map.set(key, row);
      }
      row.orders += 1;
      totOrders += 1;
      if (isPaid) {
        row.paidOrders += 1;
        row.revenue += value;
        totPaid += 1;
        totRevenue += value;
        if (o.gclid) {
          gAdsOrders += 1;
          gAdsRevenue += value;
        }
      }
    }

    const channels = Array.from(map.values())
      .map((r) => ({
        ...r,
        revenue: Math.round(r.revenue * 100) / 100,
        revenueFormatted: brl(r.revenue),
        aov: r.paidOrders > 0 ? Math.round((r.revenue / r.paidOrders) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);

    return {
      period,
      totals: {
        orders: totOrders,
        paidOrders: totPaid,
        revenue: Math.round(totRevenue * 100) / 100,
        revenueFormatted: brl(totRevenue),
        aov: totPaid > 0 ? Math.round((totRevenue / totPaid) * 100) / 100 : 0,
        aovFormatted: brl(totPaid > 0 ? totRevenue / totPaid : 0),
        googleAdsOrders: gAdsOrders,
        googleAdsRevenue: Math.round(gAdsRevenue * 100) / 100,
        googleAdsRevenueFormatted: brl(gAdsRevenue),
      },
      channels,
      hasAttributionData: hasAttribution,
    };
  }
}
