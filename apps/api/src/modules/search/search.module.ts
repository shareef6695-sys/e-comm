import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Global() // Make it global so CatalogModule can easily use it without importing SearchModule everywhere
@Module({
  imports: [ConfigModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
