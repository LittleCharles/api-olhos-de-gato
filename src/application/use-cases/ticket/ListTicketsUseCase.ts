import { inject, injectable } from "tsyringe";
import type { ISupportTicketRepository, TicketStats } from "../../../domain/repositories/ISupportTicketRepository.js";
import { SupportTicket } from "../../../domain/entities/SupportTicket.js";
import { TicketFiltersDTO } from "../../dtos/SupportTicketDTO.js";
import type { PaginatedResult } from "../../../domain/repositories/IProductRepository.js";

interface ListTicketsResult extends PaginatedResult<SupportTicket> {
  stats: TicketStats;
}

@injectable()
export class ListTicketsUseCase {
  constructor(
    @inject("SupportTicketRepository")
    private supportTicketRepository: ISupportTicketRepository,
  ) {}

  async execute(filters: TicketFiltersDTO): Promise<ListTicketsResult> {
    const { page, limit, ...ticketFilters } = filters;

    const [paginatedResult, stats] = await Promise.all([
      this.supportTicketRepository.findAll(ticketFilters, { page, limit }),
      this.supportTicketRepository.getStats(),
    ]);

    return {
      ...paginatedResult,
      stats,
    };
  }
}
