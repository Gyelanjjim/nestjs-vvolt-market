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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';

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

    await this.reviewService.createReview(userId, createReviewDto, lhd);

    log.info(`${lhd} success.`);
    return { message: '리뷰 등록 성공' };
  }
}
