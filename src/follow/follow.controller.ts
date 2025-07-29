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

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  /**
   * @desc followeeId 를 팔로우/언팔로우 하기
   * @returns
   */
  @Post(':followeeId')
  @UseGuards(JwtAuthGuard)
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

    log.info(`${lhd} success.`);
    return successResponse(
      null,
      data.followed ? `Success follow` : `Success unfollow`,
    );
  }

  /**
   * @desc userId 가 팔로우하는 user 목록
   * @returns
   */
  @Get(':userId')
  async getFollowingList(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = `listFollowing -`;
    log.info(`${lhd} start.`);

    const data = await this.followService.getFollowingList(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
