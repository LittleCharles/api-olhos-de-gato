import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateOrderUseCase } from "@application/use-cases/order/CreateOrderUseCase";
import { Order } from "@domain/entities/Order";
import { PaymentMethod, OrderStatus, PaymentStatus } from "@domain/enums/index";
import type { IAddressRepository } from "@domain/repositories/IAddressRepository";
import type { ICustomerRepository } from "@domain/repositories/ICustomerRepository";
import type { CalculateShippingUseCase } from "@application/use-cases/shipping/CalculateShippingUseCase";

// Mock the prisma client
vi.mock("@infrastructure/database/prisma/client", () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
    },
    cart: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@infrastructure/database/prisma/client";

const mockAddressRepository: IAddressRepository = {
  findById: vi.fn(),
} as unknown as IAddressRepository;

const mockCustomerRepository: ICustomerRepository = {
  findById: vi.fn(),
} as unknown as ICustomerRepository;

const calculateShippingExecute = vi.fn();
const mockCalculateShipping = {
  execute: calculateShippingExecute,
} as unknown as CalculateShippingUseCase;

const DELIVERY_ADDRESS = {
  id: "addr-1",
  customerId: "customer-1",
  zipCode: "18000000",
  street: "Rua X",
  number: "100",
  complement: null,
  neighborhood: "Centro",
  city: "Sorocaba",
  state: "SP",
};

describe("CreateOrderUseCase", () => {
  let sut: CreateOrderUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: customer com cadastro completo + email verificado (passa pelos guards)
    vi.mocked(mockCustomerRepository.findById).mockResolvedValue({
      id: "customer-1",
      userId: "user-1",
      cpf: "12345678900",
      phone: "11999999999",
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      emailVerifiedAt: new Date(),
    } as any);
    sut = new CreateOrderUseCase(
      mockAddressRepository,
      mockCustomerRepository,
      mockCalculateShipping,
    );
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

  // ==================== Frete recalculado no servidor (M1) ====================

  it("deve recalcular o frete no servidor para entrega (ignora qualquer valor do cliente)", async () => {
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
            name: "Ração",
            price: 49.9,
            promoPrice: null,
            stock: 10,
            isActive: true,
            images: [],
          },
        },
      ],
    };

    vi.mocked(mockAddressRepository.findById).mockResolvedValue(DELIVERY_ADDRESS as any);
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      items: [{ productId: "p-1", quantity: 2 }],
    } as any);
    calculateShippingExecute.mockResolvedValue([
      { serviceId: 1, serviceName: "PAC", company: "Correios", price: 25, deliveryDays: 5 },
      { serviceId: 2, serviceName: "SEDEX", company: "Correios", price: 40, deliveryDays: 2 },
    ]);

    setupTransaction(cart, [{ id: "p-1", stock: 8 }]);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.PIX,
      addressId: "addr-1",
      shippingServiceId: 1,
    });

    expect(calculateShippingExecute).toHaveBeenCalledWith({
      zipCode: "18000000",
      items: [{ productId: "p-1", quantity: 2 }],
    });
    // subtotal 99.8 + frete recotado no servidor (25), nunca um valor vindo do cliente
    expect(order.shippingCost?.getValue()).toBe(25);
    expect(order.total.getValue()).toBe(124.8);
  });

  it("deve rejeitar quando o serviço de frete escolhido não existe na recotação", async () => {
    vi.mocked(mockAddressRepository.findById).mockResolvedValue(DELIVERY_ADDRESS as any);
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      items: [{ productId: "p-1", quantity: 1 }],
    } as any);
    calculateShippingExecute.mockResolvedValue([
      { serviceId: 1, serviceName: "PAC", company: "Correios", price: 25, deliveryDays: 5 },
    ]);

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
        addressId: "addr-1",
        shippingServiceId: 999,
      }),
    ).rejects.toThrow("Opção de frete inválida ou indisponível");
  });

  it("deve propagar erro se a cotação de frete falhar (não cai pro valor do cliente)", async () => {
    vi.mocked(mockAddressRepository.findById).mockResolvedValue(DELIVERY_ADDRESS as any);
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      items: [{ productId: "p-1", quantity: 1 }],
    } as any);
    calculateShippingExecute.mockRejectedValue(new Error("Melhor Envio indisponível"));

    await expect(
      sut.execute({
        customerId: "customer-1",
        paymentMethod: PaymentMethod.PIX,
        addressId: "addr-1",
        shippingServiceId: 1,
      }),
    ).rejects.toThrow("Melhor Envio indisponível");
  });

  it("não cota frete e cobra zero na retirada na loja (pickup)", async () => {
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
            name: "Ração",
            price: 50,
            promoPrice: null,
            stock: 10,
            isActive: true,
            images: [],
          },
        },
      ],
    };

    setupTransaction(cart, [{ id: "p-1", stock: 9 }]);

    const order = await sut.execute({
      customerId: "customer-1",
      paymentMethod: PaymentMethod.PIX,
      pickupLocation: "Loja Centro",
    });

    expect(calculateShippingExecute).not.toHaveBeenCalled();
    expect(order.shippingCost?.getValue()).toBe(0);
    expect(order.total.getValue()).toBe(50);
  });
});
