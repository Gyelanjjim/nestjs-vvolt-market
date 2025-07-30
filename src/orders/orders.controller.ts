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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiTags('Orders')
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '내 주문 목록',
    description: '내 주문 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주문 목록 조회 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: [],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
  async getMyOrders(@Request() req) {
    const userId = req.user.id;
    const lhd = 'getMyOrders -';
    log.info(`${lhd} start.`);

    const data = await this.ordersService.getMyOrders(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
