import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { BaseLayoutStoreInfo } from "./templates/baseLayout.js";

/**
 * Helper compartilhado pra montar o `storeInfo` opcional do `baseLayout` a partir do
 * StoreSettings. Best-effort: se o fetch falhar (DB caiu, repo erro), retorna `undefined`
 * — o baseLayout faz fallback pra valores hardcoded e o email continua sendo enviado.
 *
 * Usado por: ForgotPasswordUseCase, SendVerificationEmailUseCase. Outros use cases que
 * já tem o StoreSettings em escopo (CreateOrder/Stripe/UpdateOrderStatus) montam
 * inline porque já fizeram o fetch antes.
 */
export async function getStoreInfoForEmail(
  storeSettingsRepository: IStoreSettingsRepository,
): Promise<BaseLayoutStoreInfo | undefined> {
  try {
    const store = await storeSettingsRepository.get();
    return {
      helpEmail: store.email,
      socialInstagram: store.socialInstagram || undefined,
      socialFacebook: store.socialFacebook || undefined,
      socialTiktok: store.socialTiktok || undefined,
    };
  } catch (err) {
    console.error("[storeInfoForEmail] Falha ao buscar StoreSettings:", err);
    return undefined;
  }
}
