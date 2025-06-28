export interface RevenueStats {
    currentMonth: number;
    currentYear: number;
    totalRevenue: number;
    totalSales: number;
    monthlyData: {
      month: string;
      revenue: number;
    }[];
  }
export interface IPurchaseService {
    createPurchase(bookId: string, userId: string, quantity: number): Promise<any>;
    getUserPurchases(userId: string): Promise<any[]>;
    getAuthorRevenueSummary(authorId: string): Promise<RevenueStats>;
  }