import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { ForgotPasswordDTO } from "../../dtos/AuthDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  baseLayout,
  escapeHtmlValue,
} from "../../../infrastructure/providers/mail/templates/baseLayout.js";
import { randomUUID } from "crypto";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) { }

  async execute(data: ForgotPasswordDTO): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(data.email.toLowerCase().trim());

    if (user) {
      const token = randomUUID();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      user.setResetToken(token, expiry);
      await this.userRepository.update(user);

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      const safeName = escapeHtmlValue(user.name);

      const content = `
        <h2 style="margin:0 0 16px; font-size:20px; color:#18181b;">Redefinir sua senha</h2>
        <p style="margin:0 0 12px; color:#3f3f46;">Olá <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 12px; color:#3f3f46;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
        <p style="margin:0; color:#71717a; font-size:13px;">O link expira em <strong>1 hora</strong>. Se você não solicitou, pode ignorar esta mensagem — sua senha atual continua válida.</p>
      `;

      const html = baseLayout({
        title: "Redefinir sua senha",
        preview: "Link de redefinição válido por 1 hora",
        content,
        cta: { label: "Redefinir senha", url: resetLink },
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
