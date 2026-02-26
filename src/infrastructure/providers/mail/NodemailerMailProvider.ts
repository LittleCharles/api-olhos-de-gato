import nodemailer from "nodemailer";
import type { IMailProvider, SendMailData } from "../../../application/interfaces/IMailProvider.js";

export class NodemailerMailProvider implements IMailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async send(data: SendMailData): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || "Olhos de Gato <noreply@olhosdegato.com.br>",
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  }
}
