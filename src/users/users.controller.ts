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
  UseInterceptors,
  UploadedFile,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { log } from 'src/common/logger.util';
import {
  S3Service,
  S3SingleInterceptor,
  successResponse,
} from 'src/common/service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { S3MulterFile } from 'src/common/types';
import { ErrorCode } from 'src/common/error-code.enum';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiTags('Users')
  @Post('signup')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '회원가입',
    description: '카카오 로그인 인증 완료 후 회원 가입합니다.',
  })
  @ApiBody({ type: CreateUserDto, description: '회원가입에 필요한 정보' })
  @ApiResponse({
    status: 200,
    description: '회원 가입 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '특정 사용자(req.user.id)를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found user. userId [11]',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 가입한 유저는 중복 등록할 수 없음',
    schema: {
      example: {
        code: 'E409',
        message: 'Duplicated user.',
      },
    },
  })
  async signup(@Request() req, @Body() dto: CreateUserDto) {
    const lhd = `signup -`;
    log.info(`${lhd} start.`);

    await this.usersService.createUserData(req.user.id, dto, lhd);

    log.info(`${lhd} success.`);
    return successResponse();
  }

  @ApiTags('Users')
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '사용자 조회',
    description:
      '내 정보와 특정 사용자(userId) 정보, 내 상점 여부를 조회합니다',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    required: true,
    description: '조회할 사용자 ID',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: {
          isMyShop: true,
          myData: {
            writerId: 1,
            writerName: '계란찜2',
            writerImg:
              'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/1f2089dfbe4b46b7ad66760a91cae4b1',
            address: '서울시 송파구',
            latitude: '37.49790000',
            longitude: '127.02760000',
          },
          shopData: {
            sellerId: 1,
            address: '서울시 송파구',
            latitude: '37.49790000',
            longitude: '127.02760000',
            u_user_image:
              'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/1f2089dfbe4b46b7ad66760a91cae4b1',
            sellerName: '계란찜2',
            sellerIntro: '안녕하세요 계란찜입니다',
            social_id: '2826449058',
            social_platform_id: '1',
            sellerOpenDay: '2025-07-28T07:29:58.134Z',
            u_updated_at: '2025-07-29T07:11:30.000Z',
            sellerImg:
              'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/1f2089dfbe4b46b7ad66760a91cae4b1',
            productId: [4],
            starAVG: null,
            reviewNum: '0',
            onSaleNum: '1',
            soldOutNum: '0',
            likeNum: '1',
            followingNum: '0',
            followNum: '0',
            orderNum: '0',
          },
        },
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
    description: '특정 사용자(userId)를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found user. userId [3]',
      },
    },
  })
  async findOne(@Request() req, @Param('userId', ParseIntPipe) userId: number) {
    const lhd = `getUserDetail -`;
    log.info(`${lhd} start.`);

    const data = await this.usersService.findOne(req.user.id, userId, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  @ApiTags('Users')
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(S3SingleInterceptor('image'))
  @ApiBody({
    type: UpdateUserDto,
    description: '사용자 정보 수정에 필요한 정보',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: {
          id: 1,
          address: '서울시 송파구',
          latitude: '37.49790000',
          longitude: '127.02760000',
          userImage:
            'https://vvolt-market.s3.ap-northeast-2.amazonaws.com/uploads/20250730/1f2089dfbe4b46b7ad66760a91cae4b1',
          nickname: '계란찜2',
          description: '안녕하세요 계란찜입니다',
          social_id: '2826449058',
          social_platform_id: 1,
          created_at: '2025-07-28T07:29:58.134Z',
          updated_at: '2025-07-29T07:11:30.000Z',
        },
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
    description: '특정 사용자(userId)를 찾을 수 없음',
    schema: {
      example: {
        code: 'E404',
        message: 'Not found user. userId [3]',
      },
    },
  })
  async updateUser(
    @Request() req,
    @UploadedFile() file: S3MulterFile,
    @Body() dto: UpdateUserDto,
  ) {
    const lhd = `updateMe -`;
    log.info(`${lhd} start.`);
    if (file?.location) dto.userImage = file?.location;

    const data = await this.usersService.updateUser(req.user.id, dto, lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }
}
