export interface CustomerProps {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  birthDate?: Date | null;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer {
  private props: CustomerProps;

  constructor(props: CustomerProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get phone(): string | null | undefined { return this.props.phone; }
  get cpf(): string | null | undefined { return this.props.cpf; }
  get birthDate(): Date | null | undefined { return this.props.birthDate; }
  get isActive(): boolean { return this.props.isActive; }
  get totalOrders(): number { return this.props.totalOrders; }
  get totalSpent(): number { return this.props.totalSpent; }
  get lastOrderDate(): Date | null | undefined { return this.props.lastOrderDate; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
