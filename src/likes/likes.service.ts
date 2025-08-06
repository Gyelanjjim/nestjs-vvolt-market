import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'src/likes/entities/like.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { log } from 'src/common/logger.util';
import { ErrorCode } from 'src/common/error-code.enum';

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

    if (!user) {
      log.warn(`${lhd} failed. not found user. => userId [${userId}]`);
      throw new NotFoundException({
        message: `Not found user. userId [${userId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    if (!product) {
      log.warn(`${lhd} failed. not found product. => productId [${productId}]`);
      throw new NotFoundException({
        message: `Not found product. productId [${productId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    const existingLike = await this.likeRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existingLike) {
      await this.likeRepo.remove(existingLike);
      log.info(
        `${lhd} like removed. => userId [${userId}] productId [${productId}]`,
      );

      return 'UNLIKED';
    } else {
      const like = this.likeRepo.create({ user, product });
      await this.likeRepo.save(like);
      log.info(
        `${lhd} like created. => userId [${userId}] productId [${productId}]`,
      );

      return 'LIKED';
    }
  }

  // async getLikesByUserId(userId: number, lhd: string) {
  //   const user = await this.userRepo.findOneBy({ id: userId });
  //   if (!user) {
  //     log.warn(`${lhd} failed. not found user. => userId [${userId}]`);
  //     throw new NotFoundException({
  //       message: `Not found user. userId [${userId}]`,
  //       code: ErrorCode.NOT_FOUND,
  //     });
  //   }

  //   const rows = await this.likeRepo
  //     .createQueryBuilder('l')
  //     .innerJoin('l.product', 'p')
  //     .leftJoin('p.images', 'pi')
  //     .select([
  //       'p.id AS productId',
  //       'p.name AS productName',
  //       'p.price AS productPrice',
  //       'p.location AS location',
  //       'p.created_at AS createdAt',
  //       'pi.imageUrl AS imageUrl',
  //       'l.user_id AS userId',
  //     ])
  //     .where('l.user_id = :userId', { userId })
  //     .getRawMany();

  //   // JS에서 그룹핑
  //   const productMap = new Map();

  //   for (const row of rows) {
  //     const {
  //       productId,
  //       productName,
  //       productPrice,
  //       location,
  //       createdAt,
  //       imageUrl,
  //       userId,
  //     } = row;

  //     if (!productMap.has(productId)) {
  //       productMap.set(productId, {
  //         productId,
  //         productName,
  //         productPrice,
  //         location,
  //         createdAt,
  //         userId,
  //         imageUrls: imageUrl ? [imageUrl] : [],
  //       });
  //     } else {
  //       if (imageUrl) {
  //         productMap.get(productId).imageUrls.push(imageUrl);
  //       }
  //     }
  //   }

  //   const list = Array.from(productMap.values());

  //   return { total: list.length, list };
  // }
  async getLikesByUserId(userId: number, lhd: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      log.warn(`${lhd} failed. not found user. => userId [${userId}]`);
      throw new NotFoundException({
        message: `Not found user. userId [${userId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    const likes = await this.likeRepo
      .createQueryBuilder('like')
      .innerJoinAndSelect('like.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('like.user = :userId', { userId })
      .orderBy('like.createdAt', 'DESC')
      .select([
        'like.id',
        'product.id',
        'product.name',
        'product.price',
        'product.location',
        'product.latitude',
        'product.longitude',
        'product.createdAt',
        'category.id',
        'category.name',
        'images.id',
        'images.imageUrl',
        'seller.id',
        'seller.nickname',
        'seller.userImage',
      ])
      .getMany();

    // product만 추출
    const likedProducts = likes.map((like) => like.product);

    return {
      total: likedProducts.length,
      list: likedProducts,
    };
  }
}
