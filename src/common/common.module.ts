import { Module } from '@nestjs/common';
import { S3Service } from './service'; // service.ts에 있을 경우

@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class CommonModule {}
