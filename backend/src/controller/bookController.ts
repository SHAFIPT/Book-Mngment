import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants/statusCode';
import { Messages } from '../constants/messages';
import { IBookService } from '../services/Interface/IBook.Service';
import { AuthenticatedRequest } from '../types/express';
import { BookFilters } from '../types/BookTypes';

export class BookController {
  constructor(private bookService: IBookService) {}

  createBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, id: userId } = req.user!;
      const { title, description, price, authors } = req.body;
      let authorList;

      if (role === 'ADMIN') {
        if (!authors || !Array.isArray(authors) || authors.length === 0) {
          res.status(HttpStatusCode.BAD_REQUEST).json({ message: Messages.VALIDATION_FAILED });
          return;
        }
        authorList = authors;
      } else if (role === 'AUTHOR') {
        authorList = [userId];
      } else {
        res.status(HttpStatusCode.FORBIDDEN).json({ message: Messages.UNAUTHORIZED });
        return;
      }

      const book = await this.bookService.createBook({
        title,
        description,
        price,
        authors: authorList,
      });

      res.status(HttpStatusCode.CREATED).json({ message: Messages.BOOK_CREATED, book });
    } catch (err) {
      next(err);
    }
  };

  getBooks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, id: userId } = req.user!;
      const filters: BookFilters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as 'title' | 'price' | 'rating' | 'sellCount' | 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        author: req.query.author as string,
        priceRange: req.query.priceRange as 'low' | 'medium' | 'high',
      };

      const result = await this.bookService.getBooks(userId, role, filters);
      res.status(HttpStatusCode.OK).json({
        message: Messages.BOOKS_LISTED,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  };

  getBookBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const book = await this.bookService.getBookBySlug(req.params.slug);
      if (!book) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: Messages.BOOK_NOT_FOUND });
        return;
      }
      res.status(HttpStatusCode.OK).json({ message: Messages.BOOK_FETCHED, book });
    } catch (err) {
      next(err);
    }
  };

  updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const book = await this.bookService.updateBook(req.params.id, req.body);
      res.status(HttpStatusCode.OK).json({ message: Messages.BOOK_UPDATED, book });
    } catch (err) {
      next(err);
    }
  };

  deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.bookService.deleteBook(req.params.id);
      res.status(HttpStatusCode.OK).json({ message: Messages.BOOK_DELETED });
    } catch (err) {
      next(err);
    }
  };
}
