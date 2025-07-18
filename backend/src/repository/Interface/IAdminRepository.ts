import { IBook } from "../../model/Book";
import { IPurchase } from "../../model/Purchase";
import { IUser } from "../../model/User";

export interface PopulatedAuthor {
  _id: string;
  name: string;
  email: string;
}

export type BookWithPopulatedAuthors = Omit<IBook, 'authors'> & {
  authors: PopulatedAuthor[];
  totalSales: number;
};

export interface IAdminRepository {
    getAllUsers(page: number, limit: number, search: string, filter: string) : Promise<IUser[]>;
    getBooksWithPagination(
      page: number,
      limit: number,
      search: string,
      filter: string,
      userType: string
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
    update(id: string, data: Partial<IBook>): Promise<IBook | null>;
    delete(id: string): Promise<void>;
    updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<void>;
  }