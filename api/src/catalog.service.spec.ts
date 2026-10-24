import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Product, ProductCache } from './product';
import { ProductStore } from './product-store';
import { RedisProductCache } from './redis-product-cache';

class MemoryCache implements ProductCache {
  private readonly values = new Map<string, Product>();

  async get(id: string): Promise<Product | null> {
    return this.values.get(id) ?? null;
  }

  async set(id: string, product: Product): Promise<void> {
    this.values.set(id, product);
  }

  async invalidate(id: string): Promise<void> {
    this.values.delete(id);
  }
}

describe('CatalogService', () => {
  it('reads through on miss and serves the following read from cache', async () => {
    const service = new CatalogService(new ProductStore(), new MemoryCache());
    const first = await service.findById('caderno');
    const second = await service.findById('caderno');

    expect(first.cache).toBe('MISS');
    expect(second.cache).toBe('HIT');
    expect(second.product.name).toBe('Caderno');
  });

  it('drops the cache entry when the product changes', async () => {
    const service = new CatalogService(new ProductStore(), new MemoryCache());
    await service.findById('caneta');
    await service.update('caneta', { priceCents: 900 });
    const again = await service.findById('caneta');

    expect(again.cache).toBe('MISS');
    expect(again.product.priceCents).toBe(900);
  });

  it('rejects an unknown product', async () => {
    const service = new CatalogService(new ProductStore(), new MemoryCache());
    await expect(service.findById('inexistente')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('RedisProductCache', () => {
  it('stores json under a namespaced key and removes it on invalidate', async () => {
    const saved = new Map<string, { value: string; ttl: number }>();
    const cache = new RedisProductCache({
      async get(key) {
        return saved.get(key)?.value ?? null;
      },
      async set(key, value, ttlSeconds) {
        saved.set(key, { value, ttl: ttlSeconds });
      },
      async del(key) {
        saved.delete(key);
      },
    });

    await cache.set('caderno', { id: 'caderno', name: 'Caderno', priceCents: 2500 }, 30);
    await expect(cache.get('caderno')).resolves.toEqual({ id: 'caderno', name: 'Caderno', priceCents: 2500 });
    expect(saved.get('catalog:product:caderno')?.ttl).toBe(30);

    await cache.invalidate('caderno');
    await expect(cache.get('caderno')).resolves.toBeNull();
  });
});
