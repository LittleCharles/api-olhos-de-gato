import { inject, injectable } from "tsyringe";
import type {
  IDashboardRepository,
  RecentOrderData,
} from "../../../domain/repositories/IDashboardRepository.js";

@injectable()
export class GetRecentOrdersUseCase {
  constructor(
    @inject("DashboardRepository")
    private dashboardRepository: IDashboardRepository,
  ) {}

  async execute(limit: number): Promise<RecentOrderData[]> {
    return this.dashboardRepository.getRecentOrders(limit);
  }
}
