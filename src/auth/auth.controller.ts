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
import { LoginDto } from 'src/auth/dto/login.dto';
import { log } from 'src/common/logger.util';
import { successResponse } from 'src/common/service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/common.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao-login')
  @ApiOperation({
    summary: '카카오 로그인',
    description:
      '카카오 로그인 후 콜백된 code 로 액세스토큰과 가입여부를 응답받습니다',
  })
  @ApiBody({ type: LoginDto, description: '카카오 로그인에 필요한 정보' })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoxLCJpYXQiOjE3NTM4MDQzMzAAAAV4cCI6MTc1Mzg5MDczMH0.AUwWcw7i_VNHQAGHVG_J8ioDG9IZRjKmzEdx2naPLU4',
          isMember: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
    schema: {
      example: {
        code: 'E500',
        message: 'Internal Server Error',
      },
    },
  })
  async kakaoLogin(@Body() body: LoginDto) {
    const lhd = `kakaoSignin -`;
    log.info(`${lhd} start.`);

    const data = await this.authService.kakaoLogin(body.code);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
