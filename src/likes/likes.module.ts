import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from 'src/likes/entities/like.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Product, User]),
    UsersModule,
    AuthModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [TypeOrmModule],
})
export class LikesModule {}
