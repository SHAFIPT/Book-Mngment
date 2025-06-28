import { Router } from 'express';
import { reviewController } from '../config/container';
import { authenticate } from '../middleware/authMiddleware';
import { checkUserActiveStatus } from '../middleware/checkUserActiveStatus';

const reviewRouter = Router();

reviewRouter.post('/', authenticate, checkUserActiveStatus , reviewController.addReview.bind(reviewController));
reviewRouter.get('/:bookId', reviewController.getBookReviews.bind(reviewController));
reviewRouter.get('/rating/:bookId', reviewController.getBookRating.bind(reviewController));

export default reviewRouter;
