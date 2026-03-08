import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingRate, RateType } from './entities/shipping-rate.entity';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingZone)
    private zoneRepository: Repository<ShippingZone>,
    @InjectRepository(ShippingRate)
    private rateRepository: Repository<ShippingRate>,
  ) {}

  async calculateShipping(tenantId: string, countryCode: string, totalWeight: number, totalPrice: number): Promise<any[]> {
    // 1. Find matching zone for country
    // Using simple query for now. In production, might need more complex matching.
    // We fetch all zones and filter in memory because 'countries' is an array column
    const zones = await this.zoneRepository.find({
      where: { tenantId },
      relations: ['rates'],
    });

    const matchedZone = zones.find(z => z.countries.includes(countryCode) || z.countries.includes('*')); // * for Rest of World

    if (!matchedZone) {
      return []; // No shipping available
    }

    // 2. Filter applicable rates within the zone
    const applicableRates = matchedZone.rates.filter(rate => {
      if (rate.type === RateType.WEIGHT_BASED) {
        const min = Number(rate.min_weight || 0);
        const max = Number(rate.max_weight || Infinity);
        return totalWeight >= min && totalWeight <= max;
      }
      if (rate.type === RateType.PRICE_BASED) {
        const min = Number(rate.min_price || 0);
        const max = Number(rate.max_price || Infinity);
        return totalPrice >= min && totalPrice <= max;
      }
      return true; // Flat rate always applies if in zone
    });

    return applicableRates.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      currency: 'SAR', // Default
    }));
  }
}
