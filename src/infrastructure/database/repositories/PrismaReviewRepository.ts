import { prisma } from "../prisma/client.js";
import {
  IReviewRepository,
  ReviewFilters,
  ReviewStats,
} from "../../../domain/repositories/IReviewRepository.js";
import { Review } from "../../../domain/entities/Review.js";
import { ReviewStatus } from "../../../domain/enums/index.js";
import {
  PaginatedResult,
  PaginationParams,
} from "../../../domain/repositories/IProductRepository.js";
import { Prisma } from "@prisma/client";

export class PrismaReviewRepository implements IReviewRepository {
  async findById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        author: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!review) return null;
    return this.mapToEntity(review);
  }

  async findAll(
    filters?: ReviewFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Review>> {
    const where: Prisma.ReviewWhereInput = {};

    if (filters?.search) {
      where.OR = [
        {
          product: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
        { comment: { contains: filters.search, mode: "insensitive" } },
      ];
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

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: { select: { id: true, name: true } },
          author: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      data: reviews.map((r) => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(review: Review): Promise<Review> {
    await prisma.review.update({
      where: { id: review.id },
      data: {
        status: review.status,
        updatedAt: new Date(),
      },
    });

    const updated = await this.findById(review.id);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } });
  }

  async getStats(): Promise<ReviewStats> {
    const [total, avgResult, pendingCount] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);

    return {
      totalReviews: total,
      avgRating: avgResult._avg.rating ?? 0,
      pendingCount,
    };
  }

  private mapToEntity(data: any): Review {
    return new Review({
      id: data.id,
      productId: data.productId,
      productName: data.product?.name ?? null,
      authorId: data.authorId,
      authorName: data.author?.user?.name ?? null,
      rating: data.rating,
      comment: data.comment,
      status: data.status as ReviewStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
