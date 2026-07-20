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
      cardFeePercent: settings.cardFeePercent,
      cardFeeFixed: settings.cardFeeFixed,
      pixFeePercent: settings.pixFeePercent,
      applyCardFeeToShipping: settings.applyCardFeeToShipping,
      socialInstagram: settings.socialInstagram,
      socialFacebook: settings.socialFacebook,
      socialTiktok: settings.socialTiktok,
      socialMercadoLivre: settings.socialMercadoLivre || undefined,
      socialShopee: settings.socialShopee || undefined,
      socialAmazon: settings.socialAmazon || undefined,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  // Versão admin: inclui campos sensíveis/internos que NÃO devem ir pro /public/settings.
  static toHTTPAdmin(settings: StoreSettings) {
    return {
      ...StoreSettingsPresenter.toHTTP(settings),
      lookerStudioUrl: settings.lookerStudioUrl || "",
    };
  }
}
