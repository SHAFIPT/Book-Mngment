import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { IPurchaseService } from '../services/Interface/IPurchase.Service';
import { HttpStatusCode } from '../constants/statusCode';
import { Messages } from '../constants/messages';

export class PurchaseController {
  constructor(private purchaseService: IPurchaseService) {}

  async createPurchase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId, quantity } = req.body;
      if (!req.user) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: Messages.UNAUTHORIZED });
        return;
      }

      const userId = req.user.id;
      const purchase = await this.purchaseService.createPurchase(bookId, userId, quantity);
      res.status(HttpStatusCode.CREATED).json({ message: Messages.PURCHASE_SUCCESS, purchase });
    } catch (err) {
      next(err);
    }
  }

  async getUserPurchases(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: Messages.UNAUTHORIZED });
        return;
      }

      const userId = req.user.id;
      const history = await this.purchaseService.getUserPurchases(userId);
      res.status(HttpStatusCode.OK).json({ message: Messages.PURCHASE_HISTORY_FETCHED, history });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: Messages.UNAUTHORIZED });
        return;
      }

      const authorId = req.user.id;
      const summary = await this.purchaseService.getAuthorRevenueSummary(authorId);
      res.status(HttpStatusCode.OK).json({ message: Messages.REVENUE_SUMMARY_FETCHED, summary });
    } catch (err) {
      next(err);
    }
  }
}
