import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetProductsQueryDto {
  @ApiProperty({
    example: 'new',
    description: '정렬 기준: 최신순(new), 가격높은순(pHigh), 가격낮은순(pLow)',
  })
  @IsOptional()
  @IsString()
  sort?: 'new' | 'pHigh' | 'pLow';

  @ApiProperty({
    example: '2',
    description: '카테고리 ID',
  })
  @IsOptional()
  @IsString()
  category?: string;

  // 필요 시 지역, 키워드 등 추가 가능
}
