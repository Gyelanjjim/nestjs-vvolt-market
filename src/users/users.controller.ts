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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import { S3Service, S3SingleInterceptor } from 'src/common/service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { S3MulterFile } from 'src/common/types';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('signup')
  @UseGuards(JwtAuthGuard)
  async signup(@Request() req, @Body() dto: CreateUserDto) {
    await this.usersService.createUserData(req.user.id, dto);
    return { message: '회원가입 성공' };
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req, @Param('userId') userId: string) {
    const lhd = `getUserDetail -`;
    log.info(`${lhd} start.`);
    return this.usersService.findOne(req.user.id, +userId, lhd);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(S3SingleInterceptor('image'))
  async updateUser(
    @Request() req,
    @UploadedFile() file: S3MulterFile,
    @Body() dto: UpdateUserDto,
  ) {
    const lhd = `updateUser -`;
    log.info(`${lhd} start.`);
    if (file?.location) dto.userImage = file?.location;

    return this.usersService.updateUser(req.user.id, dto, lhd);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
