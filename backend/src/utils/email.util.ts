import nodemailer from 'nodemailer';

export class EmailUtil {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Or use SMTP config if not Gmail
      auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // App-specific password or SMTP password
      },
    });
  }

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html: `<p>${message}</p>`,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }

  async sendBulkEmails(
    emails: string[],
    subject: string,
    message: string,
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      await Promise.all(
        batch.map((email) => this.sendEmail(email, subject, message))
      );

      if (i + batchSize < emails.length) {
        console.log(`Batch ${i / batchSize + 1} sent. Waiting 60 seconds...`);
        await this.sleep(60000); // 60 seconds delay to comply with email limits
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
