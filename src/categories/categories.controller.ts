import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { log } from 'src/common/logger.util';
import { successResponse } from 'src/common/service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @Post()
  // create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categoriesService.create(createCategoryDto);
  // }

  @ApiTags('Categories')
  @Get()
  @ApiOperation({
    summary: '카테고리 목록',
    description: '카테고리 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        code: 'S200',
        message: 'Success',
        data: [
          {
            id: 1,
            name: '의류',
          },
          {
            id: 2,
            name: '전자기기',
          },
          {
            id: 3,
            name: '액세서리',
          },
          {
            id: 4,
            name: '기타',
          },
        ],
      },
    },
  })
  async findAll() {
    const lhd = 'listCategories -';
    log.info(`${lhd} start.`);

    const data = await this.categoriesService.findAll(lhd);

    log.info(`${lhd} success.`);
    return successResponse(data);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
  //   return this.categoriesService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(+id);
  // }
}
