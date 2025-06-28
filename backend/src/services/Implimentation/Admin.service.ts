import { IBook } from "../../model/Book";
import { IUser } from "../../model/User";
import { IAdminRepository } from "../../repository/Interface/IAdminRepository";
import { IAdminService } from "../Interface/IAdmin.service";
import { IBookService } from "../Interface/IBook.Service";

export class AdminService implements IAdminService {
  constructor(
    private adminRepo: IAdminRepository,
    private bookService: IBookService
  ) {}

  getAllUsers(page: number, limit: number, search: string, filter: string) {
    return this.adminRepo.getAllUsers(page, limit, search, filter);
  }
  
  getAllBooks(page: number, limit: number, search: string, filter: string) {
    return this.adminRepo.getBooksWithPagination(page, limit, search, filter, 'ADMIN');
  }

  getAllPurchases() {
    return this.adminRepo.getAllPurchases();
  }

  getRevenueSummary() {
    return this.adminRepo.getRevenueSummary();
  }
  updateBook(id: string, data: Partial<IBook>) {
      return this.adminRepo.update(id, data);
    }
  
    deleteBook(id: string) {
      return this.adminRepo.delete(id);
    }

    updateUser(id: string, data: Partial<IUser>) {
        return this.adminRepo.updateUser(id, data);
      }
      
      deleteUser(id: string) {
        return this.adminRepo.deleteUser(id);
      }
}
