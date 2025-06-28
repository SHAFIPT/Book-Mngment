import BookModel from '../../model/Book';
import Purchase, { IPurchase } from '../../model/Purchase';
import { IPurchaseRepository } from '../Interface/IPurchaseRepository';

export class PurchaseRepository implements IPurchaseRepository {
  async create(data: Partial<IPurchase>): Promise<IPurchase> {
    return new Purchase(data).save();
  }

  async findByUser(userId: string): Promise<IPurchase[]> {
    return Purchase.find({ user: userId }).populate({
        path: 'book',
        populate: { path: 'authors' }, 
      });
  }

  async countThisMonthPurchases(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return Purchase.countDocuments({ purchaseDate: { $gte: startOfMonth } });
  }
  
  async findByAuthor(authorId: string): Promise<IPurchase[]> {
    const books = await BookModel.find({ authors: authorId }).select('_id');
    const bookIds = books.map(book => book._id);
    return Purchase.find({ book: { $in: bookIds } });
  }
}
