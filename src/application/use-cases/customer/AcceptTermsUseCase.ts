import { injectable } from "tsyringe";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class AcceptTermsUseCase {
  async execute(userId: string): Promise<{ acceptedTermsAt: Date }> {
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      throw new AppError("Perfil de cliente não encontrado", 404);
    }
    const updated = await prisma.customer.update({
      where: { userId },
      data: { acceptedTermsAt: new Date() },
    });
    return { acceptedTermsAt: updated.acceptedTermsAt! };
  }
}
