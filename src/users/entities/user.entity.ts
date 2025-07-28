import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { SocialPlatform } from 'src/users/enums/social-platform.enum';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Follow } from 'src/users/entities/follow.entity';

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

  @Column({ name: 'user_image', type: 'varchar', length: 512, nullable: true })
  userImage: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 50, nullable: true })
  description: string;

  @Column({ length: 50 })
  social_id: string;

  @Column({ type: 'enum', enum: SocialPlatform })
  social_platform_id: SocialPlatform;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followee: Follow[];

  @OneToMany(() => Follow, (follow) => follow.followee)
  followers: Follow[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
