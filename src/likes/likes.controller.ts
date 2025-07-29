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
import { successResponse } from 'src/common/service';

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

    const data = await this.likesService.toggleLike(userId, productId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(
      undefined,
      data === 'LIKED' ? `Success create like` : `Success delete like`,
    );
  }

  /**
   * @desc 좋아요한 상품 목록
   * @returns
   */
  @Get(':userId')
  async getLikesByUser(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = 'getLikeByUser -';
    log.info(`${lhd} start.`);

    const data = await this.likesService.getLikesByUserId(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
