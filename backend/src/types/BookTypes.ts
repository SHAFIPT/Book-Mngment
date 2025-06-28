
// types/BookTypes.ts
import { Types, Document } from 'mongoose';

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
    books: IBooks[];
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

// Lean document type for MongoDB queries
export interface BookLeanDocument {
    _id: Types.ObjectId;
    bookId: string;
    title: string;
    slug: string;
    authors: Array<{ _id: Types.ObjectId; name: string; email: string }>;
    description: string;
    price: number;
    status: 'approved' | 'rejected' | 'pending';
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface BookStats {
    _id: Types.ObjectId;
    bookId: string;
    title: string;
    slug: string;
    authors: Array<{ _id: Types.ObjectId; name: string; email: string }>;
    description: string;
    price: number;
    status: 'approved' | 'rejected' | 'pending';
    createdAt: Date;
    updatedAt: Date;
    sellCount: number;
    revenue: number;
    rating: number;
    reviews: number;
}