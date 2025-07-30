import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { SocialPlatform } from 'src/users/enums/social-platform.enum';
import { Product } from 'src/products/entities/product.entity';
import { Review } from 'src/review/entities/review.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Order } from 'src/orders/entities/order.entity';
import { UserDetailDto } from 'src/users/dto/get-user-detail.dto';
import { log } from 'src/common/logger.util';
import { Follow } from 'src/follow/entities/follow.entity';
import { ErrorCode } from 'src/common/error-code.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createSocialUser(socialId: string, kakaoNick: string): Promise<User> {
    const newUser = this.userRepository.create({
      social_id: socialId,
      social_platform_id: SocialPlatform.KAKAO,
      name: kakaoNick,
      nickname: '',
      address: '',
      latitude: 0,
      longitude: 0,
      userImage: '',
      description: '',
    });

    return this.userRepository.save(newUser);
  }

  async createUserData(
    userId: number,
    dto: CreateUserDto,
    lhd: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      log.warn(`${lhd} failed. not found user. => userId [${userId}]`);
      throw new NotFoundException({
        message: `Not found user. userId [${userId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    if (user.nickname) {
      log.warn(
        `${lhd} failed. already existed user. => userId [${userId}] nickname [${user.nickname}]`,
      );
      throw new ConflictException({
        message: `Duplicated user.`,
        code: ErrorCode.DUPLICATED_RESOURCE,
      });
    }

    await this.userRepository.update(userId, {
      nickname: dto.nickname,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findBySocialId(socialId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { social_id: socialId } });
  }

  async getUserDetailById(userId: number): Promise<UserDetailDto> {
    const result = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('u')
      .select([]) // ✅ 초기화: u.* 포함 안 되게 설정
      .leftJoin('u.products', 'p')
      .leftJoin('p.reviews', 'r')
      .leftJoin('p.orders', 'o')
      .leftJoin('u.likes', 'l')
      .addSelect('u.id', 'sellerId')
      .addSelect('u.name', 'name')
      .addSelect('u.nickname', 'sellerName')
      .addSelect('u.user_image', 'sellerImg')
      .addSelect('u.description', 'sellerIntro')
      .addSelect('u.created_at', 'sellerOpenDay')
      .addSelect('u.address', 'address')
      .addSelect('u.latitude', 'latitude')
      .addSelect('u.longitude', 'longitude')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('JSON_ARRAYAGG(p.id)', 'productId')
            .from(Product, 'p')
            .where('p.user_id = :userId', { userId }),
        'productId',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('AVG(r.rating)', 'starAVG')
            .from(Review, 'r')
            .innerJoin('r.product', 'p')
            .where('p.user_id = :userId', { userId }),
        'starAVG',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(r.id)', 'reviewNum')
            .from(Review, 'r')
            .innerJoin('r.product', 'p')
            .where('p.user_id = :userId', { userId }),
        'reviewNum',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'onSaleNum')
            .from(Product, 'p')
            .where('p.user_id = :userId', { userId }),
        'onSaleNum',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'soldOutNum')
            .from(Product, 'p')
            .innerJoin('p.orders', 'o')
            .where('p.user_id = :userId', { userId })
            .andWhere('o.status = 1'),
        'soldOutNum',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'likeNum')
            .from(Like, 'l')
            .where('l.user_id = :userId', { userId }),
        'likeNum',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'followingNum')
            .from(Follow, 'f')
            .where('f.follower = :userId', { userId }),
        'followingNum',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'followNum')
            .from(Follow, 'f')
            .where('f.followee = :userId', { userId }),
        'followNum',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'orderNum')
            .from(Order, 'o')
            .where('o.user_id = :userId', { userId }),
        'orderNum',
      )
      .where('u.id = :userId', { userId })
      .getRawOne();

    return {
      ...result,
      name: result.name || result.nickname,
      reviewNum: Number(result.reviewNum),
      onSaleNum: Number(result.onSaleNum),
      soldOutNum: Number(result.soldOutNum),
      likeNum: Number(result.likeNum),
      followingNum: Number(result.followingNum),
      followNum: Number(result.followNum),
      orderNum: Number(result.orderNum),
      starAVG: result.starAVG === null ? 0 : Number(result.starAVG),
    };
  }

  async getFollow(
    userId: number,
    followeeId: number,
  ): Promise<{ existence: number }> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select(
        `EXISTS(
      SELECT 1
      FROM follow f
      WHERE f.follower = :userId
        AND f.followee = :followeeId
    )`,
        'existence',
      )
      .from('follow', 'dummy')
      .setParameters({ userId, followeeId })
      .getRawOne();

    return result; // { existence: 1 } or { existence: 0 }
  }

  async findOne(userIdByToken: number, userId: number, lhd: string) {
    const isMyShop = userId == userIdByToken;
    const shopInfo = await this.getUserDetailById(userId);
    if (!shopInfo) {
      log.warn(`${lhd} failed. not found user. userId [${userId}]`);
      throw new NotFoundException({
        message: `Not found user. userId [${userId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }
    const myInfo = await this.getUserDetailById(userIdByToken);
    const isFollow = await this.getFollow(userIdByToken, userId);

    return {
      isMyShop,
      isFollow,
      myData: {
        writerId: myInfo.sellerId,
        writerName: myInfo.sellerName,
        writerImg: myInfo.sellerImg,
        address: myInfo.address,
        latitude: myInfo.latitude,
        longitude: myInfo.longitude,
        realName: myInfo.name,
      },
      shopData: shopInfo,
    };
  }

  async updateUser(userId: number, updateData: UpdateUserDto, lhd: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      log.warn(`${lhd} failed. not found user. => userId [${userId}]`);
      throw new NotFoundException({
        message: `Not found user. userId [${userId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    return user;
  }
}
