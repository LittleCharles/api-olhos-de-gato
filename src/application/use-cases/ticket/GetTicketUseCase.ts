import { inject, injectable } from "tsyringe";
import type { ISupportTicketRepository } from "../../../domain/repositories/ISupportTicketRepository.js";
import { SupportTicket } from "../../../domain/entities/SupportTicket.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class GetTicketUseCase {
  constructor(
    @inject("SupportTicketRepository")
    private supportTicketRepository: ISupportTicketRepository,
  ) {}

  async execute(id: string): Promise<SupportTicket> {
    const ticket = await this.supportTicketRepository.findById(id);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    return ticket;
  }
}
