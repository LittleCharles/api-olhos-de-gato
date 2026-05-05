import nodemailer from "nodemailer";
import type { IMailProvider, SendMailData } from "../../../application/interfaces/IMailProvider.js";

export class NodemailerMailProvider implements IMailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    const isProd = process.env.NODE_ENV === "production";
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Em dev, aceita cert self-signed (comum quando antivírus/proxy intercepta TLS).
      // Em prod valida normalmente pra não baixar a barra de segurança.
      tls: isProd ? undefined : { rejectUnauthorized: false },
      // Sem isso o sendMail pode pendurar minutos quando SMTP estiver fora (Mailtrap travou,
      // DNS demora, firewall corta) e a request HTTP que chamou send() trava junto.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }

  async send(data: SendMailData): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || "Olhos de Gato <noreply@olhosdegato.com.br>",
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
