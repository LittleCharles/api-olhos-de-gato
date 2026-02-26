import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateOrderUseCase } from "@application/use-cases/order/CreateOrderUseCase";
import type { IOrderRepository } from "@domain/repositories/IOrderRepository";
import type { ICartRepository } from "@domain/repositories/ICartRepository";
import type { IProductRepository } from "@domain/repositories/IProductRepository";
import { Order } from "@domain/entities/Order";
import { PaymentMethod, OrderStatus, PaymentStatus } from "@domain/enums/index";
import { AppError } from "@shared/errors/AppError";
import { createMockProduct, createMockCart, createMockCartItem } from "../../../helpers";

describe("CreateOrderUseCase", () => {
  let sut: CreateOrderUseCase;
  let orderRepository: IOrderRepository;
  let cartRepository: ICartRepository;
  let productRepository: IProductRepository;

  beforeEach(() => {
    orderRepository = {
      findById: vi.fn(),
      findByCustomer: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockImplementation((order: Order) => Promise.resolve(order)),
      update: vi.fn(),
      addStatusHistory: vi.fn(),
      updateTrackingCode: vi.fn(),
      findByIdWithDetails: vi.fn(),
    };

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

    sut = new CreateOrderUseCase(orderRepository, cartRepository, productRepository);
  });

  it("deve criar pedido com sucesso e limpar o carrinho", async () => {
    const product = createMockProduct({ id: "p-1", stock: 10, price: 49.9 });
    const cart = createMockCart({
      id: "cart-1",
      customerId: "customer-1",
      items: [createMockCartItem({ productId: "p-1", quantity: 2, productPrice: 49.9 })],
    });

    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById).mockResolvedValue(product);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.PIX,
      notes: "Entregar na portaria",
    });

    expect(order).toBeInstanceOf(Order);
    expect(order.customerId).toBe("customer-1");
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(order.paymentMethod).toBe(PaymentMethod.PIX);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.total.getValue()).toBe(99.8);

    expect(orderRepository.create).toHaveBeenCalledTimes(1);
    expect(cartRepository.clearCart).toHaveBeenCalledWith("cart-1");
  });

  it("deve criar pedido com múltiplos itens", async () => {
    const product1 = createMockProduct({ id: "p-1", stock: 10, price: 49.9 });
    const product2 = createMockProduct({ id: "p-2", name: "Brinquedo", stock: 5, price: 29.9 });

    const cart = createMockCart({
      id: "cart-1",
      customerId: "customer-1",
      items: [
        createMockCartItem({ productId: "p-1", quantity: 1 }),
        createMockCartItem({ id: "item-2", productId: "p-2", quantity: 3, productName: "Brinquedo" }),
      ],
    });

    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById)
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(product2);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    expect(order.items).toHaveLength(2);
    // 49.9 * 1 + 29.9 * 3 = 49.9 + 89.7 = 139.6
    expect(order.total.getValue()).toBe(139.6);
  });

  it("deve usar promoPrice quando disponível", async () => {
    const product = createMockProduct({ id: "p-1", stock: 10, price: 49.9, promoPrice: 39.9 });
    const cart = createMockCart({
      id: "cart-1",
      customerId: "customer-1",
      items: [createMockCartItem({ productId: "p-1", quantity: 2 })],
    });

    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById).mockResolvedValue(product);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.PIX,
    });

    // 39.9 * 2 = 79.8
    expect(order.total.getValue()).toBe(79.8);
  });

  it("deve lançar erro se carrinho vazio", async () => {
    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(null);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow("Carrinho vazio");
  });

  it("deve lançar erro se carrinho existe mas sem itens", async () => {
    const emptyCart = createMockCart({ id: "cart-1", customerId: "customer-1", items: [] });
    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(emptyCart);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow("Carrinho vazio");
  });

  it("deve lançar erro se produto do carrinho não encontrado", async () => {
    const cart = createMockCart({
      items: [createMockCartItem({ productId: "p-removed", productName: "Removido" })],
    });
    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById).mockResolvedValue(null);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow('Produto "Removido" não encontrado');
  });

  it("deve lançar erro se produto inativo", async () => {
    const product = createMockProduct({ id: "p-1", isActive: false, name: "Inativo" });
    const cart = createMockCart({
      items: [createMockCartItem({ productId: "p-1" })],
    });
    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById).mockResolvedValue(product);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow('Produto "Inativo" está indisponível');
  });

  it("deve lançar erro se estoque insuficiente", async () => {
    const product = createMockProduct({ id: "p-1", stock: 1, name: "Pouco Estoque" });
    const cart = createMockCart({
      items: [createMockCartItem({ productId: "p-1", quantity: 5 })],
    });
    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById).mockResolvedValue(product);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow('Estoque insuficiente para "Pouco Estoque"');
  });

  it("não deve limpar carrinho se criação do pedido falhar", async () => {
    const product = createMockProduct({ id: "p-1", stock: 10 });
    const cart = createMockCart({
      items: [createMockCartItem({ productId: "p-1", quantity: 1 })],
    });
    vi.mocked(cartRepository.findByCustomerId).mockResolvedValue(cart);
    vi.mocked(productRepository.findById).mockResolvedValue(product);
    vi.mocked(orderRepository.create).mockRejectedValue(new Error("DB error"));

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow("DB error");

    expect(cartRepository.clearCart).not.toHaveBeenCalled();
  });
});
