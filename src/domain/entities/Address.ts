export interface AddressProps {
  id: string;
  customerId: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export class Address {
  private props: AddressProps;

  constructor(props: AddressProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get customerId(): string { return this.props.customerId; }
  get street(): string { return this.props.street; }
  get number(): string { return this.props.number; }
  get complement(): string | null | undefined { return this.props.complement; }
  get neighborhood(): string { return this.props.neighborhood; }
  get city(): string { return this.props.city; }
  get state(): string { return this.props.state; }
  get zipCode(): string { return this.props.zipCode; }
  get isDefault(): boolean { return this.props.isDefault; }

  update(data: Partial<Omit<AddressProps, 'id' | 'customerId'>>): void {
    Object.assign(this.props, data);
  }
}
