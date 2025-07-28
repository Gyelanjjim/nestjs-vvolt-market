import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import { S3MultipleInterceptor, S3Service } from 'src/common/service';
import { S3MulterFile } from 'src/common/types';
import { GetProductsQueryDto } from 'src/products/dto/get-product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * @desc 상품 등록
   * @returns
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const lhd = 'createProduct -';
    log.info(`${lhd} start.`);

    return this.productsService.create(createProductDto, req.user.id, lhd);
  }

  /**
   * @desc 상품 이미지 등록
   * @returns
   */
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(S3MultipleInterceptor('image', 5))
  async uploadProductImages(@UploadedFiles() files: S3MulterFile[]) {
    const lhd = `uploadImages -`;
    if (!files || files.length === 0) {
      log.error(`${lhd} failed. no files uploaded`);
      throw new BadRequestException('No files uploaded');
    }

    return { image_url: files.map((f) => f.location) };
  }

  /**
   * @desc 상품 목록
   * @returns
   */
  @Get()
  findAll(@Query() query: GetProductsQueryDto) {
    const lhd = 'listProduct -';
    log.info(`${lhd} start.`);

    return this.productsService.findAll(query, lhd);
  }

  /**
   * @desc 상품 상세
   * @returns
   */
  @Get(':productId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('productId') productId: string) {
    const lhd = 'readProduct -';
    log.info(`${lhd} start.`);

    return this.productsService.findOne(+productId);
  }

  /**
   * @desc 상품 판매자(상점) 상세
   * @returns
   */
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard)
  findStoreOne(@Param('storeId') storeId: string) {
    const lhd = 'readStore -';
    log.info(`${lhd} start.`);

    return this.productsService.findOne(+storeId);
  }

  /**
   * @desc 상품 수정
   * @returns
   */
  @Patch(':productId')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  /**
   * @desc 상품 삭제
   * @returns
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
