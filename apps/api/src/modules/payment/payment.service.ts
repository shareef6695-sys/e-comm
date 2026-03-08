import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction, PaymentStatus } from './entities/payment-transaction.entity';
import { PaymentMethod, PaymentProvider } from './entities/payment-method.entity';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private transactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(PaymentMethod)
    private methodRepository: Repository<PaymentMethod>,
    private ordersService: OrdersService,
  ) {}

  async processPayment(tenantId: string, orderId: string, provider: string, paymentData: any): Promise<PaymentTransaction> {
    const order = await this.ordersService.findOne(tenantId, orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Order is not in pending state');
    }

    // 1. Verify provider is enabled for tenant
    const method = await this.methodRepository.findOne({ where: { tenantId, provider: provider as PaymentProvider, isEnabled: true } });
    if (!method && provider !== 'local') { // Local payment might not need explicit config, or we enforce it
        throw new BadRequestException(`Payment provider ${provider} is not enabled`);
    }

    // 2. Create Transaction Record (Pending)
    const transaction = this.transactionRepository.create({
      tenantId,
      orderId,
      amount: order.total,
      currency: 'SAR', // Default for now
      provider,
      status: PaymentStatus.PENDING,
    });
    await this.transactionRepository.save(transaction);

    // 3. Process Payment (Mock Logic for now)
    try {
      if (provider === 'local') {
         // Cash on Delivery - Immediate success/pending based on policy
         // Usually COD is "Pending Payment" but order is "Confirmed"
         transaction.status = PaymentStatus.PENDING; 
         // In real world, this might be 'Authorized'
      } else if (provider === 'lc') {
         // Letter of Credit - Requires Backend Verification
         transaction.status = PaymentStatus.AWAITING_VERIFICATION;
         transaction.metadata = paymentData; // Store LC details (number, bank, etc.)
      } else if (provider === 'stripe') {
         // Call Stripe API
         // transaction.transactionId = stripePaymentIntent.id;
         // transaction.status = ...
         // For scaffolding, we simulate success
         transaction.status = PaymentStatus.COMPLETED;
         transaction.transactionId = `mock_stripe_${Date.now()}`;
      }
      
      await this.transactionRepository.save(transaction);

      // 4. Update Order Status
      if (transaction.status === PaymentStatus.COMPLETED) {
          // If paid, move order to Processing or Paid
          // We need to update Order entity to have 'payment_status' or just use status
          // For now, let's assume 'PROCESSING' implies paid/confirmed
          // order.status = OrderStatus.PROCESSING; 
          // await this.ordersService.updateStatus(tenantId, orderId, OrderStatus.PROCESSING);
      }

      return transaction;

    } catch (error) {
      transaction.status = PaymentStatus.FAILED;
      transaction.metadata = { error: error.message };
      await this.transactionRepository.save(transaction);
      throw error;
    }
  }

  async verifyTransaction(tenantId: string, transactionId: string, isApproved: boolean, note?: string): Promise<PaymentTransaction> {
      const transaction = await this.transactionRepository.findOne({ where: { id: transactionId, tenantId } });
      if (!transaction) throw new NotFoundException('Transaction not found');

      if (transaction.status !== PaymentStatus.AWAITING_VERIFICATION && transaction.status !== PaymentStatus.PENDING) {
          throw new BadRequestException('Transaction is not pending verification');
      }

      if (isApproved) {
          transaction.status = PaymentStatus.COMPLETED;
          transaction.metadata = { ...transaction.metadata, verification_note: note, verified_at: new Date() };
      } else {
          transaction.status = PaymentStatus.FAILED;
          transaction.metadata = { ...transaction.metadata, verification_note: note, rejected_at: new Date() };
      }

      await this.transactionRepository.save(transaction);
      return transaction;
  }

  async getMethods(tenantId: string) {
      return this.methodRepository.find({ where: { tenantId, isEnabled: true } });
  }
}
