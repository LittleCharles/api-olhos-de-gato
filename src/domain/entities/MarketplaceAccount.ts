import { MarketplacePlatform } from "../enums/index.js";

export interface MarketplaceAccountProps {
  id: string;
  platform: MarketplacePlatform;
  sellerId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketplaceAccount {
  private props: MarketplaceAccountProps;

  constructor(props: MarketplaceAccountProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get platform(): MarketplacePlatform {
    return this.props.platform;
  }

  get sellerId(): string | null {
    return this.props.sellerId;
  }

  get accessToken(): string | null {
    return this.props.accessToken;
  }

  get refreshToken(): string | null {
    return this.props.refreshToken;
  }

  get tokenExpiresAt(): Date | null {
    return this.props.tokenExpiresAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
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

  isTokenExpired(): boolean {
    if (!this.props.tokenExpiresAt) return true;
    return new Date() >= this.props.tokenExpiresAt;
  }

  updateTokens(accessToken: string, refreshToken: string, expiresAt: Date): void {
    this.props.accessToken = accessToken;
    this.props.refreshToken = refreshToken;
    this.props.tokenExpiresAt = expiresAt;
    this.props.updatedAt = new Date();
  }

  activate(sellerId: string): void {
    this.props.isActive = true;
    this.props.sellerId = sellerId;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.accessToken = null;
    this.props.refreshToken = null;
    this.props.tokenExpiresAt = null;
    this.props.updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, unknown>): void {
    this.props.metadata = metadata;
    this.props.updatedAt = new Date();
  }
}
