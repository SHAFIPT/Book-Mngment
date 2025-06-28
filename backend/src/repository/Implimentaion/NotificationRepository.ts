import { Types } from "mongoose";
import BookModel from "../../model/Book";
import Purchase from "../../model/Purchase";
import User from "../../model/User";
import { INotificationRepository } from "../Interface/INotificationRepository";

interface AuthorType {
    _id: Types.ObjectId;
    email: string;
    name: string;
  }
  
  interface BookType {
    _id: Types.ObjectId;
    title: string;
    authors: AuthorType[];
  }
  
  interface PurchasePopulated {
    book: BookType;
    user: {
      _id: Types.ObjectId;
      name: string;
      email: string;
    };
    purchaseDate: Date;
    price: number;
    quantity: number;
  }
  


export class NotificationRepository implements INotificationRepository {
  async getAuthorEmailsForBook(bookId: string) {
    const book = await BookModel.findOne({ bookId }).populate('authors', 'email');
    return (book?.authors || []).map((a: any) => a.email);
  }

  async getUserById(userId: string) {
    const user = await User.findOne({ userId });
    return { name: user?.name || '', email: user?.email || '' };
  }

  async getBookById(bookId: string) {
    const book = await BookModel.findOne({ bookId });
    return { title: book?.title || '' };
  }

  async getRetailUserEmails() {
    const users = await User.find({ role: 'RETAIL' });
    return users.map(u => u.email);
  }

  async getAllUserEmails() {
    const users = await User.find();
    return users.map(u => u.email);
  }

  async getAuthorEmails() {
    const users = await User.find({ role: 'AUTHOR' });
    return users.map(u => u.email);
  }

  async getActiveUserEmails() {
    const users = await User.find({ status: 'active' });
    return users.map(u => u.email);
  }

    
  async getMonthlyRevenueData() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
  
    const purchases = await Purchase.find()
      .populate({
        path: 'book',
        populate: {
          path: 'authors',
          select: 'email name',
        },
      })
      .populate('user') as unknown as PurchasePopulated[];
  
    const authorMap: Record<string, { email: string; name: string; totalRevenue: number }> = {};
  
    for (const p of purchases) {
      const d = new Date(p.purchaseDate);
      if (d.getMonth() + 1 === month && d.getFullYear() === year && p.book?.authors) {
        for (const author of p.book.authors) {
          if (!authorMap[author._id.toString()]) {
            authorMap[author._id.toString()] = {
              email: author.email,
              name: author.name,
              totalRevenue: 0,
            };
          }
          authorMap[author._id.toString()].totalRevenue += p.price * p.quantity;
        }
      }
    }
  
    return Object.values(authorMap).map((a) => ({
      ...a,
      currentMonth: month,
      currentYear: year,
    }));
  }
}
