import { IBook } from "../../model/Book";
import { IPurchase } from "../../model/Purchase";
import { IUser } from "../../model/User";
import { BookWithPopulatedAuthors } from "../../repository/Interface/IAdminRepository";

export interface IAdminService {
    getAllUsers(page: number, limit: number, search: string, filter: string): Promise<IUser[]>;
    getAllBooks(
      page: number,
      limit: number,
      search: string,
      filter: string
    ): Promise<{
      books: BookWithPopulatedAuthors[];
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