import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { log } from 'src/common/logger.util';
import { ErrorCode } from 'src/common/error-code.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, lhd: string) {
    const user = await this.usersService.findBySocialId(dto.socialId);
    if (!user) {
      log.error(`${lhd} not found user. => socialId [${dto.socialId}]`);
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        code: ErrorCode.UNAUTHORIZED,
      });
    }

    const payload = { data: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1d',
    });

    return { accessToken: token };
  }

  async kakaoLogin(
    code: string,
  ): Promise<{ accessToken: string; isMember: boolean }> {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KAKAO_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    // 1. Kakao accessToken 요청
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId!,
        redirect_uri: redirectUri!,
        code,
        client_secret: clientSecret!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      },
    );

    const kakaoAccessToken = tokenRes.data.access_token;

    // 2. Kakao 사용자 정보 조회
    const userRes = await axios.post(
      'https://kapi.kakao.com/v2/user/me',
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${kakaoAccessToken}`,
        },
      },
    );

    const kakaoId = String(userRes.data.id);

    // 3. 유저 조회 및 없으면 생성
    const existingUser = await this.usersService.findBySocialId(kakaoId);
    let isMember = false;
    let userId: number;

    if (existingUser) {
      isMember = true;
      userId = existingUser.id;
    } else {
      const newUser = await this.usersService.createSocialUser(kakaoId);
      userId = newUser.id;
    }

    // 4. JWT 발급
    const accessToken = this.jwtService.sign(
      { data: userId },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1d',
      },
    );

    return { accessToken, isMember };
  }
}
