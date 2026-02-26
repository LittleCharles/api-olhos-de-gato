import { inject, injectable } from "tsyringe";
import type {
  IDashboardRepository,
  TopProductData,
} from "../../../domain/repositories/IDashboardRepository.js";

@injectable()
export class GetTopProductsUseCase {
  constructor(
    @inject("DashboardRepository")
    private dashboardRepository: IDashboardRepository,
  ) {}

  async execute(limit: number): Promise<TopProductData[]> {
    return this.dashboardRepository.getTopProducts(limit);
  }
}
