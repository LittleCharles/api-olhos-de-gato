import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { ForgotPasswordDTO } from "../../dtos/AuthDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { RESET_PASSWORD_TOKEN_LIFETIME_MS } from "../../../shared/auth-constants.js";
import {
  baseLayout,
  escapeHtmlValue,
} from "../../../infrastructure/providers/mail/templates/baseLayout.js";
import { getStoreInfoForEmail } from "../../../infrastructure/providers/mail/storeInfoForEmail.js";
import { randomUUID } from "crypto";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("StoreSettingsRepository")
    private storeSettingsRepository: IStoreSettingsRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) { }

  async execute(data: ForgotPasswordDTO): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(data.email.toLowerCase().trim());

    if (user) {
      const token = randomUUID();
      const expiry = new Date(Date.now() + RESET_PASSWORD_TOKEN_LIFETIME_MS);

      user.setResetToken(token, expiry);
      await this.userRepository.update(user);

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      const safeName = escapeHtmlValue(user.name);

      const storeInfo = await getStoreInfoForEmail(this.storeSettingsRepository);

      const content = `
        <h1 style="margin:0 0 16px; font-size:22px; font-weight:700; color:#18181b; line-height:1.3;">Vamos redefinir sua senha</h1>
        <p style="margin:0 0 14px; color:#3f3f46; font-size:15px; line-height:1.6;">Olá, <strong>${safeName}</strong>! Recebemos um pedido para criar uma nova senha na sua conta do Olhos de Gato.</p>
        <p style="margin:0 0 8px; color:#3f3f46; font-size:15px; line-height:1.6;">Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
      `;

      const html = baseLayout({
        title: "Redefinir sua senha",
        preview: "Link de redefinição válido por 1 hora",
        content,
        cta: { label: "Redefinir minha senha", url: resetLink },
        storeInfo,
      });

      try {
        await this.mailProvider.send({
          to: user.email.getValue(),
          subject: "Redefinir sua senha — Olhos de Gato",
          html,
        });
      } catch (err) {
        console.error("[ForgotPassword] Falha ao enviar email:", err);
        throw new AppError(
          "Não foi possível enviar o email agora. Tente novamente em alguns minutos.",
          503,
        );
      }
    }

    return {
      message: "Se o email estiver cadastrado, enviaremos instruções para redefinir sua senha",
    };
  }
}
