import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { PRODUCT_CACHE } from './product';
import { ProductStore } from './product-store';

class MemoryCache {
  private readonly values = new Map<string, unknown>();

  async get(id: string) {
    return this.values.get(id) ?? null;
  }

  async set(id: string, product: unknown) {
    this.values.set(id, product);
  }

  async invalidate(id: string) {
    this.values.delete(id);
  }
}

describe('Catalog HTTP', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [CatalogService, ProductStore, { provide: PRODUCT_CACHE, useClass: MemoryCache }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sets X-Cache to MISS and then HIT', async () => {
    const first = await request(app.getHttpServer()).get('/products/caderno');
    const second = await request(app.getHttpServer()).get('/products/caderno');
    expect(first.headers['x-cache']).toBe('MISS');
    expect(second.headers['x-cache']).toBe('HIT');
    expect(second.body).toEqual({ id: 'caderno', name: 'Caderno', priceCents: 2500 });
  });

  it('rejects a negative price', async () => {
    const response = await request(app.getHttpServer()).patch('/products/caderno').send({ priceCents: -1 });
    expect(response.status).toBe(400);
  });
});
