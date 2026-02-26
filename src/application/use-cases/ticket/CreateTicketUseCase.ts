import { inject, injectable } from "tsyringe";
import type { ISupportTicketRepository } from "../../../domain/repositories/ISupportTicketRepository.js";
import { SupportTicket } from "../../../domain/entities/SupportTicket.js";
import { CreateTicketDTO } from "../../dtos/SupportTicketDTO.js";

@injectable()
export class CreateTicketUseCase {
  constructor(
    @inject("SupportTicketRepository")
    private supportTicketRepository: ISupportTicketRepository,
  ) {}

  async execute(
    data: CreateTicketDTO,
    customerId?: string | null,
  ): Promise<SupportTicket> {
    return this.supportTicketRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      customerId: customerId ?? null,
      orderId: data.orderId ?? null,
    });
  }
}
