import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, body: string, tenantId: string) {
    // Integration with SendGrid/AWS SES/SMTP would go here
    this.logger.log(`[Tenant: ${tenantId}] Sending Email to ${to}: ${subject}`);
    // mock delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  async sendSMS(to: string, message: string, tenantId: string) {
    // Integration with Twilio/Local SMS Gateway
    this.logger.log(`[Tenant: ${tenantId}] Sending SMS to ${to}: ${message}`);
    return true;
  }

  async sendOrderConfirmation(order: any) {
      await this.sendEmail(
          'customer@example.com', // mock
          `Order Confirmation #${order.id}`,
          `Thank you for your order. Total: ${order.total}`,
          order.tenantId
      );
  }
}
