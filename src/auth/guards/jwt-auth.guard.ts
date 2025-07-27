import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
      throw new UnauthorizedException('Access token required');
    }

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      log.error(`${lhd} failed. Bearer type required.`);
      throw new UnauthorizedException('Invalid access token type');
    }

    try {
      log.debug(`${lhd} JWT_SECRET [${this.configService.get('JWT_SECRET')}]`);
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      log.debug(`${lhd} payload.data [${JSON.stringify(payload.data)}]`);

      const user = await this.usersService.getUserById(payload.data);
      if (!user) throw new UnauthorizedException('Invalid user');
      req.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
