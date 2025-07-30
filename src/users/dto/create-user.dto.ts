import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsLatitude, IsLongitude } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '다있소',
    description: '사용자 별명',
  })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    example: '서울시 송파구 송파대로',
    description: '사용자 주소',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 34.111111,
    description: '사용자 위치 - 위도',
  })
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    example: 127.111111,
    description: '사용자 위치 - 경도',
  })
  @IsLongitude()
  longitude: number;
}
