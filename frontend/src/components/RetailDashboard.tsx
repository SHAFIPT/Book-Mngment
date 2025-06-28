import React, { useState, useEffect, useCallback } from 'react';
import { Book, ShoppingCart, History, Search, Star, Calendar, DollarSign, Mail, BookOpen, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import LogoutButton from '../hooks/LogoutButton';
import { getBooks } from '../services/bookService';
import { createPurchase, getPurchaseHistory } from '../services/purchaseService';
import toast from 'react-hot-toast';
import type { IBook } from '../types/Ibook';
import { addReview, getBookRating, getBookReviews } from '../services/reviewService';
import ProfileCard from './ProfileCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store/store';

export type SortField = 'title' | 'price' | 'rating' | 'sellCount' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface IReview {
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  createdAt: string;
}


export interface BookFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  author?: string;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}
interface AppliedFilters {
  search?: string;
  sortBy?: 'title' | 'price' | 'rating' | 'sellCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  priceRange?: 'low' | 'medium' | 'high';
  author?: string;
  page?: number;
  limit?: number;
}
interface BookResponse {
  books: IBook[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBooks: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    appliedFilters: AppliedFilters;
    availableAuthors: { id: string; name: string }[];
    priceRange: { min: number; max: number };
  };
  message?: string;
}
interface Purchase {
  purchaseId: string;
  purchaseDate: string;
  quantity: number;
  price: number;
  book: {
    title: string;
    authors: { name: string }[];
  };
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const RetailDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('browse');
  const [books, setBooks] = useState<IBook[]>([]);

