import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_CACHE, PRODUCT_CACHE_TTL_SECONDS, Product, ProductCache } from './product';
import { ProductStore } from './product-store';

export interface CatalogLookup {
  product: Product;
  cache: 'HIT' | 'MISS';
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly store: ProductStore,
    @Inject(PRODUCT_CACHE) private readonly cache: ProductCache,
  ) {}

  list(): Product[] {
    return this.store.list();
  }

  async findById(id: string): Promise<CatalogLookup> {
    const cached = await this.cache.get(id);
    if (cached) return { product: cached, cache: 'HIT' };

    const product = this.store.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    await this.cache.set(id, product, PRODUCT_CACHE_TTL_SECONDS);
    return { product, cache: 'MISS' };
  }

  async update(id: string, patch: Partial<Pick<Product, 'name' | 'priceCents'>>): Promise<Product> {
    const product = this.store.update(id, patch);
    await this.cache.invalidate(id);
    return product;
  }
}
