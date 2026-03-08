import { Money } from "../value-objects/Money.js";
import { AnimalType } from "../enums/index.js";

export interface ProductImageProps {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  isMain: boolean;
}

export interface ProductProps {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: Money;
  stock: number;
  isActive: boolean;
  images: ProductImageProps[];
  animalType: AnimalType;
  subcategoryId: string | null;
  promoPrice: Money | null;
  sku: string;
  isFeatured: boolean;
  isRecommended: boolean;
  brandId: string | null;
  brandName?: string | null;
  ean: string | null;
  weight: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  countryOrigin: string | null;
  manufacturer: string | null;
  bulletPoints: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
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

  get price(): Money {
    return this.props.price;
  }

  get stock(): number {
    return this.props.stock;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get images(): ProductImageProps[] {
    return this.props.images;
  }

  get mainImage(): ProductImageProps | undefined {
    return this.props.images.find((img) => img.isMain) || this.props.images[0];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get animalType(): AnimalType {
    return this.props.animalType;
  }

  get subcategoryId(): string | null {
    return this.props.subcategoryId;
  }

  get promoPrice(): Money | null {
    return this.props.promoPrice;
  }

  get sku(): string {
    return this.props.sku;
  }

  get isFeatured(): boolean {
    return this.props.isFeatured;
  }

  get isRecommended(): boolean {
    return this.props.isRecommended;
  }

  get brandId(): string | null {
    return this.props.brandId;
  }

  get brandName(): string | null {
    return this.props.brandName ?? null;
  }

  get ean(): string | null {
    return this.props.ean;
  }

  get weight(): number | null {
    return this.props.weight;
  }

  get lengthCm(): number | null {
    return this.props.lengthCm;
  }

  get widthCm(): number | null {
    return this.props.widthCm;
  }

  get heightCm(): number | null {
    return this.props.heightCm;
  }

  get countryOrigin(): string | null {
    return this.props.countryOrigin;
  }

  get manufacturer(): string | null {
    return this.props.manufacturer;
  }

  get bulletPoints(): string[] {
    return this.props.bulletPoints;
  }

  isAvailable(): boolean {
    return this.props.isActive && this.props.stock > 0;
  }

  hasStock(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  decreaseStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error("Estoque insuficiente");
    }
    this.props.stock -= quantity;
    this.props.updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    this.props.stock += quantity;
    this.props.updatedAt = new Date();
  }

  updatePrice(price: Money): void {
    this.props.price = price;
    this.props.updatedAt = new Date();
  }

  updatePromoPrice(promoPrice: Money | null): void {
    this.props.promoPrice = promoPrice;
    this.props.updatedAt = new Date();
  }

  setFeatured(value: boolean): void {
    this.props.isFeatured = value;
    this.props.updatedAt = new Date();
  }

  setRecommended(value: boolean): void {
    this.props.isRecommended = value;
    this.props.updatedAt = new Date();
  }

  update(
    data: Partial<
      Pick<
        ProductProps,
        | "name"
        | "description"
        | "categoryId"
        | "isActive"
        | "animalType"
        | "subcategoryId"
        | "sku"
        | "isFeatured"
        | "isRecommended"
        | "brandId"
        | "ean"
        | "weight"
        | "lengthCm"
        | "widthCm"
        | "heightCm"
        | "countryOrigin"
        | "manufacturer"
        | "bulletPoints"
      >
    >,
  ): void {
    if (data.name !== undefined) {
      this.props.name = data.name;
      this.props.slug = this.generateSlug(data.name);
    }
    if (data.description !== undefined)
      this.props.description = data.description;
    if (data.categoryId !== undefined) this.props.categoryId = data.categoryId;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    if (data.animalType !== undefined) this.props.animalType = data.animalType;
    if (data.subcategoryId !== undefined)
      this.props.subcategoryId = data.subcategoryId;
    if (data.sku !== undefined) this.props.sku = data.sku;
    if (data.isFeatured !== undefined) this.props.isFeatured = data.isFeatured;
    if (data.isRecommended !== undefined)
      this.props.isRecommended = data.isRecommended;
    if (data.brandId !== undefined) this.props.brandId = data.brandId;
    if (data.ean !== undefined) this.props.ean = data.ean;
    if (data.weight !== undefined) this.props.weight = data.weight;
    if (data.lengthCm !== undefined) this.props.lengthCm = data.lengthCm;
    if (data.widthCm !== undefined) this.props.widthCm = data.widthCm;
    if (data.heightCm !== undefined) this.props.heightCm = data.heightCm;
    if (data.countryOrigin !== undefined) this.props.countryOrigin = data.countryOrigin;
    if (data.manufacturer !== undefined) this.props.manufacturer = data.manufacturer;
    if (data.bulletPoints !== undefined) this.props.bulletPoints = data.bulletPoints;
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
}
