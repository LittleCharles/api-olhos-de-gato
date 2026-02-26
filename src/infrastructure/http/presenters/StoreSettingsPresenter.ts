import { StoreSettings } from "../../../domain/entities/StoreSettings.js";

export class StoreSettingsPresenter {
  static toHTTP(settings: StoreSettings) {
    return {
      storeName: settings.storeName,
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      address: settings.address,
      shippingFreeAbove: settings.shippingFreeAbove.getValue(),
      shippingBasePrice: settings.shippingBasePrice.getValue(),
      estimatedDelivery: settings.estimatedDelivery,
      pixEnabled: settings.pixEnabled,
      creditCardEnabled: settings.creditCardEnabled,
      creditCardMaxInstallments: settings.creditCardMaxInstallments,
      boletoEnabled: settings.boletoEnabled,
      socialInstagram: settings.socialInstagram,
      socialFacebook: settings.socialFacebook,
      socialTiktok: settings.socialTiktok,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}
