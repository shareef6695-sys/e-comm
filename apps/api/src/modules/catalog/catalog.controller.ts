import { Controller, Get, Post, Body, Request, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('products')
  createProduct(@Request() req, @Body() data: any) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.catalogService.createProduct(req.tenant.id, data);
  }

  @Get('products')
  findAllProducts(@Request() req) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.catalogService.findAllProducts(req.tenant.id);
  }

  @Get('products/:id')
  findProduct(@Request() req, @Param('id') id: string) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.catalogService.findProductOne(req.tenant.id, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('categories')
  createCategory(@Request() req, @Body() data: any) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.catalogService.createCategory(req.tenant.id, data);
  }

  @Get('categories')
  findAllCategories(@Request() req) {
    if (!req.tenant) throw new BadRequestException('Tenant required');
    return this.catalogService.findAllCategories(req.tenant.id);
  }
}
