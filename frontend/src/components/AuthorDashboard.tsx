import React, { useState, useEffect } from 'react';
import { Book, DollarSign, Plus, Edit, Trash2, TrendingUp, Calendar, Mail, Users } from 'lucide-react';
import LogoutButton from '../hooks/LogoutButton';
import type { IBook } from '../types/Ibook';
import type { RevenueData } from '../types/IRevenue';
import { createBook, deleteBook, getBooks, updateBook, type IBooks } from '../services/bookService';
import toast from 'react-hot-toast';
import { BOOK_MESSAGES } from '../constants/messages';
import { getRevenueSummary } from '../services/purchaseService';
import ProfileCard from './ProfileCard';
import type { RootState } from '../redux/store/store';
import { useSelector } from 'react-redux';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// Modal Component moved outside the main component
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const AuthorDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);
  const [books, setBooks] = useState<IBook[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const user = useSelector((state: RootState) => state.user.user)
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    currentMonth: 0,
    currentYear: 0,
    totalRevenue: 0,
    totalSales: 0,
    monthlyData: []
  });
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    price: '',
    authors: ''
  });

  useEffect(() => {
    loadBooks();
    fetchRevenue();
  }, []);
  
  const fetchRevenue = async () => {
    try {
      const response = await getRevenueSummary();
      setRevenueData(response.summary);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
      toast.error('Failed to load revenue summary');
    }
  };

  const loadBooks = async () => {
    try {
      const response = await getBooks();
      console.log("Books fetched from API:", response);
      setBooks(response.books);
    } catch (err) {
      console.error(BOOK_MESSAGES.FETCH_ERROR, err);
      toast.error(BOOK_MESSAGES.FETCH_ERROR);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Helper functions
  const handleAddBook = async () => {
    const price = parseFloat(newBook.price);
  
    if (!newBook.title.trim() || !newBook.description.trim()) {
      toast.error("All fields are required.");
      return;
    }
  
    if (isNaN(price) || price < 100 || price > 1000) {
      toast.error("Price must be between ₹100 and ₹1000");
      return;
    }
  
    try {
      const payload = {
        title: newBook.title,
        description: newBook.description,
        price,
      };
  
      await createBook(payload); // API call
      toast.success("Book added successfully!");
      setShowAddBookModal(false);
      setNewBook({ title: "", description: "", price: "", authors: "" });
      loadBooks(); // refresh list
    } catch (err) {
      toast.error("Failed to add book");
      console.error(err);
    }
  };
  
  
  

  const handleEditBook = (book : IBook) => {
    setSelectedBook(book);
    setNewBook({
      title: book.title,
      description: book.description,
      price: book.price.toString(),
      authors: book.authors.join(', ')
    });
    setShowEditBookModal(true);
  };

  const handleUpdateBook = async () => {
    if (!selectedBook) return;
  
    const parsedPrice = parseFloat(newBook.price);
  
    if (isNaN(parsedPrice) || parsedPrice < 100 || parsedPrice > 1000) {
      toast.error("Price must be between ₹100 and ₹1000");
      return;
    }
  
    try {
      const payload: Partial<Omit<IBooks, 'bookId' | 'sellCount' | 'revenue' | 'authors'>> = {
        title: newBook.title,
        description: newBook.description,
        price: parsedPrice,
      };
  
      await updateBook(selectedBook.bookId, payload);
      toast.success(BOOK_MESSAGES.UPDATE_SUCCESS);
  
      setSelectedBook(null);
      setNewBook({ title: "", description: "", price: "", authors: "" });
      setShowEditBookModal(false);
      loadBooks();
    } catch (err) {
      console.error(BOOK_MESSAGES.SERVER_ERROR, err);
      toast.error(BOOK_MESSAGES.SERVER_ERROR);
    }
  };
  
  
  

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await deleteBook(bookToDelete);
      toast.success(BOOK_MESSAGES.DELETE_SUCCESS);
      loadBooks();
    } catch (err) {
      console.error(BOOK_MESSAGES.SERVER_ERROR, err);
      toast.error(BOOK_MESSAGES.SERVER_ERROR);
    } finally {
      setShowConfirmDelete(false);
      setBookToDelete(null);
    }
  };
  

  const sendRevenueEmail = () => {
    console.log('Sending revenue email with data:', {
      currentMonth: revenueData.currentMonth,
      currentYear: revenueData.currentYear,
      totalRevenue: revenueData.totalRevenue
    });
    alert('Revenue email sent successfully!');
  };

  const handleCloseAddModal = () => {
    setShowAddBookModal(false);
    setNewBook({ title: "", description: "", price: "", authors: "" });
  };

  const handleCloseEditModal = () => {
    setShowEditBookModal(false);
    setSelectedBook(null);
    setNewBook({ title: "", description: "", price: "", authors: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-100 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-700">Author Dashboard</h1>
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
                <p className="text-sm text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-blue-600">{books.length}</p>
              </div>
              <Book className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{revenueData.currentMonth?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yearly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">₹{revenueData.currentYear?.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-orange-600">{books?.reduce((sum, book) => sum + book.sellCount, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'books' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Manage Books
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'revenue' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Revenue Tracking
            </button>
          </div>

          <div className="p-6">

          {activeTab === 'profile' && user && (
            <div>
              <ProfileCard
                name={user.name}
                email={user.email}
                role="AUTHOR"
              />  
            </div>
          )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Welcome Back, Author!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2">📚 Recent Activity</h3>
                    <p className="text-gray-600 mb-4">Your latest book sales and updates</p>
                    <ul className="space-y-2">
                      <li className="text-sm">• 3 new sales today</li>
                      <li className="text-sm">• Revenue increased by 12% this month</li>
                      <li className="text-sm">• 2 books trending in top 10</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2">🎯 Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('books')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Add New Book
                      </button>
                      <button
                        onClick={sendRevenueEmail}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Send Revenue Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

           {/* Books Management Tab */}
            {activeTab === 'books' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold">Manage Books</h2>
                  <button
                    onClick={() => setShowAddBookModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Book
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <div key={book.bookId} className="relative bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                      
                      {/* Status Badge */}
                      {book.status && (
                        <span
                          className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full 
                            ${book.status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : book.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-gray-200 text-gray-700'}`}
                        >
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </span>
                      )}

                      <h3 className="font-semibold text-lg mb-2 truncate">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium">₹{book.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sales:</span>
                          <span className="font-medium">{book.sellCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Revenue:</span>
                          <span className="font-medium text-green-600">₹{book.revenue?.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setBookToDelete(book.bookId);
                            setShowConfirmDelete(true);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold">Revenue Tracking</h2>
                  <button
                    onClick={sendRevenueEmail}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Send Revenue Email
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6" />
                      <h3 className="font-semibold">This Month</h3>
                    </div>
                    <p className="text-2xl font-bold">₹{revenueData.currentMonth?.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-6 h-6" />
                      <h3 className="font-semibold">This Year</h3>
                    </div>
                    <p className="text-2xl font-bold">₹{revenueData.currentYear?.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-6 h-6" />
                      <h3 className="font-semibold">Total Revenue</h3>
                    </div>
                    <p className="text-2xl font-bold">₹{revenueData.totalRevenue?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Revenue Chart</h3>
                  <div className="space-y-4">
                    {revenueData.monthlyData?.map((data, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-12 text-sm font-medium">{data.month}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500"
                            style={{ width: `${(data.revenue / Math.max(...revenueData.monthlyData.map(d => d.revenue))) * 100}%` }}
                          ></div>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            ₹{data.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      <Modal isOpen={showAddBookModal} onClose={handleCloseAddModal} title="Add New Book">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder="Enter book description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (₹100 - ₹1000)</label>
            <input
              type="number"
              value={newBook.price}
              onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              min={100}
              max={1000}
              placeholder="Enter price"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddBook}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Add Book
            </button>
            <button
              onClick={handleCloseAddModal}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>


      {/* Edit Book Modal */}
      <Modal 
        isOpen={showEditBookModal} 
        onClose={handleCloseEditModal}
        title="Edit Book"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newBook.description}
              onChange={(e) => setNewBook({...newBook, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter book description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹100 - ₹1000)</label>
            <input
              type="number"
              min="100"
              max="1000"
              value={newBook.price}
              onChange={(e) => setNewBook({...newBook, price: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpdateBook}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Update Book
            </button>
            <button
              onClick={handleCloseEditModal}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setBookToDelete(null);
        }}
        title="Confirm Delete"
      >
        <div className="text-gray-700 mb-4">
          Are you sure you want to delete this book?
        </div>
        <div className="flex gap-3">
          <button
            onClick={confirmDeleteBook}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => {
              setShowConfirmDelete(false);
              setBookToDelete(null);
            }}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AuthorDashboard;