import { IBook } from '../../model/Book';
import { BookFilters, BookResponse } from '../../types/BookTypes';

export interface IBookService {
  createBook(data: Partial<IBook>): Promise<IBook>;
  getBooks(userId: string, role: string, filters?: BookFilters): Promise<BookResponse>;
  getBookBySlug(slug: string): Promise<IBook | null>;
  updateBook(id: string, data: Partial<IBook>): Promise<IBook | null>;
  deleteBook(id: string): Promise<void>;
}
