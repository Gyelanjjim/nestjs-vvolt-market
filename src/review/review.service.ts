import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/review/entities/review.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { log } from 'src/common/logger.util';
import { ErrorCode } from 'src/common/error-code.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createReview(
    userId: number,
    createReviewDto: CreateReviewDto,
    lhd: string,
  ): Promise<Review> {
    const { productId, contents, rating } = createReviewDto;

    // check: 이미 리뷰를 등록했는지
    const existingReview = await this.reviewRepo.findOneBy({
      user: { id: userId },
      product: { id: productId },
    });
    if (existingReview) {
      log.warn(
        `${lhd} failed. already reviewed. productId [${productId}], userId [${userId}]`,
      );
      throw new ConflictException({
        message: `Duplicate review.`,
        code: ErrorCode.DUPLICATED_RESOURCE,
      });
    }

    // check: 상품id 유효성
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) {
      log.warn(`${lhd} failed. not found product. productId [${productId}]`);
      throw new NotFoundException({
        message: `Not found product. productId [${productId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    const review = this.reviewRepo.create({
      product: { id: productId } as Product,
      user: { id: userId } as User,
      contents,
      rating,
    });

    return await this.reviewRepo.save(review);
  }

  async getReviewsByUser(userId: number, lhd: string) {
    // check: 유저id 유효성
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      log.warn(`${lhd} failed. not found user. userId [${userId}]`);
      throw new NotFoundException({
        message: `Not found user. userId [${userId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    return await this.reviewRepo
      .createQueryBuilder('review')
      .innerJoin('review.product', 'product')
      .leftJoin('review.user', 'user')
      .where('product.seller = :userId', { userId })
      .select([
        'review.id AS reviewId',
        'product.id AS productId',
        'user.id AS buyerId',
        'review.contents AS reviewContent',
        'review.rating AS rate',
        'user.nickname AS writerName',
        'user.user_image AS writerImg',
      ])
      .getRawMany();
  }

  async deleteReview(
    userId: number,
    reviewId: number,
    lhd: string,
  ): Promise<void> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });

    if (!review) {
      log.warn(`${lhd} failed. not foumd review. => reviewId [${reviewId}]`);
      throw new NotFoundException({
        message: `Not found review. reviewId [${reviewId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    if (review.user.id !== userId) {
      log.warn(`${lhd} failed. permission denied. => userId [${userId}]`);
      throw new ForbiddenException({
        message: `Permisson denied.`,
        code: ErrorCode.FORBIDDEN,
      });
    }

    const result = await this.reviewRepo.delete({
      id: reviewId,
    });

    if (result.affected === 0) {
      log.warn(`${lhd} failed. no review to delete`);
      throw new NotFoundException({
        message: `Not found review. reviewId [${reviewId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }
  }
}
