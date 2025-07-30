import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: '안녕하세요 다있소입니다',
    description: '사용자 설명',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example:
      'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/fa29469964884ec18e215576ec96a51e',
    description: '사용자 프로필 이미지',
  })
  @IsOptional()
  @IsString()
  userImage?: string;
}
