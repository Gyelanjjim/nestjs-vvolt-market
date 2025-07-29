import { IsInt } from 'class-validator';

export class DeleteReviewDto {
  @IsInt()
  userId: number;

  @IsInt()
  productId: number;
}
