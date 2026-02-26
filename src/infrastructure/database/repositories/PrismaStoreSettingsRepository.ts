import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import { StoreSettings } from "../../../domain/entities/StoreSettings.js";
import { Money } from "../../../domain/value-objects/Money.js";

@injectable()
export class PrismaStoreSettingsRepository implements IStoreSettingsRepository {
  async get(): Promise<StoreSettings> {
    let data = await prisma.storeSettings.findUnique({ where: { id: "default" } });

    if (!data) {
      data = await prisma.storeSettings.create({
        data: {
          id: "default",
          storeName: "Olhos de Gato",
          email: "contato@olhosdegato.com.br",
          phone: "(11) 3456-7890",
          whatsapp: "(11) 99999-0000",
          address: "Rua dos Gatos, 123 - São Paulo, SP",
          shippingFreeAbove: 199.90,
          shippingBasePrice: 15.90,
          estimatedDelivery: "3 a 7 dias úteis",
          pixEnabled: true,
          creditCardEnabled: true,
          creditCardMaxInstallments: 12,
          boletoEnabled: true,
          socialInstagram: "",
          socialFacebook: "",
          socialTiktok: "",
        },
      });
    }

    return this.mapToEntity(data);
  }

  async update(settings: StoreSettings): Promise<StoreSettings> {
    const data = await prisma.storeSettings.update({
      where: { id: "default" },
      data: {
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
      },
    });

    return this.mapToEntity(data);
  }

  private mapToEntity(data: any): StoreSettings {
    return new StoreSettings({
      id: data.id,
      storeName: data.storeName,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      address: data.address,
      shippingFreeAbove: Money.create(Number(data.shippingFreeAbove)),
      shippingBasePrice: Money.create(Number(data.shippingBasePrice)),
      estimatedDelivery: data.estimatedDelivery,
      pixEnabled: data.pixEnabled,
      creditCardEnabled: data.creditCardEnabled,
      creditCardMaxInstallments: data.creditCardMaxInstallments,
      boletoEnabled: data.boletoEnabled,
      socialInstagram: data.socialInstagram,
      socialFacebook: data.socialFacebook,
      socialTiktok: data.socialTiktok,
      updatedAt: data.updatedAt,
    });
  }
}
