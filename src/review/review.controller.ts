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
import { successResponse } from 'src/common/service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiTags('Review')
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '리뷰 등록',
    description: '구매한 상품에 대한 리뷰를 등록합니다.',
  })
  @ApiBody({ type: CreateReviewDto, description: '리뷰 등록에 필요한 정보' })
  @ApiResponse({
    status: 200,
    description: '리뷰 등록 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
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
    status: 409,
    description: '중복 리뷰 등록 불가',
    schema: {
      example: {
        code: 'E409',
        message: 'Duplicate review',
      },
    },
  })
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

  @ApiTags('Review')
  @Get(':userId')
  @ApiOperation({
    summary: '특정 사용자의 리뷰 목록',
    description: '특정 사용자(userId)의 리뷰 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    required: true,
    description: '수정할 특정 리뷰 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 목록 조회 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: [
          {
            reviewId: 1,
            productId: 4,
            buyerId: 1,
            reviewContent:
              '잔기스가 조금 있긴하지만 문제없이 잘 사용하고 있어요 감사해요',
            rate: 4,
            writerName: '계란찜2',
            writerImg:
              'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/1f2089dfbe4b46b7ad66760a91cae4b1',
          },
        ],
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
    description: '특정 사용자(reviewId)를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found user. userId [11]',
      },
    },
  })
  async getReviews(@Param('userId', ParseIntPipe) userId: number) {
    const lhd = `getReviews -`;
    log.info(`${lhd} start.`);

    const data = await this.reviewService.getReviewsByUser(userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  @ApiTags('Review')
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '리뷰 삭제',
    description: '특정 리뷰(reviewId)를 삭제합니다.',
  })
  @ApiParam({
    name: 'reviewId',
    type: Number,
    required: true,
    description: '삭제할 특정 리뷰 ID',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 삭제 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
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
    description: '리뷰(reviewId)를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found review. reviewId [30]',
      },
    },
  })
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
