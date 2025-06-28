import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants/statusCode';
import { Messages } from '../constants/messages';
import { INotificationService } from '../services/Interface/INotification.service';

export class NotificationController {
  constructor(private notificationService: INotificationService) {}

  notifyAuthorOnPurchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.notifyAuthorOnPurchase(req.body);
      res.status(HttpStatusCode.OK).json({ success: true, message: Messages.AUTHOR_NOTIFIED });
    } catch (error) {
      next(error);
    }
  };

  sendMonthlyRevenueSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.sendMonthlyRevenueSummary();
      res.status(HttpStatusCode.OK).json({ success: true, message: Messages.MONTHLY_SUMMARY_SENT });
    } catch (error) {
      next(error);
    }
  };

  sendNewBookAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.body;
      await this.notificationService.sendNewBookAnnouncement(bookId);
      res.status(HttpStatusCode.OK).json({ success: true, message: Messages.BOOK_ANNOUNCEMENT_SENT });
    } catch (error) {
      next(error);
    }
  };
  
  sendCustomBulkEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subject, message, recipients } = req.body;
      await this.notificationService.sendCustomBulkEmail(subject, message, recipients);
      res.status(HttpStatusCode.OK).json({ success: true, message: Messages.BULK_EMAIL_SENT });
    } catch (error) {
      next(error);
    }
  };
}
