export interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  private props: CategoryProps;

  constructor(props: CategoryProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get imageUrl(): string | null | undefined {
    return this.props.imageUrl;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(
    data: Partial<
      Pick<CategoryProps, "name" | "description" | "imageUrl" | "isActive">
    >,
  ): void {
    if (data.name !== undefined) {
      this.props.name = data.name;
      this.props.slug = this.generateSlug(data.name);
    }
    if (data.description !== undefined)
      this.props.description = data.description;
    if (data.imageUrl !== undefined) this.props.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    this.props.updatedAt = new Date();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }
}
