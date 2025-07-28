import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,
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

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
