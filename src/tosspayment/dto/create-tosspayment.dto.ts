import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTossPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  paymentKey: string;
}
