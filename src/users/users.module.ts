import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Order } from 'src/orders/entities/order.entity';
import { CommonModule } from 'src/common/common.module';
import { Follow } from 'src/follow/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Follow]),
    JwtModule,
    CommonModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
