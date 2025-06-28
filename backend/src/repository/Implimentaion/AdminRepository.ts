import User, { IUser } from "../../model/User";
import Purchase from "../../model/Purchase";
import { IAdminRepository } from "../Interface/IAdminRepository";
import BookModel, { IBook } from "../../model/Book";
import { Types } from "mongoose";

interface PopulatedAuthor {
  _id: string;
  name: string;
  email: string;
}

// Create a type that represents IBook with populated authors and totalSales
type BookWithPopulatedAuthors = Omit<IBook, 'authors'> & {
  authors: PopulatedAuthor[];
  totalSales: number;
}

export class AdminRepository implements IAdminRepository {
    async getAllUsers(page: number, limit: number, search: string, filter: string) {
        const query: any = {
            role: { $ne: 'ADMIN' } 
          };
      
        if (search) {
          query.$or = [
            { name: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') }
          ];
        }
      
        if (filter !== 'all') {
          if (['RETAIL', 'ADMIN', 'AUTHOR'].includes(filter)) {
            query.role = filter;
          } else if (['active', 'inactive'].includes(filter)) {
            query.status = filter;
          }
        }
      
        return await User.find(query)
        .select('name email role status createdAt') 
        .skip((page - 1) * limit)
        .limit(limit);
      }
      

  async getAllPurchases() {
    return await Purchase.find()
    .populate('book', 'title price') 
    .populate('user', 'name email');
  }

  async getRevenueSummary() {
    const purchases = await Purchase.find();
    const authors = await User.find({ role: 'author' });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let totalSales = 0;

    for (const purchase of purchases) {
      const purchaseDate = new Date(purchase.purchaseDate);
      const revenue = purchase.price * purchase.quantity;

      totalRevenue += revenue;
      totalSales += purchase.quantity;

      if (
        purchaseDate.getMonth() + 1 === currentMonth &&
        purchaseDate.getFullYear() === currentYear
      ) {
        monthlyRevenue += revenue;
      }
    }

    return {
      currentMonth,
      currentYear,
      totalRevenue,
      monthlyRevenue,
      totalSales,
      totalAuthors: authors.length,
    };
  }
  async getBooksWithPagination(
    page: number,
    limit: number,
    search: string,
    filter: string,
    userType: string
  ) {
    const query: any = {};
  
    // Search logic
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { authors: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }
  
    // Filter logic
    if (filter !== 'all') {
      query.status = filter;
    }
  
    const skip = (page - 1) * limit;
  
    // Fetch books with authors populated
    const books = await BookModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authors', 'name email')
      .lean();
  
    const total = await BookModel.countDocuments(query);
  
    // Get book sales
    const bookIds = books.map(book => book._id);
    const sales = await Purchase.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: {
          _id: '$book',
          totalSales: { $sum: '$quantity' }
        }
      }
    ]);
  
    const salesMap = new Map<string, number>();
    for (const sale of sales) {
      salesMap.set(sale._id.toString(), sale.totalSales);
    }
  
    // Combine sales data
    const booksWithSales = books.map((book) => {
      // Type assertion to handle the populated structure from lean query
      const populatedBook = book as any;
      
      return {
        ...populatedBook,
        totalSales: salesMap.get(populatedBook._id.toString()) || 0
      } as BookWithPopulatedAuthors;
    });
  
    return {
      books: booksWithSales,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    };
    }
  async update(id: string, data: Partial<IBook>): Promise<IBook | null> {
      return BookModel.findByIdAndUpdate(id, data, { new: true });
    }
  
    async delete(id: string): Promise<void> {
      await BookModel.findOneAndDelete({ bookId: id });
    }  

    async updateUser(id: string, data: Partial<IUser>) {
        const user = await User.findById(id);
        if (!user || user.role === 'ADMIN') throw new Error('Cannot modify this user');
        return await User.findByIdAndUpdate(id, data, { new: true });
      }
      
      async deleteUser(id: string) {
        const user = await User.findById(id);
        if (!user || user.role === 'ADMIN') throw new Error('Cannot delete ADMIN user');
        await User.findByIdAndDelete(id);
      }
      
}