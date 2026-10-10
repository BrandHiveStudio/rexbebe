import { logger } from '../utils/logger';

export class NotificationService {
  async sendOrderConfirmationEmail(email: string, orderNumber: string, total: number) {
    logger.info(`[Email Dispatch] Sent order confirmation to ${email} for order #${orderNumber} (LKR ${total.toLocaleString()})`);
  }

  async sendSMSNotification(phone: string, message: string) {
    logger.info(`[SMS Dispatch] Sent SMS to ${phone}: ${message}`);
  }
}
