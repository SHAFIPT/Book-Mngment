export interface INotificationRepository {
    getAuthorEmailsForBook(bookId: string): Promise<string[]>;
    getUserById(userId: string): Promise<{ name: string; email: string }>;
    getBookById(bookId: string): Promise<{ title: string }>;
    getRetailUserEmails(): Promise<string[]>;
    getAllUserEmails(): Promise<string[]>;
    getAuthorEmails(): Promise<string[]>;
    getActiveUserEmails(): Promise<string[]>;
    getMonthlyRevenueData(): Promise<{
      email: string;
      name: string;
      totalRevenue: number;
      currentMonth: number;
      currentYear: number;
    }[]>;
  }
  