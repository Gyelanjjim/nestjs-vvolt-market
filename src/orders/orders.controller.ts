import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import { successResponse } from 'src/common/service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Request() req) {
    const userId = req.user.id;
    const lhd = 'getMyOrders -';
    log.info(`${lhd} start.`);

    const data = await this.ordersService.getMyOrders(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
