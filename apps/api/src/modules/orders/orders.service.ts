import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CatalogService } from '../catalog/catalog.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private catalogService: CatalogService,
    private inventoryService: InventoryService,
  ) {}

  async createOrder(tenantId: string, userId: string, items: any[], shippingAddress: any): Promise<Order> {
    // 1. Validate Stock
    await this.inventoryService.checkStock(tenantId, items);

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.catalogService.findProductOne(tenantId, item.productId);
      
      let price = product.basePrice;
      // If variant logic is needed, fetch variant price here
      // const variant = ...

      const orderItem = new OrderItem();
      orderItem.productId = item.productId;
      orderItem.variantId = item.variantId;
      orderItem.quantity = item.quantity;
      orderItem.price = price;
      
      orderItems.push(orderItem);
      total += Number(price) * item.quantity;
    }

    // 2. Reserve/Decrement Stock
    await this.inventoryService.decrementStock(tenantId, items);

    const order = this.ordersRepository.create({
      tenantId,
      userId,
      total,
      status: OrderStatus.PENDING,
      shipping_address: shippingAddress,
      items: orderItems,
    });

    return this.ordersRepository.save(order);
  }

  async findAll(tenantId: string, userId?: string): Promise<Order[]> {
    const where: any = { tenantId };
    if (userId) where.userId = userId;
    
    return this.ordersRepository.find({
      where,
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
