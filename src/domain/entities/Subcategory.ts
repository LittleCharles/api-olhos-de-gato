import { AnimalType } from "../enums/index.js";

export interface SubcategoryProps {
  id: string;
  animalType: AnimalType;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Subcategory {
  private props: SubcategoryProps;

  constructor(props: SubcategoryProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get animalType(): AnimalType {
    return this.props.animalType;
  }

  get name(): string {
    return this.props.name;
  }

  get icon(): string {
    return this.props.icon;
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
    data: Partial<Pick<SubcategoryProps, "name" | "icon" | "isActive">>,
  ): void {
    if (data.name !== undefined) this.props.name = data.name;
    if (data.icon !== undefined) this.props.icon = data.icon;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    this.props.updatedAt = new Date();
  }
}
