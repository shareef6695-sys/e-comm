import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { Product } from '../catalog/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async checkStock(tenantId: string, items: { productId: string; variantId?: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const product = await this.productsRepository.findOne({
        where: { id: item.productId, tenantId },
      });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      if (product.isDigital || !product.trackInventory) {
        continue; // Skip stock check for digital or non-tracked items
      }

      if (item.variantId) {
        const variant = await this.variantsRepository.findOne({
          where: { id: item.variantId, tenantId },
        });
        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
        
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name} (Variant: ${variant.sku || variant.id})`);
        }
      } else {
        // If physical product and tracking inventory, we require a variant to track stock on
        // unless we decide to add stock to Product entity too. 
        // For this architecture, we assume strict Variant-based inventory.
        throw new BadRequestException(`Product ${product.name} requires a variant to be selected`);
      }
    }
  }

  async decrementStock(tenantId: string, items: { productId: string; variantId?: string; quantity: number }[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const product = await manager.findOne(Product, { where: { id: item.productId, tenantId } });
        
        if (product && !product.isDigital && product.trackInventory) {
          if (item.variantId) {
            const variant = await manager.findOne(ProductVariant, {
              where: { id: item.variantId, tenantId },
            });
            
            if (variant) {
              if (variant.stockQuantity < item.quantity) {
                  throw new BadRequestException(`Insufficient stock for ${product.name}`);
              }
              variant.stockQuantity -= item.quantity;
              await manager.save(variant);
            }
          }
        }
      }
    });
  }
}
