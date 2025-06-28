import { IBook } from "../../model/Book";
import { IPurchase } from "../../model/Purchase";
import { IUser } from "../../model/User";

export interface IAdminService {
    getAllUsers(page: number, limit: number, search: string, filter: string): Promise<IUser[]>;
    getAllBooks(
        page: number,
        limit: number,
        search: string,
        filter: string
      ): Promise<{
        books: IBook[];
        currentPage: number;
        totalPages: number;
        totalBooks: number;
      }>;
    getAllPurchases(): Promise<IPurchase[]>;
    getRevenueSummary(): Promise<{
      currentMonth: number;
      currentYear: number;
      totalRevenue: number;
      monthlyRevenue: number;
      totalSales: number;
      totalAuthors: number;
    }>;
    updateBook(id: string, data: Partial<IBook>): Promise<IBook | null>;
    deleteBook(id: string): Promise<void>;
    updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<void>;
  }