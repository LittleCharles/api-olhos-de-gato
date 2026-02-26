import { SupportTicket } from "../../../domain/entities/SupportTicket.js";
import { TicketReply } from "../../../domain/entities/TicketReply.js";

export class SupportTicketPresenter {
  static toHTTP(ticket: SupportTicket) {
    return {
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      phone: ticket.phone,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      customerId: ticket.customerId,
      orderId: ticket.orderId,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      replies: ticket.replies.map(SupportTicketPresenter.replyToHTTP),
    };
  }

  static toListHTTP(ticket: SupportTicket) {
    return {
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  static replyToHTTP(reply: TicketReply) {
    return {
      id: reply.id,
      ticketId: reply.ticketId,
      message: reply.message,
      isAdmin: reply.isAdmin,
      createdAt: reply.createdAt.toISOString(),
    };
  }
}
