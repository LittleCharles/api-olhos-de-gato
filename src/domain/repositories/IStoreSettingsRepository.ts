import { StoreSettings } from "../entities/StoreSettings.js";

export interface IStoreSettingsRepository {
  get(): Promise<StoreSettings>;
  update(settings: StoreSettings): Promise<StoreSettings>;
}
