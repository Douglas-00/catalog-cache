import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { HealthController } from './health.controller';
import { PRODUCT_CACHE } from './product';
import { ProductStore } from './product-store';
import { RedisProductCache, createRedisStore } from './redis-product-cache';

@Module({
  controllers: [HealthController, CatalogController],
  providers: [
    ProductStore,
    CatalogService,
    {
      provide: PRODUCT_CACHE,
      useFactory: () => new RedisProductCache(createRedisStore(process.env.REDIS_URL ?? 'redis://localhost:6379')),
    },
  ],
})
export class AppModule {}
