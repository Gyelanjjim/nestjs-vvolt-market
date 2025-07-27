import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { SocialPlatform } from 'src/users/enums/social-platform.enum';
import { Product } from 'src/products/entities/product.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Follow } from 'src/users/entities/follow.entity';
import { Order } from 'src/orders/entities/order.entity';
import { UserDetailDto } from 'src/users/dto/get-user-detail.dto';
import { log } from 'src/common/logger.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createSocialUser(socialId: string): Promise<User> {
    const newUser = this.userRepository.create({
      social_id: socialId,
      social_platform_id: SocialPlatform.KAKAO,
      nickname: '',
      address: '',
      latitude: 0,
      longitude: 0,
      user_image: '',
      description: '',
    });

    return this.userRepository.save(newUser);
  }

  async createUserData(userId: number, dto: CreateUserDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('존재하지 않는 유저입니다');
    if (user.nickname) throw new BadRequestException('이미 가입된 유저입니다');

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
      .leftJoin('u.products', 'p')
      .leftJoin('p.reviews', 'r')
      .leftJoin('p.orders', 'o')
      .leftJoin('u.likes', 'l')
      .addSelect('u.id', 'sellerId')
      .addSelect('u.nickname', 'sellerName')
      .addSelect('u.user_image', 'sellerImg')
      .addSelect('u.description', 'sellerIntro')
      .addSelect('u.created_at', 'sellerOpenDay')
      .addSelect('u.address', 'address')
      .addSelect('u.latitude', 'latitude')
      .addSelect('u.longitude', 'longitude')
      .addSelect('u.social_id', 'social_id')
      .addSelect('u.social_platform_id', 'social_platform_id')
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

    return result;
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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(userIdByToken: number, userId: number, lhd: string) {
    const elapsed = Date.now();
    const isMyShop = userId == userIdByToken;
    const shopInfo = await this.getUserDetailById(userId);
    const myInfo = await this.getUserDetailById(userIdByToken);
    const isFollow = await this.getFollow(userIdByToken, userId);

    log.info(
      `${lhd} success. find user info by userId [${userId}] and userIdByToken [${userIdByToken}] elapsed [${Date.now() - elapsed} s]`,
    );
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
