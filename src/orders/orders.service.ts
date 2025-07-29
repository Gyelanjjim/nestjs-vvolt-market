import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { log } from 'src/common/logger.util';
import { ErrorCode } from 'src/common/error-code.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getMyOrders(userId: number, lhd: string) {
    try {
      const orders = await this.orderRepo
        .createQueryBuilder('orders')
        .innerJoin('orders.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .select([
          'product.id',
          'product.name',
          'product.price',
          'product.createdAt',
          'product.location',
          'images.image_url',
        ])
        .where('orders.user.id = :userId', { userId })
        .getMany();

      // 결과 정리: product + image 배열을 정리
      const result = orders.map((order) => {
        const p = order.product as Product;
        return {
          productId: p.id,
          productName: p.name,
          productPrice: p.price,
          registerDate: p.createdAt,
          location: p.location,
          images: p.images?.map((img) => img.image_url) || [],
        };
      });

      log.info(`${lhd} success.`);
      return result;
    } catch (err) {
      log.error(`${lhd} failed. error [${JSON.stringify(err)}]`);
      throw new InternalServerErrorException({
        message: 'Failed to list orders',
        code: ErrorCode.INTERNAL_ERROR,
      });
    }
  }

  // create(createOrderDto: CreateOrderDto) {
  //   return 'This action adds a new order';
  // }

  // findAll() {
  //   return `This action returns all orders`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
