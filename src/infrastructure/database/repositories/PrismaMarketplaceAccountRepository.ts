import { prisma } from "../prisma/client.js";
import { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import { MarketplaceAccount } from "../../../domain/entities/MarketplaceAccount.js";
import { MarketplacePlatform } from "../../../domain/enums/index.js";
import { Prisma } from "@prisma/client";

export class PrismaMarketplaceAccountRepository implements IMarketplaceAccountRepository {
  async findById(id: string): Promise<MarketplaceAccount | null> {
    const account = await prisma.marketplaceAccount.findUnique({ where: { id } });
    if (!account) return null;
    return this.mapToEntity(account);
  }

  async findByPlatform(platform: MarketplacePlatform): Promise<MarketplaceAccount | null> {
    const account = await prisma.marketplaceAccount.findUnique({ where: { platform } });
    if (!account) return null;
    return this.mapToEntity(account);
  }

  async findAll(): Promise<MarketplaceAccount[]> {
    const accounts = await prisma.marketplaceAccount.findMany({
      orderBy: { createdAt: "asc" },
    });
    return accounts.map((a) => this.mapToEntity(a));
  }

  async findActive(): Promise<MarketplaceAccount[]> {
    const accounts = await prisma.marketplaceAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return accounts.map((a) => this.mapToEntity(a));
  }

  async create(account: MarketplaceAccount): Promise<MarketplaceAccount> {
    const created = await prisma.marketplaceAccount.create({
      data: {
        id: account.id,
        platform: account.platform,
        sellerId: account.sellerId,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        tokenExpiresAt: account.tokenExpiresAt,
        isActive: account.isActive,
        metadata: (account.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
    return this.mapToEntity(created);
  }

  async update(account: MarketplaceAccount): Promise<MarketplaceAccount> {
    const updated = await prisma.marketplaceAccount.update({
      where: { id: account.id },
      data: {
        sellerId: account.sellerId,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        tokenExpiresAt: account.tokenExpiresAt,
        isActive: account.isActive,
        metadata: (account.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.marketplaceAccount.delete({ where: { id } });
  }

  private mapToEntity(data: any): MarketplaceAccount {
    return new MarketplaceAccount({
      id: data.id,
      platform: data.platform as MarketplacePlatform,
      sellerId: data.sellerId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiresAt: data.tokenExpiresAt,
      isActive: data.isActive,
      metadata: data.metadata as Record<string, unknown> | null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
