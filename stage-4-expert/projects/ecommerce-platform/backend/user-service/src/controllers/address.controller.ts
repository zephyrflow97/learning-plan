import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    logger.error('获取地址列表失败:', error);
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await prisma.address.create({
      data: {
        ...req.body,
        userId: req.user!.userId
      }
    });

    logger.info(`用户添加地址: ${req.user!.userId}`);

    res.status(201).json({
      success: true,
      message: '地址添加成功',
      data: { address }
    });
  } catch (error) {
    logger.error('添加地址失败:', error);
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const address = await prisma.address.updateMany({
      where: {
        id,
        userId: req.user!.userId
      },
      data: req.body
    });

    if (address.count === 0) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }

    res.json({
      success: true,
      message: '地址更新成功'
    });
  } catch (error) {
    logger.error('更新地址失败:', error);
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.address.deleteMany({
      where: {
        id,
        userId: req.user!.userId
      }
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }

    res.json({
      success: true,
      message: '地址删除成功'
    });
  } catch (error) {
    logger.error('删除地址失败:', error);
    next(error);
  }
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: req.user!.userId },
        data: { isDefault: false }
      }),
      prisma.address.updateMany({
        where: { id, userId: req.user!.userId },
        data: { isDefault: true }
      })
    ]);

    res.json({
      success: true,
      message: '默认地址设置成功'
    });
  } catch (error) {
    logger.error('设置默认地址失败:', error);
    next(error);
  }
};
