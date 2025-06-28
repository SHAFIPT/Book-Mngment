// services/bookService.ts
import type { IBook } from "../types/Ibook";
import axiosInstance from "./api";

export interface IBooks {
    bookId: string;
    title: string;
    description: string;
    price: number;
    authors: string[];
    sellCount: number;
    revenue: number;
    rating?: number;
    reviews?: number;
}

export interface BookFilters {
    page?: number;
    limit?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'title' | 'price' | 'rating' | 'sellCount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    author?: string;
    priceRange?: 'low' | 'medium' | 'high';
}

export interface BookResponse {
    books: IBook[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalBooks: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit: number;
    };
    filters: {
        appliedFilters: BookFilters;
        availableAuthors: { id: string; name: string }[];
        priceRange: { min: number; max: number };
    };
}

// Add Book
// For Author dashboard usage only
type AuthorBookPayload = Omit<IBooks, "bookId" | "sellCount" | "revenue" | "authors">;

export const createBook = async (payload: AuthorBookPayload) => {
  const res = await axiosInstance.post("/api/books", payload);
  return res.data;
};
// Get All Books with Filters, Pagination, and Sorting
export const getBooks = async (filters?: BookFilters): Promise<BookResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
    }
    
    const response = await axiosInstance.get(`/api/books?${params.toString()}`);
    return response.data;
};

// Get Book by Slug
export const getBookBySlug = async (slug: string) => {
    const res = await axiosInstance.get(`/api/books/${slug}`);
    return res.data;
};

// Update Book
export const updateBook = async (id: string, payload: Partial<IBooks>) => {
    const res = await axiosInstance.put(`/api/books/${id}`, payload);
    return res.data;
};

// Delete Book
export const deleteBook = async (id: string) => {
    const res = await axiosInstance.delete(`/api/books/${id}`);
    return res.data;
};