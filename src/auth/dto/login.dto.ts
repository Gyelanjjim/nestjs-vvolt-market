import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example:
      '_jNZvxOKsdf3bGIAzTrpDF9guNH_k7bsMYOrpwCiQE4NifiPSRt5lwBBBBQKDRSjAAABmFbh4kYWphHJzwXJqw',
    description: '카카오 인증 후 리다이렉트로 받은 인가 코드',
  })
  @IsString()
  code: string;
}
