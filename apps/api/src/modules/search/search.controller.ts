import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { Request } from 'express';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Optional: Public or Protected

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(@Req() req: Request, @Query() query: any) {
    const tenantId = req.headers['x-tenant-id'] as string;
    // or from subdomains
    if (!tenantId) {
        // throw new BadRequestException('Tenant ID required');
    }
    
    const { q, page, limit, ...filters } = query;
    return this.searchService.searchProducts(tenantId, q, filters, Number(page) || 1, Number(limit) || 20);
  }

  @Get('suppliers')
  async searchSuppliers(@Query() query: any) {
    // This might be a platform-level search (no tenantId required, or cross-tenant)
    const { q, page, limit, ...filters } = query;
    return this.searchService.searchSuppliers(q, filters, Number(page) || 1, Number(limit) || 20);
  }
}
