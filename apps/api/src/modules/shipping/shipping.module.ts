import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingRate } from './entities/shipping-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingZone, ShippingRate])],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
