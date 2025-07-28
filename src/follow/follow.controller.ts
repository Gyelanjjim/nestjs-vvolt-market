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
    const result = await this.followService.toggleFollow(
      followerId,
      followeeId,
      lhd,
    );
    return {
      message: result.followed ? '팔로우 성공' : '언팔로우 성공',
    };
  }

  /**
   * @desc userId 가 팔로우하는 user 목록
   * @returns
   */
  @Get(':userId')
  async getFollowingList(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = `listFollowing -`;
    log.info(`${lhd} start.`);
    const followees = await this.followService.getFollowingList(userId);
    log.info(`${lhd} success.`);
    return followees;
  }
}
