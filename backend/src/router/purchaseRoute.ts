import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { purchaseController } from '../config/container';
import { checkUserActiveStatus } from '../middleware/checkUserActiveStatus';

const purchaseRoute = Router();

purchaseRoute.post('/', authenticate, checkUserActiveStatus ,(req, res, next) =>
  purchaseController.createPurchase(req, res, next)
);

purchaseRoute.get('/history', authenticate, checkUserActiveStatus , (req, res, next) =>
  purchaseController.getUserPurchases(req, res, next)
);

// ✅ Revenue route for authors
purchaseRoute.get('/revenue-summary', authenticate, checkUserActiveStatus , (req, res, next) =>
  purchaseController.getRevenueSummary(req, res, next)
);

export default purchaseRoute;
