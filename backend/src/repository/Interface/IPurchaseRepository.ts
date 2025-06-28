import { IPurchase } from '../../model/Purchase';

export interface IPurchaseRepository {
  create(data: Partial<IPurchase>): Promise<IPurchase>;
  findByUser(userId: string): Promise<IPurchase[]>;
  countThisMonthPurchases(): Promise<number>;
  findByAuthor(authorId: string): Promise<IPurchase[]>;
}