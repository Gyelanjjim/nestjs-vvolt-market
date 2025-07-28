import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ProductImage } from './product-image.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ProductStatus } from 'src/products/enums/product-status.enum';
import { Order } from 'src/orders/entities/order.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ length: 50 })
  location: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  seller: User;

  @Column({
    type: 'enum',
    enum: ProductStatus,
  })
  status: ProductStatus;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => Like, (like) => like.product)
  likes: Like[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
