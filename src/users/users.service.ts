import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SocialPlatform } from 'src/users/enums/social-platform.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createSocialUser(socialId: string): Promise<User> {
    const newUser = this.userRepository.create({
      social_id: socialId,
      social_platform_id: SocialPlatform.KAKAO,
      nickname: '',
      address: '',
      latitude: 0,
      longitude: 0,
      user_image: '',
      description: '',
    });

    return this.userRepository.save(newUser);
  }

  async createUserData(userId: number, dto: CreateUserDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('존재하지 않는 유저입니다');
    if (user.nickname) throw new BadRequestException('이미 가입된 유저입니다');

    await this.userRepository.update(userId, {
      nickname: dto.nickname,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findBySocialId(socialId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { social_id: socialId } });
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
