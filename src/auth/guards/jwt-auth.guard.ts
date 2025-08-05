import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from 'src/common/error-code.enum';
import { log } from 'src/common/logger.util';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    const lhd = 'checkAuth -';

    if (!authHeader) {
      log.error(`${lhd} failed. not found header [authorization].`);
      throw new UnauthorizedException({
        message: 'Access token required',
        code: ErrorCode.UNAUTHORIZED,
      });
    }

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      log.error(
        `${lhd} failed. Bearer type required. authHeader [${authHeader}]`,
      );
      throw new UnauthorizedException({
        message: 'Invalid access token type',
        code: ErrorCode.UNAUTHORIZED,
      });
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      // log.debug(`${lhd} payload.data [${JSON.stringify(payload.data)}]`);

      const user = await this.usersService.getUserById(payload.data);
      if (!user) {
        log.error(`${lhd} failed. not found user by payload.data`);
        throw new UnauthorizedException({
          message: 'Invalid user',
          code: ErrorCode.UNAUTHORIZED,
        });
      }
      req.user = user;
      return true;
    } catch (err) {
      log.error(`${lhd} failed. invalid token. err [${JSON.stringify(err)}]`);
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: ErrorCode.UNAUTHORIZED,
      });
    }
  }
}
