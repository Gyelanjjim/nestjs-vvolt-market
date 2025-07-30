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
import { Review } from 'src/review/entities/review.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { ErrorCode } from 'src/common/error-code.enum';

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

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
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

    const category = await this.categoryRepo.findOneBy({ id: categoryId });
    if (!category) {
      log.warn(`${lhd} failed. not found category. categoryId [${categoryId}]`);
      throw new NotFoundException({
        message: `Not found category. categoryId [${categoryId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

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

      return await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      log.error(`${lhd} failed. error [${JSON.stringify(err)}]`);
      throw new InternalServerErrorException({
        message: `Failed to create product`,
        code: ErrorCode.INTERNAL_ERROR,
      });
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

    return products;
  }

  async findOne(productId: number, userId: number, lhd: string) {
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
      log.warn(`${lhd} failed. not found product. => productId [${productId}]`);
      throw new NotFoundException({
        message: `Not found product. productId [${productId}]`,
        code: ErrorCode.NOT_FOUND,
      });
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
      select: ['user', 'contents', 'rating'],
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

  async findStoreProducts(storeId: number, lhd: string) {
    const products = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.seller.id = :storeId', { storeId })
      .select([
        'product.id',
        'product.name',
        'product.price',
        'product.location',
        'product.createdAt',
        'images.image_url',
        'category.id',
        'category.name',
      ])
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    log.info(
      `${lhd} success. storeId [${storeId}], count [${products.length}]`,
    );
    return products;
  }

  async update(
    productId: number,
    dto: UpdateProductDto,
    userId: number,
    lhd: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });

    if (!product) {
      log.warn(`${lhd} failed. not found. => productId [${productId}]`);
      throw new NotFoundException({
        message: `Not found product. productId [${productId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    if (product.seller.id !== userId) {
      log.warn(`${lhd} failed. not authorized. => userId [${userId}]`);
      throw new ForbiddenException({
        message: `Permisson denied.`,
        code: ErrorCode.FORBIDDEN,
      });
    }

    const queryRunner = this.productRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 상품 정보 수정
      if (dto.categoryId) {
        product.category = { id: dto.categoryId } as Category;
      }

      Object.assign(product, {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status,
      });

      await queryRunner.manager.save(product);

      // 이미지 교체
      if (dto.imageUrl && dto.imageUrl.length > 0) {
        // 기존 이미지 삭제
        await queryRunner.manager.delete(ProductImage, {
          product: { id: productId },
        });

        // 새 이미지 삽입
        const imageEntities = dto.imageUrl.map((url) =>
          this.productImageRepo.create({
            product: { id: productId } as Product,
            image_url: url,
          }),
        );
        await queryRunner.manager.save(imageEntities);
      }

      // if (dto.imageUrl && dto.imageUrl.length > 0) {
      //   // 1. 기존 이미지 목록 조회
      //   const prevImages = await this.productImageRepo.find({
      //     where: { product: { id: productId } },
      //   });

      //   const prevUrls = prevImages.map((img) => img.image_url);
      //   const newUrls = dto.imageUrl;

      //   // 2. 제거된 이미지 URL 목록 추출
      //   const deletedUrls = prevUrls.filter((url) => !newUrls.includes(url));

      //   // 3. S3에서 삭제
      //   for (const url of deletedUrls) {
      //     const key = this.extractS3KeyFromUrl(url);
      //     await this.s3Service.deleteFile(key);
      //   }

      //   // 4. DB 이미지 삭제
      //   await queryRunner.manager.delete(ProductImage, {
      //     product: { id: productId },
      //   });

      //   // 5. DB 이미지 새로 저장
      //   const imageEntities = newUrls.map((url) =>
      //     this.productImageRepo.create({
      //       product: { id: productId } as Product,
      //       image_url: url,
      //     }),
      //   );
      //   await queryRunner.manager.save(imageEntities);
      // }

      await queryRunner.commitTransaction();
      log.info(`${lhd} success.`);
      return;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      log.error(`${lhd} failed. error [${JSON.stringify(err)}]`);
      throw new InternalServerErrorException({
        message: `Failed to update product`,
        code: ErrorCode.INTERNAL_ERROR,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async remove(productId: number, userId: number, lhd) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });

    if (!product) {
      log.warn(`${lhd} failed. not found product. => productId [${productId}]`);
      throw new NotFoundException({
        message: `Not found product. productId [${productId}]`,
        code: ErrorCode.NOT_FOUND,
      });
    }

    // 본인 상품만 삭제 가능
    if (product.seller.id !== userId) {
      log.warn(`${lhd} failed. not authorized. => userId [${userId}]`);
      throw new ForbiddenException({
        message: `Permisson denied.`,
        code: ErrorCode.FORBIDDEN,
      });
    }

    log.info(`${lhd} success. deleted productId [${productId}]`);
    return await this.productRepo.delete(productId);
  }
}
