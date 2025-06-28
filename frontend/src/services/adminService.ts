import type { IBook } from "../types/Ibook";
import axiosInstance from "./api";
import toast from 'react-hot-toast';
import type { AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import type { Book, Purchase, Revenue, User } from "../components/AdminDashboard";

// Type definitions for service parameters
interface FetchUsersParams {
  page: number;
  limit: number;
  search: string;
  filter: string;
}

interface FetchBooksParams {
  page: number;
  limit: number;
  search: string;
  filter: string;
}

interface BookPayload {
  title: string;
  authors: string[];
  price: number;
  description: string;
  status: string;
}

interface BooksResponse {
    books: {
      books: Book[];          // actual list of books
      currentPage: number;
      totalPages: number;
      totalBooks: number;
    };
  }

interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error handler utility
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || defaultMessage;
    toast.error(message);
  } else {
    toast.error(defaultMessage);
  }
  throw error;
};

// Get All Users
export const fetchAllUsers = async (
    params: FetchUsersParams
  ): Promise<User[]> => {
    try {
      const res: AxiosResponse<User[]> = await axiosInstance.get('/api/admin/users', { params });
      return res.data;
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch users');
    }
  };

export const fetchAllBooks = async (params: FetchBooksParams): Promise<BooksResponse> => {
  try {
    const res: AxiosResponse<BooksResponse> = await axiosInstance.get('/api/admin/books', {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch books');
  }
};

// Create Book
export const createBook = async (payload: BookPayload): Promise<ApiSuccess<IBook>> => {
  try {
    const res: AxiosResponse<ApiSuccess<IBook>> = await axiosInstance.post('/api/admin/books', payload);
    toast.success('Book created successfully!');
    return res.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to create book');
  }
};

// Update Book - using bookId instead of _id
export const updateBook = async (bookId: string, payload: BookPayload): Promise<ApiSuccess<IBook>> => {
  try {
    const res: AxiosResponse<ApiSuccess<IBook>> = await axiosInstance.put(`/api/admin/books/${bookId}`, payload);
    toast.success('Book updated successfully!');
    return res.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update book');
  }
};

// Delete Book - using bookId instead of _id
export const deleteBook = async (bookId: string): Promise<ApiSuccess<{ message: string }>> => {
  try {
    const res: AxiosResponse<ApiSuccess<{ message: string }>> = await axiosInstance.delete(`/api/admin/books/${bookId}`);
    toast.success('Book deleted successfully!');
    return res.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to delete book');
  }
};

export const fetchAllPurchases = async (): Promise<Purchase[]> => {
    try {
      const res: AxiosResponse<Purchase[]> = await axiosInstance.get('/api/admin/purchases');
      return res.data;
    } catch (error: unknown) {
      return handleApiError(error, 'Failed to fetch purchases');
    }
  }

// Get Revenue Summary
export const fetchRevenueSummary = async (): Promise<Revenue> => {
  try {
    const res: AxiosResponse<Revenue> = await axiosInstance.get('/api/admin/revenue-summary');
    return res.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch revenue summary');
  }
};

// Update user
export const updateUser = async (userId: string, payload: Partial<User>): Promise<User> => {
    try {
      const res: AxiosResponse<User> = await axiosInstance.put(`/api/admin/users/${userId}`, payload);
      toast.success('User updated successfully');
      return res.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update user');
    }
  };
  
  // Delete user
  export const deleteUser = async (userId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to delete user');
    }
  };
  