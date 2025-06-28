import { Request, Response, NextFunction } from 'express';
import { IBookService } from '../services/Interface/IBook.Service';
import { IAdminService } from '../services/Interface/IAdmin.service';
import { HttpStatusCode } from '../constants/statusCode';

export class AdminController {
  constructor(
    private bookService: IBookService,
    private adminService: IAdminService
  ) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search = '', filter = 'all' } = req.query;
      const users = await this.adminService.getAllUsers(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        filter as string
      );
      res.status(HttpStatusCode.OK).json(users);
    } catch (err) {
      next(err);
    }
  };

  getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search = '', filter = 'all' } = req.query;
      const books = await this.adminService.getAllBooks(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        filter as string
      );
      res.status(HttpStatusCode.OK).json({ books });
    } catch (err) {
      next(err);
    }
  };

  createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = await this.bookService.createBook(req.body);
      res.status(HttpStatusCode.CREATED).json(book);
    } catch (err) {
      next(err);
    }
  };

  updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = await this.adminService.updateBook(req.params.id, req.body);
      res.status(HttpStatusCode.OK).json(book);
    } catch (err) {
      next(err);
    }
  };

  deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.adminService.deleteBook(req.params.id);
      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };

  getAllPurchases = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const purchases = await this.adminService.getAllPurchases();
      res.status(HttpStatusCode.OK).json(purchases);
    } catch (err) {
      next(err);
    }
  };

  getRevenueSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.adminService.getRevenueSummary();
      res.status(HttpStatusCode.OK).json(summary);
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedUser = await this.adminService.updateUser(id, updates);
      res.status(HttpStatusCode.OK).json(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteUser(id);
      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
