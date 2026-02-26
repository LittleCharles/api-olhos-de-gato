import { inject, injectable } from "tsyringe";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { UpdateStoreSettingsDTO } from "../../dtos/StoreSettingsDTO.js";
import { StoreSettings } from "../../../domain/entities/StoreSettings.js";

@injectable()
export class UpdateStoreSettingsUseCase {
  constructor(
    @inject("StoreSettingsRepository")
    private storeSettingsRepository: IStoreSettingsRepository,
  ) {}

  async execute(dto: UpdateStoreSettingsDTO): Promise<StoreSettings> {
    const settings = await this.storeSettingsRepository.get();
    settings.update(dto);
    return this.storeSettingsRepository.update(settings);
  }
}
