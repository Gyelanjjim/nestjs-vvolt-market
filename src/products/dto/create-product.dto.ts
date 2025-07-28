import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { ProductStatus } from 'src/products/enums/product-status.enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  status: ProductStatus;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5) // 최대 5개 제한
  imageUrl?: string[]; // S3 업로드 후 URL을 저장하는 용도
}
