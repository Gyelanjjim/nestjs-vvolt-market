import { PartialType } from '@nestjs/mapped-types';
import { CreateTossPaymentDto } from './create-tosspayment.dto';

export class UpdateTossPaymentDto extends PartialType(CreateTossPaymentDto) {}
