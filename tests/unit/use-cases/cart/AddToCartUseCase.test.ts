import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddToCartUseCase } from "@application/use-cases/cart/AddToCartUseCase";
import type { ICartRepository } from "@domain/repositories/ICartRepository";
import type { IProductRepository } from "@domain/repositories/IProductRepository";
import { AppError } from "@shared/errors/AppError";
import { createMockProduct } from "../../../helpers";

describe("AddToCartUseCase", () => {
  let sut: AddToCartUseCase;
  let cartRepository: ICartRepository;
  let productRepository: IProductRepository;

  beforeEach(() => {
    cartRepository = {
      findByCustomerId: vi.fn(),
      getOrCreateCart: vi.fn(),
      addItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      findItemById: vi.fn(),
      findItemByProduct: vi.fn(),
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

    sut = new AddToCartUseCase(cartRepository, productRepository);
  });

  it("deve adicionar novo item ao carrinho", async () => {
    const product = createMockProduct({ id: "p-1", stock: 10 });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(cartRepository.getOrCreateCart).mockResolvedValue("cart-1");
    vi.mocked(cartRepository.findItemByProduct).mockResolvedValue(null);

    await sut.execute("customer-1", "p-1", 2);

    expect(cartRepository.getOrCreateCart).toHaveBeenCalledWith("customer-1");
    expect(cartRepository.addItem).toHaveBeenCalledWith("cart-1", "p-1", 2);
  });

  it("deve somar quantidade se produto já existe no carrinho", async () => {
    const product = createMockProduct({ id: "p-1", stock: 10 });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(cartRepository.getOrCreateCart).mockResolvedValue("cart-1");
    vi.mocked(cartRepository.findItemByProduct).mockResolvedValue({
      id: "item-1",
      quantity: 3,
    });

    await sut.execute("customer-1", "p-1", 2);

    expect(cartRepository.updateItemQuantity).toHaveBeenCalledWith("item-1", 5);
    expect(cartRepository.addItem).not.toHaveBeenCalled();
  });

  it("deve lançar erro se produto não encontrado", async () => {
    vi.mocked(productRepository.findById).mockResolvedValue(null);

    await expect(sut.execute("customer-1", "p-inexistente", 1)).rejects.toThrow(
      AppError,
    );
    await expect(sut.execute("customer-1", "p-inexistente", 1)).rejects.toThrow(
      "Produto não encontrado",
    );
  });

  it("deve lançar erro se produto inativo", async () => {
    const product = createMockProduct({ id: "p-1", isActive: false });
    vi.mocked(productRepository.findById).mockResolvedValue(product);

    await expect(sut.execute("customer-1", "p-1", 1)).rejects.toThrow(
      "Produto indisponível",
    );
  });

  it("deve lançar erro se estoque insuficiente para novo item", async () => {
    const product = createMockProduct({ id: "p-1", stock: 2 });
    vi.mocked(productRepository.findById).mockResolvedValue(product);

    await expect(sut.execute("customer-1", "p-1", 5)).rejects.toThrow(
      "Estoque insuficiente",
    );
  });

  it("deve lançar erro se estoque insuficiente ao somar com existente", async () => {
    const product = createMockProduct({ id: "p-1", stock: 5 });
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(cartRepository.getOrCreateCart).mockResolvedValue("cart-1");
    vi.mocked(cartRepository.findItemByProduct).mockResolvedValue({
      id: "item-1",
      quantity: 4,
    });

    await expect(sut.execute("customer-1", "p-1", 3)).rejects.toThrow(
      "Estoque insuficiente",
    );
    expect(cartRepository.updateItemQuantity).not.toHaveBeenCalled();
  });
});
