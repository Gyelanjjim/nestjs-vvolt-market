import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from 'src/products/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from 'src/products/entities/product-image.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { S3Service } from 'src/common/service';
import { Category } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Like, Review, Category]),
    UsersModule,
    AuthModule,
  ],
  exports: [TypeOrmModule],
  controllers: [ProductsController],
  providers: [ProductsService, S3Service],
})
export class ProductsModule {}
