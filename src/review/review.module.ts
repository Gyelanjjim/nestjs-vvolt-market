import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/review/entities/review.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ReviewController } from 'src/review/review.controller';
import { ReviewService } from 'src/review/review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, User, Product]),
    UsersModule,
    AuthModule,
  ],
  exports: [TypeOrmModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
