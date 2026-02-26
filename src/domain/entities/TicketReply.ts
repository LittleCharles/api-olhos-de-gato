export interface TicketReplyProps {
  id: string;
  ticketId: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export class TicketReply {
  private props: TicketReplyProps;

  constructor(props: TicketReplyProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get ticketId(): string {
    return this.props.ticketId;
  }

  get message(): string {
    return this.props.message;
  }

  get isAdmin(): boolean {
    return this.props.isAdmin;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
