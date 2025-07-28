import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'src/follow/entities/follow.entity';
import { Repository } from 'typeorm';
import { log } from 'src/common/logger.util';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
  ) {}

  async toggleFollow(
    followerId: number,
    followeeId: number,
    lhd: string,
  ): Promise<{ followed: boolean }> {
    const existing = await this.followRepo.findOne({
      where: {
        follower: { id: followerId },
        followee: { id: followeeId },
      },
    });

    if (existing) {
      await this.followRepo.remove(existing);
      log.info(`${lhd} success. follow removed`);
      return { followed: false };
    } else {
      const newFollow = this.followRepo.create({
        follower: { id: followerId },
        followee: { id: followeeId },
      });
      await this.followRepo.save(newFollow);
      log.info(`${lhd} success. follow created`);
      return { followed: true };
    }
  }

  async getFollowingList(userId: number): Promise<Partial<User>[]> {
    const follows = await this.followRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.followee', 'followee')
      .where('f.follower = :userId', { userId })
      .getMany();

    return follows.map((f) => ({
      id: f.followee.id,
      nickname: f.followee.nickname,
      userImage: f.followee.userImage,
    }));
  }
}
