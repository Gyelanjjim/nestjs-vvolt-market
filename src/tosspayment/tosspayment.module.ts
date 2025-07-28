import { Module } from '@nestjs/common';
import { TosspaymentService } from './tosspayment.service';
import { TosspaymentController } from './tosspayment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TossPayment } from 'src/tosspayment/entities/tosspayment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TossPayment])],
  controllers: [TosspaymentController],
  providers: [TosspaymentService],
})
export class TosspaymentModule {}
