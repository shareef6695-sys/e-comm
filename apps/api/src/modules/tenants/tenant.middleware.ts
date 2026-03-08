import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';

declare global {
  namespace Express {
    interface Request {
      tenant?: any;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Check for x-tenant-id header (Internal/Admin use)
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (tenantId) {
      const tenant = await this.tenantsService.findOne(tenantId);
      if (tenant) {
        req.tenant = tenant;
        return next();
      }
    }

    // 2. Check Host header (Subdomain resolution)
    const host = req.headers.host; // e.g., tenant1.localhost:3000
    if (host) {
      const parts = host.split('.');
      // Simple logic: if localhost, assume first part is slug. 
      // In production, this needs robust domain parsing logic.
      if (parts.length > 0) {
        const slug = parts[0];
        try {
           // Skip if it is 'www' or 'api' or raw ip
           if (slug !== 'www' && slug !== 'api' && slug !== 'localhost') {
             const tenant = await this.tenantsService.findBySlug(slug);
             req.tenant = tenant;
           }
        } catch (e) {
          // Ignore if not found, request might be for public endpoint or admin
        }
      }
    }

    // Note: We don't throw error here if tenant is missing, 
    // because some endpoints (like login, registration) might not be tenant-scoped yet.
    // Guards will enforce tenant presence where needed.
    
    next();
  }
}
