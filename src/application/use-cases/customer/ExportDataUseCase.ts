import { injectable } from "tsyringe";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";

/**
 * Export de dados pessoais (LGPD Art. 18 - direito de portabilidade).
 * Retorna JSON com tudo que pertence ao customer.
 */
@injectable()
export class ExportDataUseCase {
  async execute(userId: string): Promise<Record<string, unknown>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true,
        emailVerifiedAt: true, createdAt: true,
      },
    });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              select: {
                quantity: true,
                unitPrice: true,
                total: true,
                product: { select: { name: true } },
              },
            },
            history: true,
          },
        },
        reviews: { select: { id: true, productId: true, rating: true, comment: true, status: true, createdAt: true } },
        favorites: { select: { id: true, productId: true, createdAt: true } },
        supportTickets: { select: { id: true, subject: true, message: true, status: true, createdAt: true } },
      },
    });

    return {
      generatedAt: new Date().toISOString(),
      profile: {
        ...user,
        cpf: customer?.cpf ?? null,
        birthDate: customer?.birthDate ?? null,
        acceptedTermsAt: customer?.acceptedTermsAt ?? null,
      },
      addresses: customer?.addresses ?? [],
      orders: customer?.orders ?? [],
      reviews: customer?.reviews ?? [],
      favorites: customer?.favorites ?? [],
      supportTickets: customer?.supportTickets ?? [],
    };
  }
}
