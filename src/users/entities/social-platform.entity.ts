import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('social_platform')
export class SocialPlatform {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  // 해당 플랫폼을 사용하는 사용자 목록 (역방향 연결, 선택사항)
  @OneToMany(() => User, (user) => user.socialPlatform)
  users: User[];
}
