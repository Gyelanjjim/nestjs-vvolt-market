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

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @Post()
  // create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categoriesService.create(createCategoryDto);
  // }

  @Get()
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
