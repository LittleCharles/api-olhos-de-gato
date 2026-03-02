import { prisma } from "../prisma/client.js";
import {
  IMarketplaceListingRepository,
  MarketplaceListingFilters,
  MarketplaceListingPaginationParams,
  PaginatedMarketplaceListings,
} from "../../../domain/repositories/IMarketplaceListingRepository.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { MarketplaceListingStatus } from "../../../domain/enums/index.js";
import { Prisma } from "@prisma/client";

export class PrismaMarketplaceListingRepository implements IMarketplaceListingRepository {
  async findById(id: string): Promise<MarketplaceListing | null> {
    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) return null;
    return this.mapToEntity(listing);
  }

  async findByAccountAndProduct(accountId: string, productId: string): Promise<MarketplaceListing | null> {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { accountId_productId: { accountId, productId } },
    });
    if (!listing) return null;
    return this.mapToEntity(listing);
  }

  async findAll(
    filters?: MarketplaceListingFilters,
    pagination?: MarketplaceListingPaginationParams,
  ): Promise<PaginatedMarketplaceListings> {
    const where: Prisma.MarketplaceListingWhereInput = {};

    if (filters?.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          account: { select: { platform: true } },
          product: { select: { name: true, sku: true, stock: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    return {
      data: listings.map((l) => this.mapToEntity(l)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActiveByAccountId(accountId: string): Promise<MarketplaceListing[]> {
    const listings = await prisma.marketplaceListing.findMany({
      where: { accountId, status: "ACTIVE" },
    });
    return listings.map((l) => this.mapToEntity(l));
  }

  async findByProductId(productId: string): Promise<MarketplaceListing[]> {
    const listings = await prisma.marketplaceListing.findMany({
      where: { productId },
      include: {
        account: { select: { platform: true } },
      },
    });
    return listings.map((l) => this.mapToEntity(l));
  }

  async create(listing: MarketplaceListing): Promise<MarketplaceListing> {
    const created = await prisma.marketplaceListing.create({
      data: {
        id: listing.id,
        accountId: listing.accountId,
        productId: listing.productId,
        externalId: listing.externalId,
        externalUrl: listing.externalUrl,
        price: listing.price.getValue(),
        status: listing.status,
        lastSyncAt: listing.lastSyncAt,
        lastError: listing.lastError,
        categoryMapping: listing.categoryMapping,
        metadata: listing.metadata ?? undefined,
      },
    });
    return this.mapToEntity(created);
  }

  async update(listing: MarketplaceListing): Promise<MarketplaceListing> {
    const updated = await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: {
        externalId: listing.externalId,
        externalUrl: listing.externalUrl,
        price: listing.price.getValue(),
        status: listing.status,
        lastSyncAt: listing.lastSyncAt,
        lastError: listing.lastError,
        categoryMapping: listing.categoryMapping,
        metadata: listing.metadata ?? undefined,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.marketplaceListing.delete({ where: { id } });
  }

  private mapToEntity(data: any): MarketplaceListing {
    return new MarketplaceListing({
      id: data.id,
      accountId: data.accountId,
      productId: data.productId,
      externalId: data.externalId,
      externalUrl: data.externalUrl,
      price: Money.create(Number(data.price)),
      status: data.status as MarketplaceListingStatus,
      lastSyncAt: data.lastSyncAt,
      lastError: data.lastError,
      categoryMapping: data.categoryMapping,
      metadata: data.metadata as Record<string, unknown> | null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
