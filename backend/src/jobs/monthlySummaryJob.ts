import cron from 'node-cron';
import { notificationService } from '../config/container';

cron.schedule('0 0 1 * *', async () => {
  await notificationService.sendMonthlyRevenueSummary();
});