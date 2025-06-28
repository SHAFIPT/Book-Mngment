import type { IReview } from "../components/RetailDashboard";

export interface Author {
  _id: string;
  name: string;
  email: string;
}

export interface IBook {
  bookId: string;
  title: string;
  description: string;
  price: number;
  authors: Author[];  // ✅ Change from string[] to Author[]
  sellCount: number;
  revenue: number;
  rating?: number;
  reviews?: number;
  reviewsData?: IReview[];
  status?: string;
}
