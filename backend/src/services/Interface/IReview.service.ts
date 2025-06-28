import { IReview } from "../../model/Review";

export interface IReviewService {
    addReview(data: Partial<IReview>): Promise<IReview>;
    getReviews(bookId: string): Promise<IReview[]>;
    getBookRating(bookId: string): Promise<number>;
  }