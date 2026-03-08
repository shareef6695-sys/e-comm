import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { Product } from '../catalog/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, Product])],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
