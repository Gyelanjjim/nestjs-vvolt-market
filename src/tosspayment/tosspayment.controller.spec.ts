import { Test, TestingModule } from '@nestjs/testing';
import { TosspaymentController } from './tosspayment.controller';
import { TosspaymentService } from './tosspayment.service';

describe('TosspaymentController', () => {
  let controller: TosspaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TosspaymentController],
      providers: [TosspaymentService],
    }).compile();

    controller = module.get<TosspaymentController>(TosspaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
