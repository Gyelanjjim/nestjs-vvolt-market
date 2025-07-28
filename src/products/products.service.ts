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

  findAll() {
    return `This action returns all products`;
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
