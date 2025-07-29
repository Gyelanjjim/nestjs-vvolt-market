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
      throw new ConflictException('리뷰는 한 번만 등록할 수 있습니다.');
    }

    // check: 상품id 유효성
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

  async getReviewsByUser(userId: number, lhd: string) {
    // check: 유저id 유효성
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      log.warn(`${lhd} failed. not found user. userId [${userId}]`);
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    return await this.reviewRepo
      .createQueryBuilder('review')
      .innerJoin('review.product', 'product')
      .leftJoin('review.user', 'user')
      .where('product.seller = :userId', { userId })
      .select([
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
      throw new NotFoundException('리뷰가 존재하지 않습니다.');
    }

    if (review.user.id !== userId) {
      log.warn(`${lhd} failed. permission denied. => userId [${userId}]`);
      throw new ForbiddenException('리뷰를 삭제할 권한이 없습니다.');
    }

    const result = await this.reviewRepo.delete({
      id: reviewId,
    });

    if (result.affected === 0) {
      log.warn(`${lhd} failed. no review to delete`);
      throw new NotFoundException('삭제할 리뷰가 없습니다.');
    }
  }
}
