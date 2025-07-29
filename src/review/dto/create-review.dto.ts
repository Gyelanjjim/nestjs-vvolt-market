import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  productId: number;

  @IsString()
  @IsNotEmpty()
  contents: string;

  @IsInt()
  rating: number;
}
