import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TosspaymentService } from './tosspayment.service';
import { CreateTossPaymentDto } from './dto/create-tosspayment.dto';
import { UpdateTossPaymentDto } from './dto/update-tosspayment.dto';
import { log } from 'src/common/logger.util';
import { successResponse } from 'src/common/service';

@Controller('tosspayment')
export class TosspaymentController {
  constructor(private readonly tossPaymentService: TosspaymentService) {}

  @Post('confirm')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async confirmPayment(@Body() dto: CreateTossPaymentDto) {
    const lhd = `confirmeToss -`;
    log.info(`${lhd} start.`);

    await this.tossPaymentService.confirm(dto);

    log.info(`${lhd} success.`);
    return successResponse();
  }
}
