import { injectable } from "tsyringe";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";

/**
 * Exclusão de conta com anonimização (LGPD Art. 18).
 *
 * Pedidos são preservados (obrigação fiscal) mas linkados ao user anonimizado.
 * Dados pessoais (nome, email, phone, CPF, endereços, favoritos, carrinho, reviews) são apagados/anonimizados.
 */
@injectable()
export class DeleteAccountUseCase {
  async execute(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { userId } });

      if (customer) {
        // Apagar dados pessoais relacionados
        await tx.address.deleteMany({ where: { customerId: customer.id } });
        await tx.favorite.deleteMany({ where: { customerId: customer.id } });
        await tx.cartItem.deleteMany({
          where: { cart: { customerId: customer.id } },
        });
        await tx.cart.deleteMany({ where: { customerId: customer.id } });
        // Reviews continuam mas o nome do autor vem via join (user.name = "Cliente removido"),
        // então automaticamente ficam anonimizadas após o anonymize do user abaixo.

        // Anonimiza customer
        await tx.customer.update({
          where: { id: customer.id },
          data: { cpf: null, birthDate: null },
        });
      }

      // Anonimiza user (impede login: passwordHash vazio + isActive false)
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@anonimo.local`,
          name: "Cliente removido",
          phone: null,
          passwordHash: "",
          isActive: false,
          resetToken: null,
          resetTokenExpiry: null,
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
      });
    });
  }
}
