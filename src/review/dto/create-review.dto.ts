import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 1,
    description: '리뷰할 상품 ID',
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    example: '노트북 거의 새거 같아요 잘 쓰고 있습니다^^',
    description: '리뷰 내용',
  })
  @IsString()
  @IsNotEmpty()
  contents: string;

  @ApiProperty({
    example: 5,
    description: '리뷰 별점(1 ~ 5)',
  })
  @IsInt()
  rating: number;
}
