/**
 * 商品数据模型
 * 
 * 使用 Mongoose 定义商品的数据结构和验证规则
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * 商品接口
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  specifications?: Map<string, string>;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 商品 Schema
 */
const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, '商品名称不能为空'],
      trim: true,
      maxlength: [200, '商品名称不能超过 200 字符'],
    },
    description: {
      type: String,
      required: [true, '商品描述不能为空'],
      maxlength: [2000, '商品描述不能超过 2000 字符'],
    },
    price: {
      type: Number,
      required: [true, '商品价格不能为空'],
      min: [0, '价格不能为负数'],
    },
    category: {
      type: String,
      required: [true, '商品分类不能为空'],
      index: true,
    },
    stock: {
      type: Number,
      required: [true, '库存数量不能为空'],
      min: [0, '库存不能为负数'],
      default: 0,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10;
        },
        message: '商品图片不能超过 10 张',
      },
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 创建复合索引以提高查询性能
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
