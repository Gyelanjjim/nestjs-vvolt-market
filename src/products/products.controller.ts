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
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import {
  S3MultipleInterceptor,
  S3Service,
  successResponse,
} from 'src/common/service';
import { S3MulterFile } from 'src/common/types';
import { GetProductsQueryDto } from 'src/products/dto/get-product-query.dto';
import { ErrorCode } from 'src/common/error-code.enum';

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
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const lhd = 'createProduct -';
    const userId = req.user.id;
    log.info(`${lhd} start.`);

    const data = await this.productsService.create(
      createProductDto,
      userId,
      lhd,
    );

    log.info(`${lhd} success.`);
    return successResponse(data);
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
    log.info(`${lhd} start.`);

    if (!files || files.length === 0) {
      log.warn(`${lhd} failed. no files uploaded`);
      throw new BadRequestException({
        message: 'No files uploaded',
        code: ErrorCode.BAD_REQUEST,
      });
    }

    const data = { image_url: files.map((f) => f.location) };

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 상품 목록
   * @returns
   */
  @Get()
  async findAll(@Query() query: GetProductsQueryDto) {
    const lhd = 'listProduct -';
    log.info(`${lhd} start.`);

    const data = await this.productsService.findAll(query, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 상품 상세
   * @returns
   */
  @Get(':productId')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const lhd = 'readProduct -';
    const userId = req.user.id;
    log.info(`${lhd} start.`);

    const data = await this.productsService.findOne(productId, userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 판매자(상점)의 상품 목록
   * @returns
   */
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard)
  async getStoreProducts(@Param('storeId', ParseIntPipe) storeId: number) {
    const lhd = `getStoreProducts -`;
    log.info(`${lhd} start.`);

    const data = await this.productsService.findStoreProducts(storeId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 상품 수정
   * @returns
   */
  @Put(':productId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const lhd = 'updateProduct -';
    const userId = req.user.id;
    log.info(`${lhd} start.`);

    await this.productsService.update(productId, updateProductDto, userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse();
  }

  /**
   * @desc 상품 삭제
   * @returns
   */
  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const lhd = 'deleteProduct -';
    const userId = req.user.id;
    log.info(`${lhd} start.`);

    await this.productsService.remove(productId, userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse();
  }
}
