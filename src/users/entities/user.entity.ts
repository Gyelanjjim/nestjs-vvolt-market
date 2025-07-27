import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SocialPlatform } from 'src/users/enums/social-platform.enum';

@Entity()
@Unique(['nickname'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  address: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ length: 50, nullable: true })
  user_image: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 50, nullable: true })
  description: string;

  @Column({ length: 50 })
  social_id: string;

  @Column({ type: 'enum', enum: SocialPlatform })
  social_platform_id: SocialPlatform;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
