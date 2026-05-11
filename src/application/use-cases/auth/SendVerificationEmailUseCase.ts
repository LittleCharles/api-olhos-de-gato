import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { VERIFY_EMAIL_TOKEN_LIFETIME_MS } from "../../../shared/auth-constants.js";
import { buildVerifyEmail } from "../../../infrastructure/providers/mail/templates/verifyEmail.js";
import { getStoreInfoForEmail } from "../../../infrastructure/providers/mail/storeInfoForEmail.js";

@injectable()
export class SendVerificationEmailUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("StoreSettingsRepository")
    private storeSettingsRepository: IStoreSettingsRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) {}

  /**
   * Gera um novo token + envia email. Usado no Register e no Resend.
   * Não throw se mail falhar — log e segue (não bloqueia o fluxo principal).
   */
  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;
    if (user.emailVerifiedAt) return; // já verificado, não precisa reenviar

    const token = randomUUID();
    const expiry = new Date(Date.now() + VERIFY_EMAIL_TOKEN_LIFETIME_MS);
    user.setEmailVerifyToken(token, expiry);
    await this.userRepository.update(user);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verifyUrl = `${frontendUrl}/verificar-email?token=${token}`;

    const storeInfo = await getStoreInfoForEmail(this.storeSettingsRepository);

    try {
      const email = buildVerifyEmail({
        customerName: user.name,
        verifyUrl,
        storeInfo,
      });
      await this.mailProvider.send({
        to: user.email.getValue(),
        ...email,
      });
    } catch (err) {
      console.error("[SendVerificationEmail] Falha ao enviar email:", err);
    }
  }
}
