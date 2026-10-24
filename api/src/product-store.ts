import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product';

@Injectable()
export class ProductStore {
  private readonly products = new Map<string, Product>([
    ['caderno', { id: 'caderno', name: 'Caderno', priceCents: 2500 }],
    ['caneta', { id: 'caneta', name: 'Caneta', priceCents: 800 }],
    ['mochila', { id: 'mochila', name: 'Mochila', priceCents: 14900 }],
  ]);

  list(): Product[] {
    return [...this.products.values()].map((product) => ({ ...product }));
  }

  findById(id: string): Product | undefined {
    const product = this.products.get(id);
    return product ? { ...product } : undefined;
  }

  update(id: string, patch: Partial<Pick<Product, 'name' | 'priceCents'>>): Product {
    const current = this.products.get(id);
    if (!current) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    const next: Product = {
      ...current,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.priceCents !== undefined ? { priceCents: patch.priceCents } : {}),
    };
    this.products.set(id, next);
    return { ...next };
  }
}
