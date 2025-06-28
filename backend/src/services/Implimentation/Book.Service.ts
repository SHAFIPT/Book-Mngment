import { IBook } from '../../model/Book';
import { IBookRepository } from '../../repository/Interface/IBookRepository';
import { BookFilters, BookResponse } from '../../types/BookTypes';
import { getNextBookId } from '../../utils/getNextBookId';
import { IBookService } from '../Interface/IBook.Service';

export class BookService implements IBookService {
  constructor(private bookRepo: IBookRepository) {}

  async createBook(data: Partial<IBook>): Promise<IBook> {
    // ✅ Use atomic ID generation instead of countDocuments
    data.bookId = await getNextBookId();
    return this.bookRepo.create(data);
  }

  async getBooks(userId: string, role: string, filters?: BookFilters): Promise<BookResponse> {
    return this.bookRepo.getBooksWithFilters(userId, role, filters);
}

  getBookBySlug(slug: string) {
    return this.bookRepo.findBySlug(slug);
  }

  updateBook(id: string, data: Partial<IBook>) {
    return this.bookRepo.update(id, data);
  }

  deleteBook(id: string) {
    return this.bookRepo.delete(id);
  }
}