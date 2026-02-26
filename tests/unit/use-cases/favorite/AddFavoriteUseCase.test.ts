import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddFavoriteUseCase } from "@application/use-cases/favorite/AddFavoriteUseCase";
import type { IFavoriteRepository } from "@domain/repositories/IFavoriteRepository";
import type { IProductRepository } from "@domain/repositories/IProductRepository";
import { AppError } from "@shared/errors/AppError";
import { createMockProduct } from "../../../helpers";

describe("AddFavoriteUseCase", () => {
  let sut: AddFavoriteUseCase;
  let favoriteRepository: IFavoriteRepository;
  let productRepository: IProductRepository;

  beforeEach(() => {
    favoriteRepository = {
      findByCustomerId: vi.fn(),
      findByCustomerAndProduct: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
    };

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

    sut = new AddFavoriteUseCase(favoriteRepository, productRepository);
  });

  it("deve adicionar favorito com sucesso", async () => {
    const product = createMockProduct({ id: "p-1" });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(favoriteRepository.findByCustomerAndProduct).mockResolvedValue(null);

    await sut.execute("customer-1", "p-1");

    expect(favoriteRepository.add).toHaveBeenCalledWith("customer-1", "p-1");
  });

  it("deve lançar erro se produto não encontrado", async () => {
    vi.mocked(productRepository.findById).mockResolvedValue(null);

    await expect(sut.execute("customer-1", "p-inexistente")).rejects.toThrow(
      AppError,
    );
    await expect(sut.execute("customer-1", "p-inexistente")).rejects.toThrow(
      "Produto não encontrado",
    );

    expect(favoriteRepository.add).not.toHaveBeenCalled();
  });

  it("deve lançar erro 409 se favorito duplicado", async () => {
    const product = createMockProduct({ id: "p-1" });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(favoriteRepository.findByCustomerAndProduct).mockResolvedValue({
      id: "fav-1",
    });

    const promise = sut.execute("customer-1", "p-1");
    await expect(promise).rejects.toThrow(AppError);
    await expect(sut.execute("customer-1", "p-1")).rejects.toThrow(
      "Produto já está nos favoritos",
    );

    expect(favoriteRepository.add).not.toHaveBeenCalled();
  });

  it("deve verificar duplicata com customerId e productId corretos", async () => {
    const product = createMockProduct({ id: "p-5" });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(favoriteRepository.findByCustomerAndProduct).mockResolvedValue(null);

    await sut.execute("customer-99", "p-5");

    expect(favoriteRepository.findByCustomerAndProduct).toHaveBeenCalledWith(
      "customer-99",
      "p-5",
    );
    expect(favoriteRepository.add).toHaveBeenCalledWith("customer-99", "p-5");
  });
});
