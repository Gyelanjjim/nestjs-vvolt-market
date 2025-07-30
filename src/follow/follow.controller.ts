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
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import { successResponse } from 'src/common/service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiTags('Follow')
  @Post(':followeeId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '팔로우/언팔로우 하기',
    description:
      '특정 사용자(followeeId)를 팔로우하거나 언팔로우합니다. 이미 팔로우 중이면 언팔로우로 처리됩니다.',
  })
  @ApiParam({
    name: 'followeeId',
    type: Number,
    required: true,
    description: '팔로우하거나 언팔로우할 사용자 ID',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: '팔로우 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success follow',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '언팔로우 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success unfollow',
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
    description: '팔로우할 사용자를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found user. followeeId [4]',
      },
    },
  })
  async toggleFollow(
    @Request() req,
    @Param('followeeId', ParseIntPipe) followeeId: number,
  ) {
    const lhd = `toggleFollow -`;
    const { id: followerId } = req.user;
    log.info(`${lhd} start.`);

    const data = await this.followService.toggleFollow(
      followerId,
      followeeId,
      lhd,
    );

    const message = data.followed ? `Success follow` : `Success unfollow`;

    log.info(`${lhd} success.`);
    return successResponse(undefined, message);
  }

  @ApiTags('Follow')
  @Get(':userId')
  @ApiOperation({
    summary: '팔로우 중인 사용자 목록',
    description: '특정 사용자(userId)가 팔로우 중인 사용자 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    required: true,
    description: '목록 조회할 특정 사용자 id',
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
        message: 'Not found user. userId [2]',
      },
    },
  })
  async getFollowingList(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = `listFollowing -`;
    log.info(`${lhd} start.`);

    const data = await this.followService.getFollowingList(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
