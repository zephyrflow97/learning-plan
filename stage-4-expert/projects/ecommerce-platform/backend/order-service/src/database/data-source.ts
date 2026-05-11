/**
 * TypeORM 数据源配置
 */

import { DataSource } from 'typeorm';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce_orders',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Order, OrderItem],
  migrations: [],
  subscribers: [],
});
