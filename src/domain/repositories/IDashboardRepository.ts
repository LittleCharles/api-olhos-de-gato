export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  activeCustomers: number;
  salesTrend: number;
  ordersTrend: number;
  ordersByStatus: Record<string, number>;
}

export interface SalesChartPoint {
  label: string;
  value: number;
}

export interface TopProductData {
  id: string;
  name: string;
  category: string;
  animalType: string;
  sales: number;
  revenue: number;
}

export interface RecentOrderData {
  id: string;
  customerName: string;
  status: string;
  total: number;
  totalFormatted: string;
  createdAt: string;
}

export interface IDashboardRepository {
  getStats(period: string): Promise<DashboardStats>;
  getSalesChart(period: string): Promise<SalesChartPoint[]>;
  getTopProducts(limit: number): Promise<TopProductData[]>;
  getRecentOrders(limit: number): Promise<RecentOrderData[]>;
}
