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
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  /**
   * @desc 좋아요 등록/삭제
   * @returns
   */
  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const lhd = 'toggleLike -';
    const userId = req.user.id;
    log.info(`${lhd} start.`);
    const result = await this.likesService.toggleLike(userId, productId, lhd);

    return {
      message: result === 'LIKED' ? '좋아요 등록 완료' : '좋아요 취소 완료',
    };
  }

  /**
   * @desc 좋아요한 상품 목록
   * @returns
   */
  @Get(':userId')
  async getLikesByUser(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = 'getLikeByUser -';
    log.info(`${lhd} start.`);

    const likes = await this.likesService.getLikesByUserId(userId);

    log.info(`${lhd} success.`);
    return { Likes_list: likes };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.likesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
  //   return this.likesService.update(+id, updateLikeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.likesService.remove(+id);
  // }
}
