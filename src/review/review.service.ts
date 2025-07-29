import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/review/entities/review.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { log } from 'src/common/logger.util';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async createReview(
    userId: number,
    createReviewDto: CreateReviewDto,
    lhd: string,
  ): Promise<Review> {
    const { productId, contents, rating } = createReviewDto;

    // 이미 등록된 리뷰가 있는 경우
    const existingReview = await this.reviewRepo.findOneBy({
      user: { id: userId },
      product: { id: productId },
    });

    if (existingReview) {
      log.warn(
        `${lhd} failed. already reviewed - productId [${productId}], userId [${userId}]`,
      );
      throw new ConflictException('리뷰는 한 번만 등록할 수 있습니다.');
    }

    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) {
      log.warn(`${lhd} failed. not found product. productId [${productId}]`);
      throw new NotFoundException('해당 상품이 존재하지 않습니다.');
    }

    const review = this.reviewRepo.create({
      product: { id: productId } as Product,
      user: { id: userId } as User,
      contents,
      rating,
    });

    return await this.reviewRepo.save(review);
  }
}
