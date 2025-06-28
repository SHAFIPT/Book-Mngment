import axiosInstance from './api';

export interface AddReviewPayload {
  book: string;
  rating: number;
  comment: string;
}

export const addReview = async (payload: AddReviewPayload) => {
  const res = await axiosInstance.post('/api/reviews', payload);
  return res.data;
};

export const getBookReviews = async (bookId: string) => {
    const res = await axiosInstance.get(`/api/reviews/${bookId}`);
  return res.data;
};

export const getBookRating = async (bookId: string) => {
  const res = await axiosInstance.get(`/api/reviews/rating/${bookId}`);
  return res.data;
};
