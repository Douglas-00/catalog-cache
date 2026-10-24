export interface Product {
  id: string;
  name: string;
  priceCents: number;
}

export interface ProductCache {
  get(id: string): Promise<Product | null>;
  set(id: string, product: Product, ttlSeconds: number): Promise<void>;
  invalidate(id: string): Promise<void>;
}

export const PRODUCT_CACHE = Symbol('PRODUCT_CACHE');
export const PRODUCT_CACHE_TTL_SECONDS = 30;

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

export function cacheKey(id: string): string {
  return `catalog:product:${id}`;
}
