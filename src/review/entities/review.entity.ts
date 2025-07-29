import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  contents: string;

  @Column({ type: 'int' })
  rating: number; // 예: 1~5점

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
