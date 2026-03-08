export interface BrandProps {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Brand {
  private props: BrandProps;

  constructor(props: BrandProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(data: Partial<Pick<BrandProps, "name">>): void {
    if (data.name !== undefined) this.props.name = data.name;
    this.props.updatedAt = new Date();
  }
}
