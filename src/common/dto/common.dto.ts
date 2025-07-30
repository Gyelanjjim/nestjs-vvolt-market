import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({ example: 'S200', description: '응답 코드' })
  code: string;

  @ApiProperty({ example: 'Success.' })
  message: string;

  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;
}
