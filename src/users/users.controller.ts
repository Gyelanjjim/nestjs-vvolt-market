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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
