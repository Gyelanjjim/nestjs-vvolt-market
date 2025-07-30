import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsInt,
} from 'class-validator';
import { ProductStatus } from 'src/products/enums/product-status.enum';

export class CreateProductDto {
  @ApiProperty({
    example: 'LG노트북 그램',
    description: '상품명',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '사용감 있는 A급 노트북입니다.',
    description: '상품 설명',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 4000,
    description: '상품 가격 (원)',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: '서울시 강남구',
    description: '거래 위치 - 주소',
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: 34.123123,
    description: '거래 위치 - 위도',
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    example: 127.123123,
    description: '거래 위치 - 경도',
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: 1,
    description: '상품 상태: S급(1), A급(2), B급(3)',
  })
  @IsInt()
  status: ProductStatus;

  @ApiProperty({
    example: 1,
    description: '상품 카테고리',
  })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    example:
      'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/fa29469964884ec18e215576ec96a51e',
    description: '상품 이미지 url',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5) // 최대 5개 제한
  imageUrl?: string[]; // S3 업로드 후 URL을 저장하는 용도
}
