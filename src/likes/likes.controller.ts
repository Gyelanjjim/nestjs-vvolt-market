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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiTags('Likes')
  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '좋아요 등록/삭제',
    description:
      '특정 상품(productId)에 대해 좋아요를 등록하거나 삭제합니다. 이미 좋아요 했다면 삭제 처리됩니다.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    required: true,
    description: '좋아요를 등록/삭제할 상품 ID',
    example: 78,
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 등록 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success create like',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 삭제 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success delete like',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        code: 'E401',
        message: 'Access token required',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '좋아요 등록/삭제할 상품을 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found product. productId [5]',
      },
    },
  })
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
  @ApiTags('Likes')
  @Get(':userId')
  @ApiOperation({
    summary: '좋아요 등록한 상품 목록 조회',
    description:
      '특정 사용자(userId)가 좋아요를 등록한 상품 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    required: true,
    description: '좋아요한 상품목록 조회할 사용자 ID',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: '목록 조회 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: [],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '목록 조회할 사용자를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found user. userId [4]',
      },
    },
  })
  async getLikesByUser(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = 'getLikeByUser -';
    log.info(`${lhd} start.`);

    const data = await this.likesService.getLikesByUserId(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
