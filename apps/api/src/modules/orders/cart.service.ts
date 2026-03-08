import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findOrCreateCart(tenantId: string, userId?: string, sessionId?: string): Promise<Cart> {
    const where: any = { tenantId };
    if (userId) where.userId = userId;
    else if (sessionId) where.sessionId = sessionId;
    else throw new Error('UserId or SessionId required');

    let cart = await this.cartRepository.findOne({
      where,
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        tenantId,
        userId,
        sessionId,
      });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addToCart(tenantId: string, userId: string | undefined, sessionId: string | undefined, productId: string, quantity: number, variantId?: string): Promise<Cart> {
    const cart = await this.findOrCreateCart(tenantId, userId, sessionId);
    
    // Check if item already exists
    let item: CartItem | undefined;
    if (cart.items) {
      item = cart.items.find(i => i.productId === productId && i.variantId === variantId);
    }

    if (item) {
      item.quantity += quantity;
      await this.cartItemRepository.save(item);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    // Refresh cart
    return this.findOrCreateCart(tenantId, userId, sessionId);
  }

  async removeFromCart(tenantId: string, userId: string | undefined, sessionId: string | undefined, itemId: string): Promise<Cart> {
    await this.cartItemRepository.delete(itemId);
    return this.findOrCreateCart(tenantId, userId, sessionId);
  }
}
