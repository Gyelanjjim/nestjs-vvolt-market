import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import {
  S3Service,
  S3SingleInterceptor,
  successResponse,
} from 'src/common/service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { S3MulterFile } from 'src/common/types';
import { ErrorCode } from 'src/common/error-code.enum';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * @desc 회원가입
   * @returns
   */
  @Post('signup')
  @UseGuards(JwtAuthGuard)
  async signup(@Request() req, @Body() dto: CreateUserDto) {
    const lhd = `signup -`;
    log.info(`${lhd} start.`);

    await this.usersService.createUserData(req.user.id, dto, lhd);

    log.info(`${lhd} success.`);
    return successResponse();
  }

  /**
   * @desc userId 로 유저 조회
   * @returns
   */
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('userId', ParseIntPipe) userId: number) {
    const lhd = `getUserDetail -`;
    log.info(`${lhd} start.`);

    const data = await this.usersService.findOne(req.user.id, userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 내 정보 수정
   * @returns
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(S3SingleInterceptor('image'))
  async updateUser(
    @Request() req,
    @UploadedFile() file: S3MulterFile,
    @Body() dto: UpdateUserDto,
  ) {
    const lhd = `updateMe -`;
    log.info(`${lhd} start.`);
    if (file?.location) dto.userImage = file?.location;

    const data = await this.usersService.updateUser(req.user.id, dto, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
