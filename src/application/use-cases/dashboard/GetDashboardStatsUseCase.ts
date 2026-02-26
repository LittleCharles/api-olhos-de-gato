import { inject, injectable } from "tsyringe";
import type {
  IDashboardRepository,
  DashboardStats,
} from "../../../domain/repositories/IDashboardRepository.js";

@injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @inject("DashboardRepository")
    private dashboardRepository: IDashboardRepository,
  ) {}

  async execute(period: string): Promise<DashboardStats> {
    return this.dashboardRepository.getStats(period);
  }
}
