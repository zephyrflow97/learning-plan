/**
 * 订单实体
 * 
 * 使用 TypeORM 定义订单数据结构
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './OrderItem';

export enum OrderStatus {
  PENDING = 'pending',           // 待支付
  PAID = 'paid',                 // 已支付
  PROCESSING = 'processing',     // 处理中
  SHIPPED = 'shipped',           // 已发货
  DELIVERED = 'delivered',       // 已送达
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded',         // 已退款
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    postalCode?: string;
  };

  @Column({ nullable: true })
  paymentId?: string;

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
