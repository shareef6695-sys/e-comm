import { Controller, Get, Post, Body, Request, Param, UseGuards, BadRequestException, Query, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createOrder(@Request() req, @Body() data: any) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.ordersService.createOrder(req.tenant.id, req.user.id, data.items, data.shippingAddress);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.ordersService.findAll(req.tenant.id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.ordersService.findOne(req.tenant.id, id);
  }
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req, @Query('sessionId') sessionId: string) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    const userId = req.user?.id; // Optional: could be extracted if auth guard was used or custom middleware
    // For now assuming public cart endpoint or handled via custom logic
    if (!userId && !sessionId) throw new BadRequestException('UserId or SessionId required');
    
    return this.cartService.findOrCreateCart(req.tenant.id, userId, sessionId);
  }

  @Post('items')
  addToCart(@Request() req, @Body() data: any) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    const { sessionId, productId, quantity, variantId } = data;
    const userId = req.user?.id;
    
    return this.cartService.addToCart(req.tenant.id, userId, sessionId, productId, quantity, variantId);
  }

  @Delete('items/:id')
  removeFromCart(@Request() req, @Param('id') itemId: string, @Query('sessionId') sessionId: string) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    const userId = req.user?.id;
    
    return this.cartService.removeFromCart(req.tenant.id, userId, sessionId, itemId);
  }
}
