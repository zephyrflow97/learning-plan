/**
 * 数据库连接和初始化
 * 
 * 使用 SQLite 作为数据存储
 * 提供 Promise 封装的数据库操作方法
 */

import sqlite3 from 'sqlite3';
import { Logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

/**
 * 数据库类
 * 封装 SQLite 操作，提供 Promise API
 */
class Database {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor() {
    // 确保数据目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'chat.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        Logger.error('数据库连接失败', err);
        process.exit(1);
      }
      Logger.info('数据库连接成功', { path: dbPath });
    });

    // 启用外键约束
    this.db.run('PRAGMA foreign_keys = ON');
    
    this.initialize();
  }

  /**
   * 获取数据库实例（单例模式）
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * 初始化数据库表结构
   */
  private async initialize(): Promise<void> {
    try {
      Logger.info('开始初始化数据库表结构...');

      // 创建用户表
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login_at DATETIME
        )
      `);

      // 创建聊天室表
      await this.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_by TEXT NOT NULL,
          is_private INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // 创建聊天室成员表
      await this.run(`
        CREATE TABLE IF NOT EXISTS room_members (
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (room_id, user_id),
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 创建消息表
      await this.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'text',
          is_edited INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          edited_at DATETIME,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 创建索引以提高查询性能
      await this.run('CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id)');

      Logger.info('数据库表结构初始化完成');
    } catch (error) {
      Logger.error('数据库初始化失败', error);
      throw error;
    }
  }

  /**
   * 执行 SQL 语句（INSERT, UPDATE, DELETE）
   */
  run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          Logger.error('SQL 执行失败', { sql, params, error: err });
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 查询单行数据
   */
  get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          Logger.error('SQL 查询失败', { sql, params, error: err });
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  /**
   * 查询多行数据
   */
  all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          Logger.error('SQL 查询失败', { sql, params, error: err });
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          Logger.error('关闭数据库连接失败', err);
          reject(err);
        } else {
          Logger.info('数据库连接已关闭');
          resolve();
        }
      });
    });
  }
}

// 导出数据库实例
export const db = Database.getInstance();
