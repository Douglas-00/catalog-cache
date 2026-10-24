import { Body, Controller, Get, Param, Patch, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CatalogService } from './catalog.service';
import { UpdateProductDto } from './update-product.dto';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list() {
    return this.catalogService.list();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
    const result = await this.catalogService.findById(id);
    response.setHeader('x-cache', result.cache);
    return result.product;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.update(id, dto);
  }
}
