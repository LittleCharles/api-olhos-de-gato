import { inject, injectable } from "tsyringe";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import { StoreSettings } from "../../../domain/entities/StoreSettings.js";

@injectable()
export class GetStoreSettingsUseCase {
  constructor(
    @inject("StoreSettingsRepository")
    private storeSettingsRepository: IStoreSettingsRepository,
  ) {}

  async execute(): Promise<StoreSettings> {
    return this.storeSettingsRepository.get();
  }
}
