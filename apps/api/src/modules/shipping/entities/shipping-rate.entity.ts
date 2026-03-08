import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ShippingZone } from './shipping-zone.entity';

export enum RateType {
  FLAT = 'flat',
  WEIGHT_BASED = 'weight_based',
  PRICE_BASED = 'price_based',
}

@Entity('shipping_rates')
export class ShippingRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipping_zone_id', type: 'uuid' })
  shippingZoneId: string;

  @ManyToOne(() => ShippingZone, (zone) => zone.rates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipping_zone_id' })
  zone: ShippingZone;

  @Column()
  name: string; // e.g. "Standard Shipping", "Express"

  @Column({ type: 'enum', enum: RateType, default: RateType.FLAT })
  type: RateType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; // Base cost

  // Conditions
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  max_weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  max_price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
