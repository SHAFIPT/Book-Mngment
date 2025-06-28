import { Model, Types } from "mongoose";
import { IReview } from "../../model/Review";
import { IReviewRepository } from "../Interface/IReviewRepository";

export class ReviewRepository implements IReviewRepository {
  constructor(private reviewModel: Model<IReview>) {}

  async addReview(data: Partial<IReview>): Promise<IReview> {
    return this.reviewModel.create(data);
  }

  async getReviewsForBook(bookId: string): Promise<IReview[]> {
    return this.reviewModel.find({ book: bookId }).populate('user', 'name').sort({ createdAt: -1 });
    }
    
    async getAverageRating(bookId: string): Promise<number> {
        const result = await this.reviewModel.aggregate([
        { $match: { book: bookId } }, // no ObjectId casting needed
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        return result[0]?.avgRating || 0;
    }
    
}
