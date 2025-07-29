import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { log } from 'src/common/logger.util';
import { successResponse } from 'src/common/service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @desc 로그인
   * @returns
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const lhd = `signin -`;
    log.info(`${lhd} start.`);

    const data = await this.authService.login(dto, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 카카오 로그인
   * @returns
   */
  @Post('kakao-login')
  async kakaoLogin(@Body() body: { code: string }) {
    const lhd = `kakaoSignin -`;
    log.info(`${lhd} start.`);

    const data = await this.authService.kakaoLogin(body.code);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
