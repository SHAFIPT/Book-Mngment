export interface INotificationService {
    notifyAuthorOnPurchase(data: {
      bookId: string;
      userId: string;
      price: number;
      quantity: number;
    }): Promise<void>;
  
    sendMonthlyRevenueSummary(): Promise<void>;
  
    sendNewBookAnnouncement(bookId: string): Promise<void>;
  
    sendCustomBulkEmail(subject: string, message: string, recipients: string): Promise<void>;
  }
  