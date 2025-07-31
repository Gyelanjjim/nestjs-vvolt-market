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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiTags('Products')
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상품 등록',
    description: '판매할 상품을 등록합니다.',
  })
  @ApiBody({ type: CreateProductDto, description: '상품 등록에 필요한 정보' })
  @ApiResponse({
    status: 200,
    description: '상품 등록 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
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

  @ApiTags('Products')
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(S3MultipleInterceptor('image', 5))
  @ApiOperation({
    summary: '상품 이미지 등록',
    description:
      '판매할 상품의 이미지를 등록합니다. 최대 5개까지 등록할 수 있습니다',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '업로드할 이미지 파일들 (최대 5개)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '상품 이미지 등록 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: {
          image_url: [
            'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/fa29469964884ec18e215576ec96a51e',
            'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/42aa9e5a8e504a62bc747bcb5d038f04',
            'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/0a8c6dfe06aa42d59ccb40357ead5e5a',
            'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/fb46db4977664805a2da3f5244b20664',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: '파일 크기는 1MB를 초과할 수 없음',
    schema: {
      example: {
        code: 'E413',
        message: 'File size must not exceed 1MB.',
      },
    },
  })
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

  @ApiTags('Products')
  @Get()
  @ApiOperation({
    summary: '상품 목록',
    description: '상품 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 기준 - new(최신순), pHigh(가격높은순), pLow(가격낮은순)',
    example: 'new',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: '카테고리 ID',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: '상품 목록 조회 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: [
          {
            id: 2,
            name: '모니터1',
            price: '2300.00',
            location: '서울시 금천구',
            latitude: '34.44440000',
            longitude: '127.22220000',
            category: {
              id: 2,
              name: '전자기기',
            },
            images: [
              {
                image_url:
                  'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250728/b8a67444d7f043e68bdfbc22050e6300',
              },
            ],
          },
        ],
      },
    },
  })
  async findAll(@Query() query: GetProductsQueryDto) {
    const lhd = 'listProduct -';
    log.info(`${lhd} start.`);

    const data = await this.productsService.findAll(query, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  @ApiTags('Products')
  @Get(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상품 조회',
    description: '특정 상품(productId)을 조회합니다.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    required: true,
    description: '상세 조회할 상품 ID',
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: '상품 조회 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: {
          product: {
            id: 4,
            name: '모니터1',
            description: '사용감있는 2년된 LG모니터입니다',
            price: '3600.00',
            location: '서울시 금천구',
            latitude: '34.44440000',
            longitude: '127.22220000',
            seller: {
              id: 1,
              nickname: '계란찜2',
            },
            status: 1,
            category: {
              id: 2,
              name: '전자기기',
            },
            images: [
              {
                image_url:
                  'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250728/b8a67444d7f043e68bdfbc22050e6300',
              },
            ],
          },
          store: {
            id: 1,
            nickname: '계란찜2',
            productCount: 1,
            followerCount: 0,
          },
          reviews: [],
          isLiked: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '특정 상품(productId)을 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found product. productId [2]',
      },
    },
  })
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

  @ApiTags('Products')
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '특정 판매자의 상품 목록',
    description: '특정 판매자(storeId)가 등록한 상품 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'storeId',
    type: Number,
    required: true,
    description: '등록한 상품 목록 조회할 특정 판매자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 404,
    description: '판매자(storeId)을 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found store. storeId [3]',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '특정 판매자의 상품 목록 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: [
          {
            id: 4,
            name: '모니터2',
            price: '2300.00',
            location: '서울시 금천구',
            category: {
              id: 2,
              name: '전자기기',
            },
            images: [
              {
                image_url:
                  'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250728/49b5e88a50164901875e69e8dffcf818',
              },
              {
                image_url:
                  'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250728/f965cd2853ba456b861d85b5ac3896ff',
              },
              {
                image_url:
                  'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250728/d9457752594a427293773f1bb5e7f4bd',
              },
              {
                image_url:
                  'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250728/b8a67444d7f043e68bdfbc22050e6300',
              },
            ],
            createdAt: '2025-07-29T07:09:50.900Z',
          },
        ],
      },
    },
  })
  async getStoreProducts(@Param('storeId', ParseIntPipe) storeId: number) {
    const lhd = `getStoreProducts -`;
    log.info(`${lhd} start.`);

    const data = await this.productsService.findStoreProducts(storeId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  @ApiTags('Products')
  @Put(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상품 수정',
    description: '특정 상품(productId)을 수정합니다.',
  })
  @ApiBody({ type: UpdateProductDto, description: '상품 수정에 필요한 정보' })
  @ApiParam({
    name: 'productId',
    type: Number,
    required: true,
    description: '수정할 특정 상품 ID',
    example: 13,
  })
  @ApiResponse({
    status: 200,
    description: '상품 수정 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품(productId)을 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found product. productId [3]',
      },
    },
  })
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

  @ApiTags('Products')
  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상품 삭제',
    description: '특정 상품(productId)을 삭제합니다.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    required: true,
    description: '삭제할 특정 상품 ID',
    example: 13,
  })
  @ApiResponse({
    status: 200,
    description: '상품 삭제 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품(productId)을 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found product. productId [3]',
      },
    },
  })
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
