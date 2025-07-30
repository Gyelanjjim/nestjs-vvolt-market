import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // create(createCategoryDto: CreateCategoryDto) {
  //   return 'This action adds a new category';
  // }
  async findAll(lhd: string) {
    const categories = this.categoryRepo
      .createQueryBuilder('category')
      .getMany();

    return categories;
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} category`;
  // }
  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} category`;
  // }
}
