import { inject, injectable } from "tsyringe";
import type { IAbandonedCartRepository, AbandonedCartResult } from "../../../domain/repositories/IAbandonedCartRepository.js";

@injectable()
export class ListAbandonedCartsUseCase {
  constructor(
    @inject("AbandonedCartRepository")
    private abandonedCartRepository: IAbandonedCartRepository,
  ) {}

  async execute(page: number, limit: number): Promise<AbandonedCartResult> {
    return this.abandonedCartRepository.findAbandoned({ page, limit });
  }
}
