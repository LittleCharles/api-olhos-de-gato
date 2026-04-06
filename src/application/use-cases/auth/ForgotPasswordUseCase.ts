import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { ForgotPasswordDTO } from "../../dtos/AuthDTO.js";
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

      await this.mailProvider.send({
        to: user.email.getValue(),
        subject: "Redefinir sua senha - Olhos de Gato",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Redefinir sua senha</h2>
            <p>Olá <strong>${user.name}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}"
                 style="background-color: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Redefinir senha
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Este link expira em <strong>1 hora</strong>.</p>
            <p style="color: #666; font-size: 14px;">Se você não solicitou a redefinição de senha, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">Olhos de Gato - Petshop</p>
          </div>
        `,
      });
    }

    return {
      message: "Se o email estiver cadastrado, enviaremos instruções para redefinir sua senha",
    };
  }
}
