import { inject, injectable } from "tsyringe";
import type {
  IDashboardRepository,
  SalesChartPoint,
} from "../../../domain/repositories/IDashboardRepository.js";

@injectable()
export class GetSalesChartUseCase {
  constructor(
    @inject("DashboardRepository")
    private dashboardRepository: IDashboardRepository,
  ) {}

  async execute(period: string): Promise<SalesChartPoint[]> {
    return this.dashboardRepository.getSalesChart(period);
  }
}
