import { injectable } from "tsyringe";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

// Cache em escopo de módulo: o container resolve o use-case como transient (nova instância
// por request), então um campo de instância não persistiria entre requests.
let feedCache: { xml: string; at: number } | null = null;

/**
 * Gera o feed de produtos no formato RSS 2.0 do Google Merchant Center (Shopping/PMax).
 * Rota pública (o Merchant busca a URL sozinho). Cacheado 1h pra não bater no banco a cada fetch.
 */
@injectable()
export class GenerateGoogleMerchantFeedUseCase {
  async execute(): Promise<string> {
    if (feedCache && Date.now() - feedCache.at < CACHE_TTL_MS) {
      return feedCache.xml;
    }
    const xml = await this.build();
    feedCache = { xml, at: Date.now() };
    return xml;
  }

  private async build(): Promise<string> {
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: [{ isMain: "desc" }, { order: "asc" }], take: 1 },
        brand: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const items: string[] = [];
    for (const p of products) {
      const image = p.images[0]?.url;
      if (!image) continue; // Merchant exige image_link

      const price = Number(p.price);
      if (!(price > 0)) continue;

      const imageLink = image.startsWith("http")
        ? image
        : `${frontendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
      const link = `${frontendUrl}/produto/${p.slug}`;
      const description = stripHtml(p.description || p.name).slice(0, 5000) || p.name;
      const availability = p.stock > 0 ? "in_stock" : "out_of_stock";
      const promo = p.promoPrice != null ? Number(p.promoPrice) : null;

      const parts = [
        `<g:id>${escapeXml(p.sku)}</g:id>`,
        `<g:title>${escapeXml(p.name)}</g:title>`,
        `<g:description>${escapeXml(description)}</g:description>`,
        `<g:link>${escapeXml(link)}</g:link>`,
        `<g:image_link>${escapeXml(imageLink)}</g:image_link>`,
        `<g:availability>${availability}</g:availability>`,
        `<g:price>${price.toFixed(2)} BRL</g:price>`,
        `<g:condition>new</g:condition>`,
        `<g:mpn>${escapeXml(p.sku)}</g:mpn>`,
      ];
      if (promo != null && promo > 0 && promo < price) {
        parts.push(`<g:sale_price>${promo.toFixed(2)} BRL</g:sale_price>`);
      }
      if (p.brand?.name) parts.push(`<g:brand>${escapeXml(p.brand.name)}</g:brand>`);
      if (p.ean) parts.push(`<g:gtin>${escapeXml(p.ean)}</g:gtin>`);

      items.push(`    <item>\n      ${parts.join("\n      ")}\n    </item>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Olhos de Gato</title>
    <link>${escapeXml(frontendUrl)}</link>
    <description>Feed de produtos Olhos de Gato para o Google Merchant Center</description>
${items.join("\n")}
  </channel>
</rss>`;
  }
}
