import { IsOptional, IsString } from 'class-validator';

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  sort?: 'new' | 'pHigh' | 'pLow';

  @IsOptional()
  @IsString()
  category?: string;

  // 필요 시 지역, 키워드 등 추가 가능
}
