import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ProductImage } from 'src/products/entities/product-image.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { log } from 'src/common/logger.util';
import { GetProductsQueryDto } from 'src/products/dto/get-product-query.dto';
import { Follow } from 'src/users/entities/follow.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Like } from 'src/likes/entities/like.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,

    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,

    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  async create(dto: CreateProductDto, userId: number, lhd: string) {
    const {
      name,
      description,
      price,
      location,
      latitude,
      longitude,
      status,
      categoryId,
      imageUrl,
    } = dto;

    const queryRunner = this.productRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Product)
        .values({
          name,
          description,
          price,
          location,
          latitude,
          longitude,
          status,
          category: { id: categoryId } as Category,
          seller: { id: userId } as User,
        })
        .execute();

      const productId = product.identifiers[0].id;

      if (imageUrl && imageUrl.length > 0) {
        const imageEntities = imageUrl.map((url) =>
          this.productImageRepo.create({
            image_url: url,
            product: { id: productId } as Product,
          }),
        );

        await queryRunner.manager
          .getRepository(ProductImage)
          .save(imageEntities);
      }

      await queryRunner.commitTransaction();
      log.info(`${lhd} success.`);
      return { message: 'POST_SUCCESS' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      log.error(`${lhd} failed. error [${JSON.stringify(err)}]`);
      throw new InternalServerErrorException('상품 생성 실패');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: GetProductsQueryDto, lhd: string) {
    const { sort, category } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images') // @OneToMany로 연결된 product_images
      .select([
        'product.id',
        'product.name',
        'product.price',
        'product.created_at',
        'product.location',
        'product.latitude',
        'product.longitude',
        'category.id',
        'category.name',
        'images.image_url',
      ]);

    // 정렬 조건
    if (sort === 'pHigh') {
      qb.orderBy('product.price', 'DESC');
    } else if (sort === 'pLow') {
      qb.orderBy('product.price', 'ASC');
    } else {
      qb.orderBy('product.created_at', 'DESC'); // default
    }

    // 필터 조건 (옵션)
    if (category) {
      qb.andWhere('category.id = :category', { category });
    }

    const products = await qb.getMany();
    log.info(`${lhd} success.`);

    return products;
  }

  async findOne(productId: number, userId: number) {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.seller', 'seller') // User entity
      .where('product.id = :productId', { productId })
      .select([
        'product.id',
        'product.name',
        'product.description',
        'product.price',
        'product.location',
        'product.latitude',
        'product.longitude',
        'product.status',
        'category.id',
        'category.name',
        'images.image_url',
        'seller.id',
        'seller.nickname',
        'seller.user_image',
      ])
      .getOne();

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 스토어의 총 상품 수
    const productCount = await this.productRepo.count({
      where: { seller: { id: product.seller.id } },
    });

    // 팔로워 수 (follow 테이블 필요)
    const followerCount = await this.followRepo.count({
      where: { followee: { id: product.seller.id } },
    });

    // 리뷰 정보
    const reviews = await this.reviewRepo.find({
      where: { product: { id: productId } },
      select: ['user', 'content', 'rating'],
    });

    // 좋아요 여부
    const isLiked = await this.likeRepo.findOne({
      where: { product: { id: productId }, user: { id: userId } },
    });

    return {
      product,
      store: {
        id: product.seller.id,
        nickname: product.seller.nickname,
        userImage: product.seller.userImage,
        productCount,
        followerCount,
      },
      reviews,
      isLiked: !!isLiked,
    };
  }

  findStoreOne(storeId: number) {}

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(productId: number, userId: number, lhd) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });

    if (!product) {
      log.warn(`${lhd} failed. not found product. => productId [${productId}]`);
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 본인 상품만 삭제 가능
    if (product.seller.id !== userId) {
      log.warn(`${lhd} failed. not authorized. => userId [${userId}]`);
      throw new ForbiddenException('상품을 삭제할 권한이 없습니다');
    }

    await this.productRepo.delete(productId);
    log.info(`${lhd} success. deleted productId [${productId}]`);

    return { message: 'PRODUCT_DELETE_SUCCESS' };
  }
}
