// model/Review.ts
import { Schema, model, Types, Document } from 'mongoose';

export interface IReview extends Document {
  book: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
  createdAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    book: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
