import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateReviewUseCase } from "@application/use-cases/review/CreateReviewUseCase";
import type { IProductRepository } from "@domain/repositories/IProductRepository";
import { ReviewStatus } from "@domain/enums/index";
import { AppError } from "@shared/errors/AppError";
import { createMockProduct } from "../../../helpers";

// Mock prisma client
vi.mock("@infrastructure/database/prisma/client", () => ({
  prisma: {
    review: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@infrastructure/database/prisma/client";

describe("CreateReviewUseCase", () => {
  let sut: CreateReviewUseCase;
  let productRepository: IProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    productRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      findByCategory: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStock: vi.fn(),
      delete: vi.fn(),
      findFeatured: vi.fn(),
      findRecommended: vi.fn(),
      updateFeatured: vi.fn(),
      updateRecommended: vi.fn(),
      bulkUpdateFeatured: vi.fn(),
      bulkUpdateRecommended: vi.fn(),
    };

    sut = new CreateReviewUseCase(productRepository);
  });

  it("deve criar review com sucesso", async () => {
    const product = createMockProduct({ id: "p-1" });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.review.create).mockResolvedValue({
      id: "review-1",
      productId: "p-1",
      authorId: "customer-1",
      rating: 5,
      comment: "Excelente produto!",
      status: ReviewStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await sut.execute({
      customerId: "customer-1",
      productId: "p-1",
      rating: 5,
      comment: "Excelente produto!",
    });

    expect(result).toEqual({ id: "review-1" });
    expect(prisma.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: "p-1",
        authorId: "customer-1",
        rating: 5,
        comment: "Excelente produto!",
        status: ReviewStatus.PENDING,
      }),
    });
  });

  it("deve lançar erro se produto não encontrado", async () => {
    vi.mocked(productRepository.findById).mockResolvedValue(null);

    await expect(
      sut.execute({
        customerId: "customer-1",
        productId: "p-inexistente",
        rating: 4,
        comment: "Bom produto",
      }),
    ).rejects.toThrow("Produto não encontrado");

    expect(prisma.review.findFirst).not.toHaveBeenCalled();
  });

  it("deve lançar erro 409 se review duplicada", async () => {
    const product = createMockProduct({ id: "p-1" });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(prisma.review.findFirst).mockResolvedValue({
      id: "existing-review",
      productId: "p-1",
      authorId: "customer-1",
    } as any);

    const promise = sut.execute({
      customerId: "customer-1",
      productId: "p-1",
      rating: 3,
      comment: "Duplicada",
    });

    await expect(promise).rejects.toThrow(AppError);
    await expect(
      sut.execute({
        customerId: "customer-1",
        productId: "p-1",
        rating: 3,
        comment: "Duplicada",
      }),
    ).rejects.toThrow("Você já avaliou este produto");

    expect(prisma.review.create).not.toHaveBeenCalled();
  });

  it("deve verificar review existente com productId e authorId corretos", async () => {
    const product = createMockProduct({ id: "p-1" });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.review.create).mockResolvedValue({ id: "review-new" } as any);

    await sut.execute({
      customerId: "customer-42",
      productId: "p-1",
      rating: 4,
      comment: "Legal",
    });

    expect(prisma.review.findFirst).toHaveBeenCalledWith({
      where: {
        productId: "p-1",
        authorId: "customer-42",
      },
    });
  });
});
