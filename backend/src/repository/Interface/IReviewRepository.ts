import { IReview } from "../../model/Review";

export interface IReviewRepository {
    addReview(data: Partial<IReview>): Promise<IReview>;
    getReviewsForBook(bookId: string): Promise<IReview[]>;
    getAverageRating(bookId: string): Promise<number>;
  }
  