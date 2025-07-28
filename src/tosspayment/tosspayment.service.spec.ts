import { Test, TestingModule } from '@nestjs/testing';
import { TosspaymentService } from './tosspayment.service';

describe('TosspaymentService', () => {
  let service: TosspaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TosspaymentService],
    }).compile();

    service = module.get<TosspaymentService>(TosspaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
