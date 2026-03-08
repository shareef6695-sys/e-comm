import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  // Products
  async createProduct(tenantId: string, data: any): Promise<Product> {
    const { stockQuantity, ...productData } = data;
    
    // Prepare product object
    const product = this.productsRepository.create({ 
      ...productData, 
      tenantId 
    }) as unknown as Product;
    
    // Auto-generate slug if not provided
    if (!product.slug && product.name) {
      product.slug = product.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
    }

    // If stockQuantity provided, create a default variant
    if (stockQuantity !== undefined) {
      product.variants = [{
        tenantId,
        sku: `SKU-${Date.now()}`,
        price: productData.basePrice,
        stockQuantity: Number(stockQuantity),
        // variants requires product reference, but cascade should handle it? 
        // Or we let TypeORM handle the relation setting if we save the parent.
      } as any]; 
    }

    return this.productsRepository.save(product);
  }

  async updateProduct(tenantId: string, id: string, data: any): Promise<Product> {
    const { stockQuantity, ...productData } = data;
    const product = await this.findProductOne(tenantId, id);
    
    // Update main product fields
    Object.assign(product, productData);
    
    // Update stock if provided
    if (stockQuantity !== undefined && product.variants && product.variants.length > 0) {
      // Update first variant's stock
      // We need to save the variant.
      // Since we don't have variant repo injected, we can try to update via product.variants
      // But we need to make sure we save it.
      // Let's assume cascade update works if we modify the variant object.
      product.variants[0].stockQuantity = Number(stockQuantity);
    } else if (stockQuantity !== undefined && (!product.variants || product.variants.length === 0)) {
       // Create default variant if missing
       product.variants = [{
         tenantId,
         sku: `SKU-${Date.now()}`,
         price: product.basePrice,
         stockQuantity: Number(stockQuantity),
         product: product
       } as any];
    }

    return this.productsRepository.save(product);
  }

  async deleteProduct(tenantId: string, id: string): Promise<void> {
    const product = await this.findProductOne(tenantId, id);
    await this.productsRepository.remove(product);
  }

  async findAllProducts(tenantId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { tenantId },
      relations: ['variants', 'category'],
    });
  }

  async findProductOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, tenantId },
      relations: ['variants', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Categories
  async createCategory(tenantId: string, data: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create({ ...data, tenantId });
    return this.categoriesRepository.save(category);
  }

  async findAllCategories(tenantId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { tenantId },
      relations: ['children'],
    });
  }
}
