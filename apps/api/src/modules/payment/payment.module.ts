import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction, PaymentMethod]),
    OrdersModule,
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
