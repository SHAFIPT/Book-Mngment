export interface RevenueData {
    currentMonth: number;
    currentYear: number;
  totalRevenue: number;
  totalSales: number;
    monthlyData: {
      month: string;
      revenue: number;
    }[];
  }