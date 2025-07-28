import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTossPaymentDto } from 'src/tosspayment/dto/create-tosspayment.dto';
import { TossPayment } from 'src/tosspayment/entities/tosspayment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TosspaymentService {
  constructor(
    @InjectRepository(TossPayment)
    private readonly tossPaymentRepo: Repository<TossPayment>,
  ) {}

  async confirm(dto: CreateTossPaymentDto) {
    const payment = this.tossPaymentRepo.create(dto);
    return this.tossPaymentRepo.save(payment);
  }
}
