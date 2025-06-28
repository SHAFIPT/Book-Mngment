import { IBook } from '../../model/Book';
import { BookFilters, BookResponse } from '../../types/BookTypes';

export interface IBookRepository {
  create(data: Partial<IBook>): Promise<IBook>;
  findAll(): Promise<IBook[]>;
  findBySlug(slug: string): Promise<IBook | null>;
  update(id: string, data: Partial<IBook>): Promise<IBook | null>;
  delete(id: string): Promise<void>;
  countBooks(): Promise<number>;
  getBookStats(userId: string, role: string): Promise<any[]>;
  getBooksWithFilters(userId: string, role: string, filters?: BookFilters): Promise<BookResponse>;
}
