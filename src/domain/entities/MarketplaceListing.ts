import { MarketplaceListingStatus } from "../enums/index.js";
import { Money } from "../value-objects/Money.js";

export interface MarketplaceListingProps {
  id: string;
  accountId: string;
  productId: string;
  externalId: string | null;
  externalUrl: string | null;
  price: Money;
  status: MarketplaceListingStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  categoryMapping: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketplaceListing {
  private props: MarketplaceListingProps;

  constructor(props: MarketplaceListingProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get externalId(): string | null {
    return this.props.externalId;
  }

  get externalUrl(): string | null {
    return this.props.externalUrl;
  }

  get price(): Money {
    return this.props.price;
  }

  get status(): MarketplaceListingStatus {
    return this.props.status;
  }

  get lastSyncAt(): Date | null {
    return this.props.lastSyncAt;
  }

  get lastError(): string | null {
    return this.props.lastError;
  }

  get categoryMapping(): string | null {
    return this.props.categoryMapping;
  }

  get metadata(): Record<string, unknown> | null {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  publish(externalId: string, externalUrl: string): void {
    this.props.externalId = externalId;
    this.props.externalUrl = externalUrl;
    this.props.status = MarketplaceListingStatus.ACTIVE;
    this.props.lastSyncAt = new Date();
    this.props.lastError = null;
    this.props.updatedAt = new Date();
  }

  pause(): void {
    this.props.status = MarketplaceListingStatus.PAUSED;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.status = MarketplaceListingStatus.ACTIVE;
    this.props.lastError = null;
    this.props.updatedAt = new Date();
  }

  updatePrice(price: Money): void {
    this.props.price = price;
    this.props.updatedAt = new Date();
  }

  updateCategoryMapping(categoryMapping: string): void {
    this.props.categoryMapping = categoryMapping;
    this.props.updatedAt = new Date();
  }

  markError(error: string): void {
    this.props.status = MarketplaceListingStatus.ERROR;
    this.props.lastError = error;
    this.props.updatedAt = new Date();
  }

  markSynced(): void {
    this.props.lastSyncAt = new Date();
    this.props.lastError = null;
    this.props.updatedAt = new Date();
  }

  close(): void {
    this.props.status = MarketplaceListingStatus.CLOSED;
    this.props.updatedAt = new Date();
  }
}
