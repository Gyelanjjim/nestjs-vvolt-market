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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('tosspayment')
export class TosspaymentController {
  constructor(private readonly tossPaymentService: TosspaymentService) {}

  @ApiTags('Tosspayment')
  @Post('confirm')
  @ApiOperation({
    summary: '토스 결제 승인',
    description:
      '프론트로부터 전달받은 결제 정보를 기반으로 토스 결제 승인 요청을 수행합니다.',
  })
  @ApiBody({
    type: CreateTossPaymentDto,
    description: '토스 결제 승인에 필요한 정보',
  })
  @ApiResponse({
    status: 200,
    description: '결제 승인 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
      },
    },
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async confirmPayment(@Body() dto: CreateTossPaymentDto) {
    const lhd = `confirmeToss -`;
    log.info(`${lhd} start.`);

    await this.tossPaymentService.confirm(dto);

    log.info(`${lhd} success.`);
    return successResponse();
  }
}