  const [bookResponse, setBookResponse] = useState<BookResponse>({
    books: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalBooks: 0,
      limit: 10,
      hasNext: false,
      hasPrev: false
    },
    filters: {
      appliedFilters: {},
      availableAuthors: [],
      priceRange: { min: 0, max: 1000 }
    },
    message: ''
  });
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeReviews, setActiveReviews] = useState<IReview[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [purchasePage, setPurchasePage] = useState(1);
  const user = useSelector((state: RootState) => state.user.user)
  
  // Filter and pagination state
  const [filters, setFilters] = useState<BookFilters>({
    search: '',
    category: '',
    minPrice: 100,
    maxPrice: 1000,
    author: '',
    page: 1,
    limit: 12,
    sortBy: 'title',
    sortOrder: 'asc'
  });

 const fetchBookRatingAndReviewCount = async (bookId: string) => {
    const [ratingRes, reviewsRes] = await Promise.all([
      getBookRating(bookId),
      getBookReviews(bookId),
    ]);
  
    return {
      rating: ratingRes.rating || 0,
      reviews: reviewsRes.reviews?.length || 0,
    };
  };
  

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBooks(filters);
      const booksWithRating = await Promise.all(
        response.books.map(async (book) => {
          const { rating, reviews } = await fetchBookRatingAndReviewCount(book.bookId);
          return { ...book, rating, reviews };
        })
      );
  
      setBookResponse(response);
      setBooks(booksWithRating);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [filters]);  
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]); 


  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const historyRes = await getPurchaseHistory();
        setPurchases(historyRes.history);
      } catch (error) {
        console.error('Error fetching purchase history:', error);
      }
    };
    fetchPurchaseHistory();
  }, []);

  // Calculate user statistics
  const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.price * purchase.quantity), 0);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

  const handleBookClick = (book: IBook) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedBook) return;
    if (selectedBook.price < 100 || selectedBook.price > 1000) {
      toast.error("Book price must be between ₹100 and ₹1000.");
      return;
    }
    setPurchaseLoading(true);
    try {
      await createPurchase({ bookId: selectedBook.bookId, quantity });
      setShowPurchaseModal(false);
      setQuantity(1);
      toast.success(`Purchased ${quantity} copy(ies) of "${selectedBook.title}"`);
  
      const historyRes = await getPurchaseHistory();
      setPurchases(historyRes.history);
    } catch (error) {
      console.error('Purchase failed', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };
  

  const handleShowReviews = async (bookId: string) => {
    setReviewLoading(true);
    setShowReviewModal(true);
    try {
      const res = await getBookReviews(bookId);
      setActiveReviews(res.reviews || []); 
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleFilterChange = <K extends keyof BookFilters>(
    key: K,
    value: BookFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number),
    }));
  };
  
  const handleSubmitReview = async () => {
    if (!selectedBook) return;
    setSubmitReviewLoading(true);
    try {
      await addReview({
        book: selectedBook.bookId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
  
      toast.success('Review submitted successfully!');
      setReviewData({ rating: 0, comment: '' });
  
      const updatedReviews = await getBookReviews(selectedBook.bookId);
      setSelectedBook(prev => prev ? { ...prev, reviewsData: updatedReviews.reviews } : null);
    } catch (error) {
      console.error('Review submission failed', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitReviewLoading(false);
    }
  };
  
  

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 100,
      maxPrice: 1000,
      author: '',
      page: 1,
      limit: 12,
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const renderPagination = () => {
    const { pagination } = bookResponse;
    if (!pagination) return null;
  
    const { currentPage, totalPages, hasNext, hasPrev, limit, totalBooks } = pagination;
  
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalBooks)} of {totalBooks} books
        </div>
  
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrev}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
  
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }
  
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
  
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-100 to-amber-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-700">Welcome, Reader!</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                My Profile
              </button>
              <LogoutButton />
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Books Available</p>
                <p className="text-2xl font-bold text-blue-600">{bookResponse.pagination.totalBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Books Purchased</p>
                <p className="text-2xl font-bold text-green-600">{totalPurchases}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">₹{totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-orange-600">{purchases.length}</p>
              </div>
              <History className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'browse' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Purchase History
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Notifications
            </button>
          </div>

          <div className="p-6">

          {activeTab === 'profile' && user && (
            <div>
              <ProfileCard
                name={user.name}
                email={user.email}
                role="RETAIL"
              />  
            </div>
          )}
            
            {/* Browse Books Tab */}
            {activeTab === 'browse' && (
              <div>
             {/* Enhanced Search and Filters */}
                  <div className="mb-8 space-y-6">

                  {/* Search and Clear Button */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search books, authors, or titles..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                      <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortByRaw, sortOrderRaw] = e.target.value.split('-');

                          // Assert string literals to match the types
                          handleFilterChange('sortBy', sortByRaw as SortField);
                          handleFilterChange('sortOrder', sortOrderRaw as SortOrder);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="title-asc">Title A-Z</option>
                        <option value="title-desc">Title Z-A</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="sellCount-desc">Most Popular</option>
                        <option value="rating-desc">Highest Rated</option>
                        <option value="createdAt-desc">Newest First</option>
                      </select>
                    </div>

                    {/* Items Per Page */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Show</label>
                      <select
                        value={filters.limit}
                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={6}>6 per page</option>
                        <option value={12}>12 per page</option>
                        <option value={24}>24 per page</option>
                        <option value={48}>48 per page</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₹)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min"
                        />
                        <span className="text-gray-500">–</span>
                        <input
                          type="number"
                          min="0"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    
                  </div>
                  </div>


                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-gray-500 mt-2">Loading books...</p>
                  </div>
                )}

                {/* Books Grid */}
                {!loading && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {books.map((book) => (
                        <div
                          key={book.bookId}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                          <div
                            className="p-5 cursor-pointer"
                            onClick={() => handleBookClick(book)}
                          >
                            {/* Title */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">
                              {book.title}
                            </h3>

                            {/* Authors */}
                            <p className="text-sm text-gray-500 mb-2">
                              by {book.authors.join(', ')}
                            </p>

                            {/* Description */}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {book.description}
                            </p>

                            {/* Price and Sold */}
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-lg font-bold text-blue-600">₹{book.price}</span>
                              <span className="text-sm text-gray-500">{book.sellCount} sold</span>
                            </div>

                            {/* Rating and Reviews */}
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                              {renderStars(Number((book.rating || 0).toFixed(1)))}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowReviews(book.bookId);
                                }}
                                className="text-blue-600 underline text-xs hover:text-blue-800"
                              >
                                {book.reviews ?? 0} Reviews
                              </button>
                            </div>
                          </div>

                          {/* Buy Button */}
                          <div className="px-5 pb-5">
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBook(book);
                                setShowPurchaseModal(true);
                              }}
                              disabled={purchaseLoading}
                              className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              {purchaseLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4" />
                                  Buy Now
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>


                    {books.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No books found matching your criteria</p>
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}

                    {/* Pagination */}
                    {books.length > 0 && renderPagination()}
                  </>
                )}
              </div>
            )}
              {/* Purchase History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Your Purchase History</h2>

                  {/* Pagination logic */}
                  {(() => {
                    const purchaseLimit = 5;
                    const totalPages = Math.ceil(purchases.length / purchaseLimit);
                    const startIndex = (purchasePage - 1) * purchaseLimit;
                    const endIndex = startIndex + purchaseLimit;
                    const paginatedPurchases = purchases.slice(startIndex, endIndex);

                    return (
                      <>
                        {paginatedPurchases.map((purchase) => (
                          <div
                            key={purchase.purchaseId}
                            className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                {purchase.book ? (
                                  <>
                                    <h3 className="font-semibold text-lg mb-1">
                                      {purchase.book.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                      by{' '}
                                      {purchase.book.authors
                                        .map((author) => author.name)
                                        .join(', ')}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h3 className="font-semibold text-lg mb-1 text-red-500">
                                      Book no longer available
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-2">
                                      This book was removed or is unavailable.
                                    </p>
                                  </>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                                  </span>
                                  <span>Order ID: {purchase.purchaseId}</span>
                                  <span>Quantity: {purchase.quantity}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  ₹{(purchase.price * purchase.quantity).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">₹{purchase.price} each</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div className="flex justify-center mt-6 gap-2">
                            <button
                              onClick={() => setPurchasePage((prev) => Math.max(prev - 1, 1))}
                              disabled={purchasePage === 1}
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                              Previous
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setPurchasePage(index + 1)}
                                className={`px-3 py-1 rounded ${
                                  purchasePage === index + 1
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                                } hover:bg-blue-600 hover:text-white`}
                              >
                                {index + 1}
                              </button>
                            ))}

                            <button
                              onClick={() =>
                                setPurchasePage((prev) => Math.min(prev + 1, totalPages))
                              }
                              disabled={purchasePage === totalPages}
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-1">New Release Alert!</h3>
                        <p className="text-blue-700 text-sm mb-2">
                          "Advanced Programming Concepts" by Tech Master is now available!
                        </p>
                        <p className="text-blue-600 text-xs">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-800 mb-1">Trending Now</h3>
                        <p className="text-green-700 text-sm mb-2">
                          "Digital Revolution" is trending this week with 4.8★ rating!
                        </p>
                        <p className="text-green-600 text-xs">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-purple-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-800 mb-1">Review Reminder</h3>
                        <p className="text-purple-700 text-sm mb-2">
                          Don't forget to review "The Great Adventure" - your feedback matters!
                        </p>
                        <p className="text-purple-600 text-xs">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Book Reviews"
      >
        {reviewLoading ? (
          <div className="text-center text-gray-500 py-6">Loading reviews...</div>
        ) : activeReviews.length === 0 ? (
          <div className="text-center text-gray-400 py-6">No reviews yet.</div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activeReviews.map((review, index) => (
              <div key={index} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{review.user?.name || 'Anonymous'}</span>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-1">{renderStars(Number((review.rating || 0).toFixed(1)))}</div>
                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>


      {/* Book Details Modal */}
      <Modal 
        isOpen={showBookModal} 
        onClose={() => setShowBookModal(false)}
        title="Book Details"
      >
        {selectedBook && (
          <div className="space-y-6 text-gray-800">
            
            {/* Book Title & Author */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                by <span className="font-medium">{selectedBook.authors.join(', ')}</span>
              </p>
              {selectedBook.rating && selectedBook.rating > 0 && (
               <div className="mt-2 flex items-center gap-2 text-sm text-yellow-500">
               {renderStars(Number((selectedBook.rating ?? 0).toFixed(1)))}
               <span className="text-gray-500 text-xs">
                 • {selectedBook.reviews} reviews
               </span>
             </div>
             
             
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-1">Description:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedBook.description}
              </p>
            </div>

            {/* Pricing and Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t pt-4">
              <div>
                <p className="text-xl font-bold text-green-600">₹{selectedBook.price}</p>
                <p className="text-sm text-gray-500">{selectedBook.sellCount} copies sold</p>
              </div>

              <button
                onClick={() => {
                  setShowBookModal(false);
                  setShowPurchaseModal(true);
                }}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            {/* Review Form */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Leave a Review</h4>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                    className={`w-5 h-5 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="w-full border rounded-md p-2 text-sm text-gray-800 mb-2"
                rows={3}
                placeholder="Write your thoughts..."
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              />

              <button
                onClick={handleSubmitReview}
                disabled={submitReviewLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {submitReviewLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>

            {selectedBook.reviewsData && selectedBook.reviewsData.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">User Reviews:</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {selectedBook.reviewsData.map((review, i) => (
                      <div key={i} className="bg-gray-100 rounded-md p-3 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-800">{review.user?.name || 'Anonymous'}</span>
                          <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


          </div>
        )}
      </Modal>

      {/* Purchase Modal */}
      <Modal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)}
        title="Purchase Book"
      >
        {selectedBook && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg">{selectedBook.title}</h3>
              <p className="text-gray-600">by {selectedBook.authors.map((author) => author.name).join(', ')}</p>
              <p className="text-xl font-bold text-green-600 mt-2">₹{selectedBook.price}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">₹{(selectedBook.price * quantity).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePurchase}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Confirm Purchase
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RetailDashboard;