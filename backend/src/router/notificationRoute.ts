import { Router } from 'express';
import { notificationController } from '../config/container';

const notificationRouter = Router();

notificationRouter.post('/notify-author', notificationController.notifyAuthorOnPurchase);
notificationRouter.post('/monthly-summary', notificationController.sendMonthlyRevenueSummary);
notificationRouter.post('/new-book-announcement', notificationController.sendNewBookAnnouncement);
notificationRouter.post('/custom-bulk-email', notificationController.sendCustomBulkEmail);

export default notificationRouter;