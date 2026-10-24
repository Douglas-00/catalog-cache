import Redis from 'ioredis';
import { KeyValueStore, Product, ProductCache, cacheKey } from './product';

export class RedisProductCache implements ProductCache {
  constructor(private readonly store: KeyValueStore) {}

  async get(id: string): Promise<Product | null> {
    const raw = await this.store.get(cacheKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Product;
  }

  async set(id: string, product: Product, ttlSeconds: number): Promise<void> {
    await this.store.set(cacheKey(id), JSON.stringify(product), ttlSeconds);
  }

  async invalidate(id: string): Promise<void> {
    await this.store.del(cacheKey(id));
  }
}

export function createRedisStore(url: string): KeyValueStore {
  const client = new Redis(url, { maxRetriesPerRequest: 2 });
  return {
    get: (key) => client.get(key),
    set: async (key, value, ttlSeconds) => {
      await client.set(key, value, 'EX', ttlSeconds);
    },
    del: async (key) => {
      await client.del(key);
    },
  };
}
