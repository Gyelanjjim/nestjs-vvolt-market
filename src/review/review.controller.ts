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
  HttpCode,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import { DeleteReviewDto } from 'src/review/dto/delete-review.dto';
import { successResponse } from 'src/common/service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * @desc 리뷰 등록
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    const lhd = `createReview -`;
    const userId = req.user.id;
    log.info(`${lhd} start.`);

    const data = await this.reviewService.createReview(
      userId,
      createReviewDto,
      lhd,
    );

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 특정 유저의 리뷰 목록
   * @returns
   */
  @Get(':userId')
  async getReviews(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = `getReviews -`;
    log.info(`${lhd} start.`);

    const data = await this.reviewService.getReviewsByUser(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  /**
   * @desc 리뷰 삭제
   * @returns
   */
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteReview(
    @Request() req,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    const lhd = `deleteReview -`;
    const userId = req.user.id;
    log.info(`${lhd} start.`);

    await this.reviewService.deleteReview(userId, reviewId, lhd);

    log.info(`${lhd} success.`);
    return successResponse();
  }
}
