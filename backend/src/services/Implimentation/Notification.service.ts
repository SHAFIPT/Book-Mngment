import { INotificationRepository } from "../../repository/Interface/INotificationRepository";
import { EmailUtil } from "../../utils/email.util";
import { INotificationService } from "../Interface/INotification.service";


export class NotificationService implements INotificationService {
  constructor(private repo: INotificationRepository, private emailUtil: EmailUtil) {}

  async notifyAuthorOnPurchase(data: { bookId: string, userId: string, price: number, quantity: number }) {
    const authorEmails = await this.repo.getAuthorEmailsForBook(data.bookId);
    const user = await this.repo.getUserById(data.userId);
    const book = await this.repo.getBookById(data.bookId);

    const message = `Your book "${book.title}" was purchased by ${user.name}. Quantity: ${data.quantity}, Revenue: ₹${data.price * data.quantity}.`;

    await this.emailUtil.sendBulkEmails(authorEmails, 'Book Purchase Notification', message);
  }

  async sendMonthlyRevenueSummary() {
    const summaries = await this.repo.getMonthlyRevenueData();
    for (const { email, name, totalRevenue, currentMonth, currentYear } of summaries) {
      const message = `Hello ${name}, your total revenue for ${currentMonth}/${currentYear} is ₹${totalRevenue}.`;
      await this.emailUtil.sendEmail(email, 'Monthly Revenue Summary', message);
    }
  }

  async sendNewBookAnnouncement(bookId: string) {
    const book = await this.repo.getBookById(bookId);
    const emails = await this.repo.getRetailUserEmails();

    const message = `📘 New Book Released: "${book.title}". Check it out now!`;

    // Send in batches of 100
    await this.emailUtil.sendBulkEmails(emails, 'New Book Released!', message, 100);
  }
  
  async sendCustomBulkEmail(subject: string, message: string, recipients: string) {
    let emails: string[] = [];
    if (recipients === 'all') emails = await this.repo.getAllUserEmails();
    else if (recipients === 'authors') emails = await this.repo.getAuthorEmails();
    else if (recipients === 'active') emails = await this.repo.getActiveUserEmails();

    await this.emailUtil.sendBulkEmails(emails, subject, message, 100);
  }
}
