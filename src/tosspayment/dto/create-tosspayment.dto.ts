import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateTossPaymentDto {
  @ApiProperty({
    example: 1,
    description: '결제 수량 (1건)',
  })
  @IsInt()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 12,
    description: '주문 ID',
  })
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({
    example: 'tpay_9d809d3d8e3c40e4ab79d68e878c',
    description: '토스(Toss)에서 발급한 결제 키. 결제 승인에 사용됩니다.',
  })
  @IsString()
  @IsNotEmpty()
  paymentKey: string;
}
