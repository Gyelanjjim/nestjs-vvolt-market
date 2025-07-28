import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { LikesModule } from './likes/likes.module';
import { S3Service } from 'src/common/service';
import { TosspaymentModule } from './tosspayment/tosspayment.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 어디서든 import 없이 사용 가능
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '3306')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    ReviewsModule,
    AuthModule,
    LikesModule,
    TosspaymentModule,
    FollowModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
  exports: [JwtModule, S3Service],
})
export class AppModule {}
