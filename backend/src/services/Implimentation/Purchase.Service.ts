import mongoose from 'mongoose';
import Book, { IBook } from '../../model/Book';
import { IPurchaseRepository } from '../../repository/Interface/IPurchaseRepository';
import { IPurchaseService } from '../Interface/IPurchase.Service';
import { INotificationService } from '../Interface/INotification.service';

export class PurchaseService implements IPurchaseService {
  constructor(
    private purchaseRepo: IPurchaseRepository,
    private notificationService: INotificationService
  ) { }

  async createPurchase(bookId: string, userId: string, quantity: number) {
    const book = await Book.findOne({ bookId }) as IBook | null;
    if (!book) throw new Error('Book not found');

    const price = book.price;
    const count = await this.purchaseRepo.countThisMonthPurchases();
    const now = new Date();
    const purchaseId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${count + 1}`;

    const purchase = await this.purchaseRepo.create({
      purchaseId,
      book: book._id as mongoose.Types.ObjectId,
      user: new mongoose.Types.ObjectId(userId),
      price,
      quantity,
      purchaseDate: now
    });

    await this.notificationService.notifyAuthorOnPurchase({
      bookId,
      userId,
      price,
      quantity
    });

    return purchase;
  }

  async getUserPurchases(userId: string) {
    return this.purchaseRepo.findByUser(userId);
  }
  
  async getAuthorRevenueSummary(authorId: string) {
    const purchases = await this.purchaseRepo.findByAuthor(authorId);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalRevenue = 0;
    let currentMonthRevenue = 0;
    let currentYearRevenue = 0;
    let totalSales = 0;
    const monthlyMap: Record<string, number> = {};

    for (const purchase of purchases) {
      const date = new Date(purchase.purchaseDate);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const revenue = purchase.price * purchase.quantity;

      totalRevenue += revenue;
      totalSales += purchase.quantity;

      if (year === currentYear) {
        currentYearRevenue += revenue;

        if (monthIndex === currentMonth) {
          currentMonthRevenue += revenue;
        }

        const monthName = date.toLocaleString('default', { month: 'short' });
        monthlyMap[monthName] = (monthlyMap[monthName] || 0) + revenue;
      }
    }

    const monthlyData = Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return {
      currentMonth: currentMonthRevenue,
      currentYear: currentYearRevenue,
      totalRevenue,
      totalSales,
      monthlyData,
    };
  }
}