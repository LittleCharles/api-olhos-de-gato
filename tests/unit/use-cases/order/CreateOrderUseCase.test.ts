import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateOrderUseCase } from "@application/use-cases/order/CreateOrderUseCase";
import { Order } from "@domain/entities/Order";
import { PaymentMethod, OrderStatus, PaymentStatus } from "@domain/enums/index";
import { AppError } from "@shared/errors/AppError";
import type { IMailProvider } from "@application/interfaces/IMailProvider";

// Mock the prisma client
vi.mock("@infrastructure/database/prisma/client", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@infrastructure/database/prisma/client";

const mockMailProvider: IMailProvider = {
  send: vi.fn(),
};

describe("CreateOrderUseCase", () => {
  let sut: CreateOrderUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    sut = new CreateOrderUseCase(mockMailProvider);
  });

  function setupTransaction(cart: any, productUpdates: any[] = []) {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        cart: {
          findUnique: vi.fn().mockResolvedValue(cart),
        },
        product: {
          update: vi.fn(),
        },
        order: {
          create: vi.fn(),
        },
        cartItem: {
          deleteMany: vi.fn(),
        },
      };

      // Setup product update mocks
      for (const update of productUpdates) {
        tx.product.update.mockResolvedValueOnce(update);
      }

      // Setup order create to return a mock order
      tx.order.create.mockImplementation(async (args: any) => ({
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
        adminId: null,
        trackingCode: null,
        items: (args.data.items?.create ?? []).map((item: any) => ({
          ...item,
          product: { name: "Test Product", images: [] },
        })),
        customer: { user: { name: "Test", email: "test@test.com" } },
        history: [],
      }));

      return callback(tx);
    });
  }

  it("deve criar pedido com sucesso a partir do carrinho", async () => {
    const cart = {
      id: "cart-1",
      customerId: "customer-1",
      items: [
        {
          id: "item-1",
          productId: "p-1",
          quantity: 2,
          createdAt: new Date(),
          product: {
            id: "p-1",
            name: "Ração Premium",
            price: 49.9,
            promoPrice: null,
            stock: 10,
            isActive: true,
            images: [],
          },
        },
      ],
    };

    setupTransaction(cart, [{ id: "p-1", stock: 8 }]);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.PIX,
    });

    expect(order).toBeInstanceOf(Order);
    expect(order.customerId).toBe("customer-1");
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(order.items).toHaveLength(1);
    expect(order.total.getValue()).toBe(99.8);
  });

  it("deve lançar erro se carrinho vazio", async () => {
    setupTransaction(null);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow("Carrinho vazio");
  });

  it("deve lançar erro se carrinho existe mas sem itens", async () => {
    setupTransaction({ id: "cart-1", customerId: "customer-1", items: [] });

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow("Carrinho vazio");
  });

  it("deve lançar erro se produto inativo", async () => {
    const cart = {
      id: "cart-1",
      customerId: "customer-1",
      items: [
        {
          id: "item-1",
          productId: "p-1",
          quantity: 1,
          createdAt: new Date(),
          product: {
            id: "p-1",
            name: "Inativo",
            price: 49.9,
            promoPrice: null,
            stock: 10,
            isActive: false,
            images: [],
          },
        },
      ],
    };

    setupTransaction(cart);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow('Produto "Inativo" está indisponível');
  });

  it("deve lançar erro se estoque insuficiente", async () => {
    const cart = {
      id: "cart-1",
      customerId: "customer-1",
      items: [
        {
          id: "item-1",
          productId: "p-1",
          quantity: 5,
          createdAt: new Date(),
          product: {
            id: "p-1",
            name: "Pouco Estoque",
            price: 49.9,
            promoPrice: null,
            stock: 1,
            isActive: true,
            images: [],
          },
        },
      ],
    };

    setupTransaction(cart);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow('Estoque insuficiente para "Pouco Estoque"');
  });

  it("deve abortar transação se estoque ficou negativo (safety check)", async () => {
    const cart = {
      id: "cart-1",
      customerId: "customer-1",
      items: [
        {
          id: "item-1",
          productId: "p-1",
          quantity: 1,
          createdAt: new Date(),
          product: {
            id: "p-1",
            name: "Race Condition",
            price: 49.9,
            promoPrice: null,
            stock: 1,
            isActive: true,
            images: [],
          },
        },
      ],
    };

    // Simulate stock going negative after decrement (race condition)
    setupTransaction(cart, [{ id: "p-1", stock: -1 }]);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toThrow('Estoque insuficiente para "Race Condition"');
  });

  it("deve usar promoPrice quando disponível", async () => {
    const cart = {
      id: "cart-1",
      customerId: "customer-1",
      items: [
        {
          id: "item-1",
          productId: "p-1",
          quantity: 2,
          createdAt: new Date(),
          product: {
            id: "p-1",
            name: "Promo",
            price: 49.9,
            promoPrice: 39.9,
            stock: 10,
            isActive: true,
            images: [],
          },
        },
      ],
    };

    setupTransaction(cart, [{ id: "p-1", stock: 8 }]);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.PIX,
    });

    // 39.9 * 2 = 79.8
    expect(order.total.getValue()).toBe(79.8);
  });
});
