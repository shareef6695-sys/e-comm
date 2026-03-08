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
  async createProduct(tenantId: string, data: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create({ ...data, tenantId });
    return this.productsRepository.save(product);
  }

  async findAllProducts(tenantId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { tenantId },
      relations: ['variants'],
    });
  }

  async findProductOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, tenantId },
      relations: ['variants'],
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
