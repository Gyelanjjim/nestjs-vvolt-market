import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  socialId: string;
}
