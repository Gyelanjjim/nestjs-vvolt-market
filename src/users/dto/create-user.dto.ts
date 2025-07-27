import { IsString, IsNotEmpty, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
