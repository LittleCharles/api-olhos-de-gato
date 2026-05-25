import { z } from "zod";
import { PaymentMethod } from "../../domain/enums/index.js";

export const CustomerCreateOrderSchema = z
  .object({
    paymentMethod: z.nativeEnum(PaymentMethod),
    addressId: z.string().uuid().optional(),
    notes: z.string().optional(),
    pickupLocation: z.string().optional(),
    // Frete: o cliente só indica QUAL serviço escolheu; o preço é recotado no servidor
    // (Melhor Envio) a partir do endereço + carrinho. Não confiamos em valor vindo do cliente.
    shippingServiceId: z.number().int().positive().optional(),
  })
  .refine(
    (data) => Boolean(data.addressId) !== Boolean(data.pickupLocation),
    {
      message: "Informe um endereço de entrega OU um local de retirada (apenas um)",
      path: ["addressId"],
    },
  )
  .refine(
    (data) => !data.addressId || data.shippingServiceId !== undefined,
    {
      message: "Selecione uma opção de frete",
      path: ["shippingServiceId"],
    },
  );

export const CustomerOrderFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CreateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export type CustomerCreateOrderDTO = z.infer<typeof CustomerCreateOrderSchema>;
export type CustomerOrderFiltersDTO = z.infer<typeof CustomerOrderFiltersSchema>;
export type CreateReviewDTO = z.infer<typeof CreateReviewSchema>;
