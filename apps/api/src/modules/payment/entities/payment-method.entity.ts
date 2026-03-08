import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  LOCAL = 'local', // Cash on Delivery, Bank Transfer
  LC = 'lc', // Letter of Credit
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  // Stores encrypted credentials (api keys, secrets)
  @Column({ type: 'jsonb', nullable: true, select: false }) 
  config: any; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
