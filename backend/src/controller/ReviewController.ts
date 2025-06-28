import { Request, Response } from "express";
import { HttpStatusCode } from "../constants/statusCode";
import { Messages } from "../constants/messages"; // Import messages
import { IReviewService } from "../services/Interface/IReview.service";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";

export class ReviewController {
  constructor(private reviewService: IReviewService) {}

  async addReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: Messages.UNAUTHORIZED });
      return;
    }

    const { book, rating, comment } = req.body;
    const userId = new Types.ObjectId(req.user.id);
    const review = await this.reviewService.addReview({
      book,
      rating,
      comment,
      user: userId,
    });

    res
      .status(HttpStatusCode.CREATED)
      .json({ message: Messages.REVIEW_ADDED, review });
  }

  async getBookReviews(req: Request, res: Response): Promise<void> {
    const { bookId } = req.params;
    const reviews = await this.reviewService.getReviews(bookId);
    res
      .status(HttpStatusCode.OK)
      .json({ message: Messages.REVIEWS_FETCHED, reviews });
  }

  async getBookRating(req: Request, res: Response): Promise<void> {
    const { bookId } = req.params;
    const rating = await this.reviewService.getBookRating(bookId);
    res
      .status(HttpStatusCode.OK)
      .json({ message: Messages.RATING_FETCHED, rating });
  }
}
