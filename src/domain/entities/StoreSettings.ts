import { Money } from "../value-objects/Money.js";

export interface StoreSettingsProps {
  id: string;
  storeName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  shippingFreeAbove: Money;
  shippingBasePrice: Money;
  estimatedDelivery: string;
  pixEnabled: boolean;
  creditCardEnabled: boolean;
  creditCardMaxInstallments: number;
  boletoEnabled: boolean;
  cardFeePercent: number;
  cardFeeFixed: number;
  pixFeePercent: number;
  applyCardFeeToShipping: boolean;
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
  socialMercadoLivre: string;
  socialShopee: string;
  socialAmazon: string;
  updatedAt: Date;
}

export class StoreSettings {
  private props: StoreSettingsProps;

  constructor(props: StoreSettingsProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get storeName(): string { return this.props.storeName; }
  get email(): string { return this.props.email; }
  get phone(): string { return this.props.phone; }
  get whatsapp(): string { return this.props.whatsapp; }
  get address(): string { return this.props.address; }
  get shippingFreeAbove(): Money { return this.props.shippingFreeAbove; }
  get shippingBasePrice(): Money { return this.props.shippingBasePrice; }
  get estimatedDelivery(): string { return this.props.estimatedDelivery; }
  get pixEnabled(): boolean { return this.props.pixEnabled; }
  get creditCardEnabled(): boolean { return this.props.creditCardEnabled; }
  get creditCardMaxInstallments(): number { return this.props.creditCardMaxInstallments; }
  get boletoEnabled(): boolean { return this.props.boletoEnabled; }
  get cardFeePercent(): number { return this.props.cardFeePercent; }
  get cardFeeFixed(): number { return this.props.cardFeeFixed; }
  get pixFeePercent(): number { return this.props.pixFeePercent; }
  get applyCardFeeToShipping(): boolean { return this.props.applyCardFeeToShipping; }
  get socialInstagram(): string { return this.props.socialInstagram; }
  get socialFacebook(): string { return this.props.socialFacebook; }
  get socialTiktok(): string { return this.props.socialTiktok; }
  get socialMercadoLivre(): string { return this.props.socialMercadoLivre; }
  get socialShopee(): string { return this.props.socialShopee; }
  get socialAmazon(): string { return this.props.socialAmazon; }
  get updatedAt(): Date { return this.props.updatedAt; }

  update(data: Partial<Omit<StoreSettingsProps, "id" | "updatedAt" | "shippingFreeAbove" | "shippingBasePrice">> & {
    shippingFreeAbove?: number;
    shippingBasePrice?: number;
  }): void {
    if (data.storeName !== undefined) this.props.storeName = data.storeName;
    if (data.email !== undefined) this.props.email = data.email;
    if (data.phone !== undefined) this.props.phone = data.phone;
    if (data.whatsapp !== undefined) this.props.whatsapp = data.whatsapp;
    if (data.address !== undefined) this.props.address = data.address;
    if (data.shippingFreeAbove !== undefined) this.props.shippingFreeAbove = Money.create(data.shippingFreeAbove);
    if (data.shippingBasePrice !== undefined) this.props.shippingBasePrice = Money.create(data.shippingBasePrice);
    if (data.estimatedDelivery !== undefined) this.props.estimatedDelivery = data.estimatedDelivery;
    if (data.pixEnabled !== undefined) this.props.pixEnabled = data.pixEnabled;
    if (data.creditCardEnabled !== undefined) this.props.creditCardEnabled = data.creditCardEnabled;
    if (data.creditCardMaxInstallments !== undefined) this.props.creditCardMaxInstallments = data.creditCardMaxInstallments;
    if (data.boletoEnabled !== undefined) this.props.boletoEnabled = data.boletoEnabled;
    if (data.cardFeePercent !== undefined) this.props.cardFeePercent = data.cardFeePercent;
    if (data.cardFeeFixed !== undefined) this.props.cardFeeFixed = data.cardFeeFixed;
    if (data.pixFeePercent !== undefined) this.props.pixFeePercent = data.pixFeePercent;
    if (data.applyCardFeeToShipping !== undefined) this.props.applyCardFeeToShipping = data.applyCardFeeToShipping;
    if (data.socialInstagram !== undefined) this.props.socialInstagram = data.socialInstagram;
    if (data.socialFacebook !== undefined) this.props.socialFacebook = data.socialFacebook;
    if (data.socialTiktok !== undefined) this.props.socialTiktok = data.socialTiktok;
    if (data.socialMercadoLivre !== undefined) this.props.socialMercadoLivre = data.socialMercadoLivre;
    if (data.socialShopee !== undefined) this.props.socialShopee = data.socialShopee;
    if (data.socialAmazon !== undefined) this.props.socialAmazon = data.socialAmazon;
    this.props.updatedAt = new Date();
  }
}
