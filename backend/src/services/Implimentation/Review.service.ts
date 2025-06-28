import { IReview } from "../../model/Review";
import { IReviewRepository } from "../../repository/Interface/IReviewRepository";
import { IReviewService } from "../Interface/IReview.service";

export class ReviewService implements IReviewService {
    constructor(private reviewRepo: IReviewRepository) {}
  
    async addReview(data: Partial<IReview>): Promise<IReview> {
      return this.reviewRepo.addReview(data);
    }
  
    async getReviews(bookId: string): Promise<IReview[]> {
      return this.reviewRepo.getReviewsForBook(bookId);
    }
  
    async getBookRating(bookId: string): Promise<number> {
      return this.reviewRepo.getAverageRating(bookId);
    }
  }