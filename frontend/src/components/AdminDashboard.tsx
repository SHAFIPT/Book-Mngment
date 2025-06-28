import { useState, useEffect, useCallback } from 'react';
import type { ReactNode, FC } from 'react';
import type { IconType } from 'react-icons';
import { 
  Users, BookOpen, TrendingUp, Mail, Plus, Edit, Trash2, 
  Search,IndianRupee, Calendar, BarChart3, ChevronLeft, ChevronRight,
  User
} from 'lucide-react';
import { createBook, deleteBook, deleteUser, fetchAllBooks, fetchAllPurchases, fetchAllUsers, fetchRevenueSummary, updateBook, updateUser } from '../services/adminService';
import LogoutButton from '../hooks/LogoutButton';
import toast from 'react-hot-toast';
import { sendCustomBulkEmail, sendNewBookAnnouncement } from '../services/notificationService';
import type { AxiosError } from 'axios';
import ProfileCard from './ProfileCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store/store';

// Type definitions
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

interface Author {
  _id: string;
  name: string;
  email: string;
}

export interface Book {
  _id: string;
  bookId: string;
  title: string;
  authors: Author[] | string[];
  price: number;
  description: string;
  status: string;
  totalSales: number;
}

export interface Purchase {
  purchaseId: string;
  bookId: string;
  userId: string;
  purchaseDate: string;
  price: number;
  quantity: number;
}

export interface Purchas1e {
  purchaseId: string;
  bookId: string;
  userId: string;
  purchaseDate: string;
  price: number;
  quantity: number;

  // Add these two optional fields:
  book?: Book | null;
  user?: User | null;
}

export interface Revenue {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  totalAuthors: number;
}

interface BookPagination {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color: string;
  subtitle?: string;
}

interface UserForm {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface BookForm {
  title: string;
  authors: string[] | string;
  price: string;
  description: string;
  status: string;
}

export type EmailForm = {
  subject: string;
  message: string;
  recipients: 'all' | 'active' | 'authors';
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

// Pagination Component
const Pagination: FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                disabled={typeof page === 'string'}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : typeof page === 'string'
                    ? 'bg-white border-gray-300 text-gray-300 cursor-default'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard: FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`w-8 h-8 ${color.replace('text-', 'text-').replace('-600', '-500')}`} />
    </div>
  </div>
);

const AdminDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [purchases, setPurchases] = useState<Purchas1e[]>([]);
  const [purchasePage, setPurchasePage] = useState(1);
  const user = useSelector((state: RootState) => state.user.user)
  const [revenue, setRevenue] = useState<Revenue>({ 
    totalRevenue: 0, 
    monthlyRevenue: 0, 
    totalSales: 0, 
    totalAuthors: 0 
  });
  const [bookPagination, setBookPagination] = useState<BookPagination>({ 
    currentPage: 1, 
    totalPages: 1, 
    totalBooks: 0 
  });
  const [userPagination, setUserPagination] = useState<BookPagination>({ 
    currentPage: 1, 
    totalPages: 1, 
    totalBooks: 0 
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showBookAnnouncementModal, setShowBookAnnouncementModal] = useState(false);
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);
  const [sendingBookAnnouncement, setSendingBookAnnouncement] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
   {/* Pagination state setup */}
   const purchaseLimit = 5
   const totalPurchasePages = Math.ceil(purchases.length / purchaseLimit);
   const paginatedPurchases = purchases.slice(
     (purchasePage - 1) * purchaseLimit,
     purchasePage * purchaseLimit
   );

  // Form states
  const [userForm, setUserForm] = useState<UserForm>({ 
    name: '', 
    email: '', 
    role: 'RETAIL', 
    status: 'active' 
  });
  const [bookForm, setBookForm] = useState<BookForm>({
    title: '',
    authors: [],
    price: '',
    description: '',
    status: 'pending'
  });
  const [emailForm, setEmailForm] = useState<EmailForm>({ 
    subject: '', 
    message: '', 
    recipients: 'all' 
  });
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState<string>('');
  const [bookSearch, setBookSearch] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [bookFilter] = useState<string>('all');

  const [userPage, setUserPage] = useState<number>(1);
  const [bookPage, setBookPage] = useState<number>(1);
  const [limit] = useState<number>(6);

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAuthors = async (): Promise<void> => {
      try {
        const response = await fetchAllUsers({ page: 1, limit: 100, search: '', filter: 'AUTHOR' });

        if (Array.isArray(response)) {
          setAuthors(response as Author[]);
        } else {
          toast.error("Unexpected author response format:", response);
        }
      } catch (error) {
        toast.error(`Error fetching authors: ${String(error)}`);
      }
    };
  
    fetchAuthors();
  }, []);
  

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [usersData, booksData, purchasesData, revenueData] = await Promise.all([
        fetchAllUsers({ page: userPage, limit, search: userSearch, filter: userFilter }),
        fetchAllBooks({ page: bookPage, limit, search: bookSearch, filter: bookFilter }),
        fetchAllPurchases(),
        fetchRevenueSummary(),
      ]);
      setUsers(usersData);
      setBooks(booksData.books.books as Book[]);
      setBookPagination({
        currentPage: booksData.books.currentPage,
        totalPages: booksData.books.totalPages,
        totalBooks: booksData.books.totalBooks,
      });
      setUserPagination({
        currentPage: userPage,
        totalPages: Math.ceil((usersData as User[]).length / limit),
        totalBooks: (usersData as User[]).length,
      });
      setPurchases(purchasesData);
      setRevenue(revenueData);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error loading admin data: ${message}`);
      toast.error("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }    
  }, [userPage, bookPage, userSearch, bookSearch, userFilter, bookFilter, limit]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  

  // Filtered data
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter || user.status === userFilter;
    return matchesSearch && matchesFilter;
  });
  const filteredBooks = books.filter((book: Book) => {
    const authorsText = Array.isArray(book.authors) 
      ? book.authors.map((author: Author | string) => 
          typeof author === 'string' ? author : author.name
        ).join(' ')
      : '';
    const matchesSearch = book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
                         authorsText.toLowerCase().includes(bookSearch.toLowerCase());
    const matchesFilter = bookFilter === 'all' || book.status === bookFilter;
    return matchesSearch && matchesFilter;
  });

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setUserForm({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      status: user.status 
    });
    setShowUserModal(true);
  };
  const handleUpdateUser = async (): Promise<void> => {
    if (!selectedUser) return;
  
    try {
      const updated = await updateUser(selectedUser._id || selectedUser.id, userForm);
      setUsers(users.map((user: User) => user.id === updated.id ? updated : user));
      fetchData();
    } catch (error) {
      console.error("Failed to update user", error);
    }
  
    setSelectedUser(null);
    setUserForm({ name: '', email: '', role: 'retail', status: 'active' });
    setShowUserModal(false);
  };

  const handleDeleteUser = (user: User): void => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleCreateBook = async (): Promise<void> => {
    try {
      const price = parseFloat(bookForm.price);
      if (isNaN(price) || price < 100 || price > 1000) {
        toast.error("Price must be a number between 100 and 1000.");
        return;
      }
  
      const authorsArray = Array.isArray(bookForm.authors)
        ? bookForm.authors
        : typeof bookForm.authors === 'string'
          ? bookForm.authors.split(',').map(a => a.trim())
          : [];
  
      const payload = {
        title: bookForm.title,
        authors: authorsArray,
        price,
        description: bookForm.description,
        status: bookForm.status
      };
  
       await createBook(payload);
  
      setBookForm({
        title: '',
        authors: [],
        price: '',
        description: '',
        status: 'pending'
      });
      setShowBookModal(false);
  
      fetchData(); // <-- Re-fetch data
    } catch (err) {
      console.error("Create book error:", err);
      toast.error("Failed to create book.");
    }
  };
  

  const handleEditBook = (book: Book): void => {
    setSelectedBook(book);
  
    const authorIds = Array.isArray(book.authors)
      ? book.authors.map((author: Author | string) =>
          typeof author === 'string' ? author : author._id
        )
      : [];
  
    setBookForm({
      title: book.title,
      authors: authorIds,
      price: book.price.toString(),
      description: book.description,
      status: book.status
    });
  
    setShowBookModal(true);
  };
  

  const handleUpdateBook = async (): Promise<void> => {
    if (!selectedBook) return;
  
    try {
      const price = parseFloat(bookForm.price);
      if (isNaN(price) || price < 100 || price > 1000) {
        toast.error("Price must be a number between 100 and 1000.");
        return;
      }
  
      const authorsArray = typeof bookForm.authors === 'string'
        ? bookForm.authors.split(',').map(a => a.trim())
        : bookForm.authors;
  
       await updateBook(selectedBook._id, {
        title: bookForm.title,
        authors: authorsArray,
        price,
        description: bookForm.description,
        status: bookForm.status
      });
  
      setSelectedBook(null);
      setBookForm({ title: '', authors: '', price: '', description: '', status: 'pending' });
      setShowBookModal(false);
  
      fetchData(); // <-- Re-fetch updated data
    } catch (err) {
      console.error("Update book error:", err);
      toast.error("Failed to update book.");
    }
  };

  const handleDeleteClick = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowDeleteModal(true);
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedBookId(null);
  };

  const confirmDeleteBook = async () => {
    if (!selectedBookId) return;
    try {
      await deleteBook(selectedBookId);
      setBooks(books.filter((b: Book) => b.bookId !== selectedBookId));
      setShowDeleteModal(false);
      setSelectedBookId(null);
    } catch (err) {
      console.error("Delete book error:", err);
    }
  };

  const handleSendBulkEmail = async (): Promise<void> => {
    setSendingBulkEmail(true);
    try {
      await sendCustomBulkEmail(emailForm);
      toast.success(`Email sent to ${emailForm.recipients} users successfully!`);
      setShowBulkEmailModal(false);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || "Failed to send bulk email.";
      toast.error(message);
    } finally {
      setEmailForm({ subject: '', message: '', recipients: 'all' });
      setSendingBulkEmail(false);
    }
  };
  
  

  const handleSendNewBookAnnouncement = async (): Promise<void> => {
    if (!selectedBookId) {
      toast.error("Please select a book before sending an announcement.");
      return;
    }
  
    setSendingBookAnnouncement(true);
    try {
      await sendNewBookAnnouncement(selectedBookId);
      toast.success("New book announcement sent to retail users!");
      setShowBookAnnouncementModal(false);
      setSelectedBookId("");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || "Failed to send announcement.";
      toast.error(message);
    } finally {
      setSendingBookAnnouncement(false);
    }
  };
  

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleUserPageChange = (page: number): void => {
    setUserPage(page);
  };

  const handleBookPageChange = (page: number): void => {
    setBookPage(page);
  };
  

  return (
    <>
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteBook}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}


    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white shadow-sm rounded-xl p-4">
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your book store platform</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowBulkEmailModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Send Bulk Email</span>
          </button>

          <button
            onClick={() => setShowBookAnnouncementModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-sm font-medium">Announce New Book</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Profile</span>
          </button>

          <LogoutButton />
        </div>

        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={users.length}
            icon={Users}
            color="text-blue-600"
            subtitle={`${users.filter((u: User) => u.status === 'active').length} active`}
          />
          <StatsCard
            title="Total Books"
            value={books.length}
            icon={BookOpen}
            color="text-green-600"
            subtitle={`${books.filter((b: Book) => b.status === 'approved').length} approved`}
          />
          <StatsCard
            title="Total Sales"
            value={revenue.totalSales}
            icon={TrendingUp}
            color="text-purple-600"
            subtitle="All time"
          />
          <StatsCard
            title="Platform Revenue"
            value={`₹${revenue.totalRevenue.toLocaleString()}`}
            icon={IndianRupee}
            color="text-orange-600"
            subtitle={`₹${revenue.monthlyRevenue.toLocaleString()} this month`}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Manage Users', icon: Users },
              { id: 'books', label: 'Manage Books', icon: BookOpen },
              { id: 'purchases', label: 'Purchase History', icon: TrendingUp },
              { id: 'revenue', label: 'Revenue Reports', icon: IndianRupee }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {activeTab === 'profile' && user && (
            <div>
              <ProfileCard
                name={user.name}
                email={user.email}
                role="ADMIN"
              />  
            </div>
          )}

            {/* Overview Tab */}
            {activeTab === 'overview' && !loading && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">📊 Recent Activity</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• {users.filter((u: User) => u.status === 'active').length} active users on platform</li>
                      <li>• {books.filter((b: Book) => b.status === 'pending').length} books pending approval</li>
                      <li>• ₹{revenue.monthlyRevenue.toLocaleString()} revenue this month</li>
                      <li>• {purchases.length} recent purchases</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">⚡ Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Manage Users
                      </button>
                      <button
                        onClick={() => setActiveTab('books')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Review Books
                      </button>
                      <button
                        onClick={() => setShowBulkEmailModal(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Send Bulk Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Management Tab */}
            {activeTab === 'users' && !loading && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="RETAIL">Retail Users</option>
                    <option value="AUTHOR">Authors</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                                  user.status === 'active'
                                    ? 'bg-green-500'
                                    : 'bg-gray-500'
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                   {/* User Pagination */}
                  <Pagination
                    currentPage={userPagination.currentPage}
                    totalPages={userPagination.totalPages}
                    onPageChange={handleUserPageChange}
                    totalItems={userPagination.totalBooks}
                    itemsPerPage={limit}
                  />
                </div>
              </div>
            )}
            {/* Books Management Tab */}
            {activeTab === 'books' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">Book Management</h2>
                  <button
                    onClick={() => {
                      setSelectedBook(null);
                      setBookForm({ title: '', authors: '', price: '', description: '', status: 'pending' });
                      setShowBookModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
                    <div key={book.bookId} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{book.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(book.status)}`}>
                          {book.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Authors:</span>
                          <span className="font-medium">{book.authors.map((author) => author.name).join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium">₹{book.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sales:</span>
                          <span className="font-medium">{book.totalSales}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(book.bookId)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
               {/* Books Pagination */}
                <Pagination
                  currentPage={bookPagination.currentPage}
                  totalPages={bookPagination.totalPages}
                  onPageChange={handleBookPageChange}
                  totalItems={bookPagination.totalBooks}
                  itemsPerPage={limit}
                />
            </div>
        )}


            {/* Purchase History Tab */}
            {activeTab === 'purchases' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Purchase History</h2>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedPurchases.map((purchase) => (
                            <tr key={purchase.purchaseId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {purchase.purchaseId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.book ? purchase.book.title : 'Unknown Book'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.user?.name || 'Unknown User'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(purchase.purchaseDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{purchase.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {totalPurchasePages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      <button
                        onClick={() => setPurchasePage((prev) => Math.max(prev - 1, 1))}
                        disabled={purchasePage === 1}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {[...Array(totalPurchasePages)].map((_, index) => (
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
                          setPurchasePage((prev) => Math.min(prev + 1, totalPurchasePages))
                        }
                        disabled={purchasePage === totalPurchasePages}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}


            {/* Revenue Reports Tab */}
            {activeTab === 'revenue' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Reports</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <IndianRupee className="w-6 h-6" />
                      <h3 className="font-semibold">Total Revenue</h3>
                    </div>
                    <p className="text-2xl font-bold">₹{revenue.totalRevenue.toLocaleString()}</p>
                    <p className="text-green-100 text-sm">All time platform earnings</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6" />
                      <h3 className="font-semibold">Monthly Revenue</h3>
                    </div>
                    <p className="text-2xl font-bold">₹{revenue.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm">This month's revenue</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-6 h-6" />
                      <h3 className="font-semibold">Total Sales</h3>
                    </div>
                    <p className="text-2xl font-bold">{revenue.totalSales}</p>
                    <p className="text-purple-100 text-sm">Books sold overall</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Author Contributions</h4>
                  <p className="text-gray-600 text-sm">Total registered authors: <span className="font-bold text-gray-800">{revenue.totalAuthors}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
        
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  if (userToDelete && userToDelete._id) {
                    try {
                      await deleteUser(userToDelete._id);
                      setUsers(users.filter((u) => u._id !== userToDelete._id)); 
                      toast.success("User deleted");
                    } catch (error) {
                      console.error("Delete user error:", error);
                      toast.error("Failed to delete user");
                    } finally {
                      setUserToDelete(null);
                      setShowDeleteModal(false);
                    }
                  } else {
                    toast.error("User ID is missing.");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>



      {/* Modals */}
      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => { setShowUserModal(false); setSelectedUser(null); }} title="Edit User">
        <div className="space-y-4">
          <input type="text" placeholder="Name" className="w-full border rounded p-2" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
          <input type="email" placeholder="Email" className="w-full border rounded p-2" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          <select className="w-full border rounded p-2" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
            <option value="RETAIL">Retail</option>
            <option value="AUTHOR">Author</option>
          </select>
          <select className="w-full border rounded p-2" value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleUpdateUser}
            disabled={!selectedUser}
          >
            Update
          </button>
        </div>
      </Modal>

      {/* Book Modal */}
      <Modal isOpen={showBookModal} onClose={() => { setShowBookModal(false); setSelectedBook(null); }} title={`${selectedBook ? 'Edit' : 'Add'} Book`}>
        <div className="space-y-4">
          <input type="text" placeholder="Title" className="w-full border rounded p-2" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
          <select
            multiple
            className="w-full border rounded p-2"
            value={bookForm.authors}
            onChange={(e) =>
              setBookForm({
                ...bookForm,
                authors: Array.from(e.target.selectedOptions, (option) => option.value)
              })
            }
          >
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name} ({author.email})
              </option>
            ))}
          </select>
          <input type="number" placeholder="Price" className="w-full border rounded p-2" value={bookForm.price} onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })} />
          <textarea placeholder="Description" className="w-full border rounded p-2" value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />
          <select className="w-full border rounded p-2" value={bookForm.status} onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={selectedBook ? handleUpdateBook : handleCreateBook}>
            {selectedBook ? 'Update' : 'Create'}
          </button>
        </div>
        </Modal>
        
        <Modal isOpen={showBookAnnouncementModal} onClose={() => setShowBookAnnouncementModal(false)} title="Announce New Book" size="lg">
          <div className="space-y-4">
            {/* 1. Book Selector */}
            <select
              className="w-full border rounded p-2"
              value={selectedBookId ?? ""} 
              onChange={(e) => setSelectedBookId(e.target.value)}
            >
              <option value="">-- Select a Book --</option>
              {books.map(book => (
                <option key={book.bookId} value={book.bookId}>{book.title}</option>
              ))}
            </select>

            {/* 2. Trigger Button */}
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
              onClick={handleSendNewBookAnnouncement}
              disabled={!selectedBookId || sendingBookAnnouncement}
            >
              {sendingBookAnnouncement ? (
                <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
              ) : (
                'Send Announcement (100 emails/minute)'
              )}
            </button>
          </div>
        </Modal>


      {/* Email Modal */}
      <Modal isOpen={showBulkEmailModal} onClose={() => setShowBulkEmailModal(false)} title="Send Bulk Email" size="lg">
        <div className="space-y-4">
          <input type="text" placeholder="Subject" className="w-full border rounded p-2" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} />
          <textarea placeholder="Message" className="w-full border rounded p-2 h-32" value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} />
          <select
            className="w-full border rounded p-2"
            value={emailForm.recipients}
            onChange={(e) =>
              setEmailForm({ ...emailForm, recipients: e.target.value as 'all' | 'active' | 'authors' })
            }
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="authors">Authors Only</option>
          </select>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
            onClick={handleSendBulkEmail}
            disabled={sendingBulkEmail}
          >
            {sendingBulkEmail ? (
              <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
            ) : (
              'Send Email'
            )}
          </button>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default AdminDashboard;
