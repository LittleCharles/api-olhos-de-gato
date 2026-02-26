import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import type {
  IDashboardRepository,
  DashboardStats,
  SalesChartPoint,
  TopProductData,
  RecentOrderData,
} from "../../../domain/repositories/IDashboardRepository.js";

@injectable()
export class PrismaDashboardRepository implements IDashboardRepository {
  private getPeriodDates(period: string): { start: Date; previousStart: Date } {
    const now = new Date();
    let start: Date;
    let previousStart: Date;

    switch (period) {
      case "7d":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "6m":
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      case "30d":
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
    }

    return { start, previousStart };
  }

  async getStats(period: string): Promise<DashboardStats> {
    const { start, previousStart } = this.getPeriodDates(period);

    const [
      currentSales,
      previousSales,
      currentOrders,
      previousOrders,
      activeProducts,
      activeCustomers,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: start }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStart, lt: start },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: start } } }),
      prisma.order.count({
        where: { createdAt: { gte: previousStart, lt: start } },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count({
        where: { user: { isActive: true } },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const totalSales = Number(currentSales._sum.total ?? 0);
    const prevSales = Number(previousSales._sum.total ?? 0);
    const salesTrend =
      prevSales > 0
        ? Math.round(((totalSales - prevSales) / prevSales) * 1000) / 10
        : 0;
    const ordersTrend =
      previousOrders > 0
        ? Math.round(((currentOrders - previousOrders) / previousOrders) * 1000) / 10
        : 0;

    const statusMap: Record<string, number> = {};
    for (const item of ordersByStatus) {
      statusMap[item.status] = item._count;
    }

    return {
      totalSales,
      totalOrders: currentOrders,
      activeProducts,
      activeCustomers,
      salesTrend,
      ordersTrend,
      ordersByStatus: statusMap,
    };
  }

  async getSalesChart(period: string): Promise<SalesChartPoint[]> {
    const { start } = this.getPeriodDates(period);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped = new Map<string, number>();

    for (const order of orders) {
      let label: string;
      const date = order.createdAt;

      if (period === "7d") {
        const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        label = days[date.getDay()];
      } else if (period === "6m") {
        const months = [
          "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
          "Jul", "Ago", "Set", "Out", "Nov", "Dez",
        ];
        label = months[date.getMonth()];
      } else {
        // 30d - group by week
        const weekNum = Math.ceil(
          (date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000),
        );
        label = `Sem ${Math.max(1, weekNum)}`;
      }

      grouped.set(label, (grouped.get(label) ?? 0) + Number(order.total));
    }

    return Array.from(grouped.entries()).map(([label, value]) => ({
      label,
      value: Math.round(value * 100) / 100,
    }));
  }

  async getTopProducts(limit: number): Promise<TopProductData[]> {
    const results = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: limit,
    });

    if (results.length === 0) return [];

    const productIds = results.map((r) => r.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { subcategory: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return results.map((r) => {
      const product = productMap.get(r.productId);
      return {
        id: r.productId,
        name: product?.name ?? "Produto removido",
        category: product?.subcategory?.name ?? "",
        animalType: product?.animalType ?? "",
        sales: r._sum.quantity ?? 0,
        revenue: Number(r._sum.total ?? 0),
      };
    });
  }

  async getRecentOrders(limit: number): Promise<RecentOrderData[]> {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { include: { user: { select: { name: true } } } },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      customerName: order.customer.user.name,
      status: order.status,
      total: Number(order.total),
      totalFormatted: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(order.total)),
      createdAt: order.createdAt.toISOString(),
    }));
  }
}
