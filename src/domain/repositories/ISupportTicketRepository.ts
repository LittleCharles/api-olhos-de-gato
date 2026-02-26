import { SupportTicket } from "../entities/SupportTicket.js";
import { TicketReply } from "../entities/TicketReply.js";
import { TicketStatus, TicketSubject } from "../enums/index.js";
import { PaginatedResult, PaginationParams } from "./IProductRepository.js";

export interface TicketFilters {
  search?: string;
  status?: TicketStatus;
  subject?: TicketSubject;
}

export interface TicketStats {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
}

export interface CreateTicketData {
  name: string;
  email: string;
  phone?: string | null;
  subject: TicketSubject;
  message: string;
  customerId?: string | null;
  orderId?: string | null;
}

export interface ISupportTicketRepository {
  findById(id: string): Promise<SupportTicket | null>;
  findAll(
    filters?: TicketFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<SupportTicket>>;
  create(data: CreateTicketData): Promise<SupportTicket>;
  update(ticket: SupportTicket): Promise<SupportTicket>;
  addReply(ticketId: string, message: string, isAdmin: boolean): Promise<TicketReply>;
  getStats(): Promise<TicketStats>;
}
