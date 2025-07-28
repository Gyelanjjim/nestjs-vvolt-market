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

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Like, Review]),
    UsersModule,
    AuthModule,
  ],
  exports: [TypeOrmModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
