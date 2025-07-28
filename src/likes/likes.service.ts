import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'src/likes/entities/like.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { log } from 'src/common/logger.util';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async toggleLike(
    userId: number,
    productId: number,
    lhd: string,
  ): Promise<'LIKED' | 'UNLIKED'> {
    const user = await this.userRepo.findOneBy({ id: userId });
    const product = await this.productRepo.findOneBy({ id: productId });

    if (!user || !product) {
      log.warn(`${lhd} failed. not found user or product.`);
      throw new NotFoundException('유저 또는 상품을 찾을 수 없습니다.');
    }

    const existingLike = await this.likeRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existingLike) {
      await this.likeRepo.remove(existingLike);
      log.info(`${lhd} success. like removed.`);

      return 'UNLIKED';
    } else {
      const like = this.likeRepo.create({ user, product });
      await this.likeRepo.save(like);
      log.info(`${lhd} success. like created.`);

      return 'LIKED';
    }
  }

  async getLikesByUserId(userId: number) {
    return await this.likeRepo
      .createQueryBuilder('l')
      .innerJoin('l.product', 'p')
      .leftJoin('p.images', 'pi')
      .select([
        'p.id AS productId',
        'p.name AS productName',
        'p.price AS productPrice',
        'p.location AS location',
        'p.created_at AS createdAt',
        'pi.image_url AS imageUrl',
        'l.user_id AS userId',
      ])
      .where('l.user_id = :userId', { userId })
      .groupBy('p.id')
      .addGroupBy('pi.image_url')
      .getRawMany();
  }

  // findAll() {
  //   return `This action returns all likes`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} like`;
  // }

  // update(id: number, updateLikeDto: UpdateLikeDto) {
  //   return `This action updates a #${id} like`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} like`;
  // }
}
