import { inject, injectable } from "tsyringe";
import type { ISupportTicketRepository } from "../../../domain/repositories/ISupportTicketRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { TicketReply } from "../../../domain/entities/TicketReply.js";
import { TicketStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  baseLayout,
  escapeHtmlValue,
} from "../../../infrastructure/providers/mail/templates/baseLayout.js";

const subjectLabels: Record<string, string> = {
  PEDIDO: "Dúvidas sobre pedido",
  PRODUTO: "Dúvidas sobre produto",
  TROCA: "Troca ou devolução",
  OUTRO: "Outro assunto",
};

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

    const subjectLabel = subjectLabels[ticket.subject] ?? ticket.subject;
    const safeName = escapeHtmlValue(ticket.name);
    const safeMessage = escapeHtmlValue(message).replace(/\n/g, "<br/>");

    const content = `
      <h2 style="margin:0 0 16px; font-size:20px; color:#18181b;">Nossa resposta</h2>
      <p style="margin:0 0 12px; color:#3f3f46;">Olá <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 16px; color:#3f3f46;">Recebemos sua mensagem sobre <strong>${escapeHtmlValue(subjectLabel)}</strong> e aqui está nosso retorno:</p>
      <div style="background:#fafafa; border-left:4px solid #ec4899; padding:16px; margin:16px 0; border-radius:4px; color:#3f3f46; white-space:pre-wrap;">${safeMessage}</div>
      <p style="margin:0; color:#71717a; font-size:13px;">Se precisar de mais alguma coisa, basta responder este email ou abrir um novo chamado na central de atendimento.</p>
    `;

    const html = baseLayout({
      title: `Re: ${subjectLabel}`,
      preview: `Resposta do suporte sobre ${subjectLabel.toLowerCase()}`,
      content,
    });

    try {
      await this.mailProvider.send({
        to: ticket.email,
        subject: `Re: ${subjectLabel} — Olhos de Gato`,
        html,
      });
    } catch (err) {
      // Best-effort: a resposta já foi salva no DB. Log o erro mas não rethrow.
      console.error("[ReplyToTicket] Falha ao notificar cliente por email:", err);
    }

    return reply;
  }
}
