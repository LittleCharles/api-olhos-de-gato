import { TicketStatus, TicketSubject } from "../enums/index.js";
import { TicketReply } from "./TicketReply.js";

export interface SupportTicketProps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: TicketSubject;
  message: string;
  status: TicketStatus;
  customerId: string | null;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: TicketReply[];
}

export class SupportTicket {
  private props: SupportTicketProps;

  constructor(props: SupportTicketProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get subject(): TicketSubject {
    return this.props.subject;
  }

  get message(): string {
    return this.props.message;
  }

  get status(): TicketStatus {
    return this.props.status;
  }

  get customerId(): string | null {
    return this.props.customerId;
  }

  get orderId(): string | null {
    return this.props.orderId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get replies(): TicketReply[] {
    return this.props.replies ?? [];
  }

  markInProgress(): void {
    this.props.status = TicketStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  resolve(): void {
    this.props.status = TicketStatus.RESOLVED;
    this.props.updatedAt = new Date();
  }

  close(): void {
    this.props.status = TicketStatus.CLOSED;
    this.props.updatedAt = new Date();
  }

  reopen(): void {
    this.props.status = TicketStatus.OPEN;
    this.props.updatedAt = new Date();
  }
}
