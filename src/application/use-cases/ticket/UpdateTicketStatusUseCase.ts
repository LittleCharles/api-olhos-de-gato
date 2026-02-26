import { inject, injectable } from "tsyringe";
import type { ISupportTicketRepository } from "../../../domain/repositories/ISupportTicketRepository.js";
import { SupportTicket } from "../../../domain/entities/SupportTicket.js";
import { TicketStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateTicketStatusUseCase {
  constructor(
    @inject("SupportTicketRepository")
    private supportTicketRepository: ISupportTicketRepository,
  ) {}

  async execute(id: string, status: TicketStatus): Promise<SupportTicket> {
    const ticket = await this.supportTicketRepository.findById(id);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    switch (status) {
      case TicketStatus.IN_PROGRESS:
        ticket.markInProgress();
        break;
      case TicketStatus.RESOLVED:
        ticket.resolve();
        break;
      case TicketStatus.CLOSED:
        ticket.close();
        break;
      case TicketStatus.OPEN:
        ticket.reopen();
        break;
    }

    return this.supportTicketRepository.update(ticket);
  }
}
