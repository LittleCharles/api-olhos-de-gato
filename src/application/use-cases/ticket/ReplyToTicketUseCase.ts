import { inject, injectable } from "tsyringe";
import type { ISupportTicketRepository } from "../../../domain/repositories/ISupportTicketRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { TicketReply } from "../../../domain/entities/TicketReply.js";
import { TicketStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class ReplyToTicketUseCase {
  constructor(
    @inject("SupportTicketRepository")
    private supportTicketRepository: ISupportTicketRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) {}

  async execute(ticketId: string, message: string): Promise<TicketReply> {
    const ticket = await this.supportTicketRepository.findById(ticketId);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    const reply = await this.supportTicketRepository.addReply(
      ticketId,
      message,
      true,
    );

    if (ticket.status === TicketStatus.OPEN) {
      ticket.markInProgress();
      await this.supportTicketRepository.update(ticket);
    }

    const subjectLabels: Record<string, string> = {
      PEDIDO: "Dúvidas sobre pedido",
      PRODUTO: "Dúvidas sobre produto",
      TROCA: "Troca ou devolução",
      OUTRO: "Outro assunto",
    };

    await this.mailProvider.send({
      to: ticket.email,
      subject: `Re: ${subjectLabels[ticket.subject] ?? ticket.subject} - Olhos de Gato`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ec4899; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Olhos de Gato - Suporte</h1>
          </div>
          <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151;">Olá, <strong>${ticket.name}</strong>!</p>
            <p style="color: #374151;">Recebemos sua mensagem e aqui está nossa resposta:</p>
            <div style="background: white; border-left: 4px solid #ec4899; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <p style="color: #374151; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Se precisar de mais alguma coisa, basta responder este e-mail ou acessar nossa central de atendimento.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">Olhos de Gato - Tudo para seu felino</p>
          </div>
        </div>
      `,
    });

    return reply;
  }
}
