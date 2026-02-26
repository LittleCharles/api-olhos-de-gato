import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetDashboardStatsUseCase } from "../../../application/use-cases/dashboard/GetDashboardStatsUseCase.js";
import { GetSalesChartUseCase } from "../../../application/use-cases/dashboard/GetSalesChartUseCase.js";
import { GetTopProductsUseCase } from "../../../application/use-cases/dashboard/GetTopProductsUseCase.js";
import { GetRecentOrdersUseCase } from "../../../application/use-cases/dashboard/GetRecentOrdersUseCase.js";
import {
  DashboardStatsQuerySchema,
  DashboardChartQuerySchema,
  DashboardTopProductsQuerySchema,
  DashboardRecentOrdersQuerySchema,
} from "../../../application/dtos/DashboardDTO.js";

export class DashboardController {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const { period } = DashboardStatsQuerySchema.parse(request.query);

    const getStatsUseCase = container.resolve(GetDashboardStatsUseCase);
    const stats = await getStatsUseCase.execute(period);

    return reply.send(stats);
  }

  async getSalesChart(request: FastifyRequest, reply: FastifyReply) {
    const { period } = DashboardChartQuerySchema.parse(request.query);

    const getSalesChartUseCase = container.resolve(GetSalesChartUseCase);
    const data = await getSalesChartUseCase.execute(period);

    return reply.send(data);
  }

  async getTopProducts(request: FastifyRequest, reply: FastifyReply) {
    const { limit } = DashboardTopProductsQuerySchema.parse(request.query);

    const getTopProductsUseCase = container.resolve(GetTopProductsUseCase);
    const data = await getTopProductsUseCase.execute(limit);

    return reply.send(data);
  }

  async getRecentOrders(request: FastifyRequest, reply: FastifyReply) {
    const { limit } = DashboardRecentOrdersQuerySchema.parse(request.query);

    const getRecentOrdersUseCase = container.resolve(GetRecentOrdersUseCase);
    const data = await getRecentOrdersUseCase.execute(limit);

    return reply.send(data);
  }
}
