/**
 * Prisma 事务完整示例
 * 
 * 展示：顺序事务、交互式事务、隔离级别、错误处理
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// ==========================================
// 顺序事务（数组形式）
// ==========================================

async function sequentialTransactionExample() {
  console.log('\n━━━ 顺序事务示例 ━━━\n');

  try {
    // 场景：删除用户及其所有关联数据
    const userId = 1;

    const [deletedComments, deletedPosts, deletedProfile, deletedUser] = 
      await prisma.$transaction([
        // 1. 删除用户的评论
        prisma.comment.deleteMany({
          where: { authorId: userId },
        }),
        
        // 2. 删除用户的帖子
        prisma.post.deleteMany({
          where: { authorId: userId },
        }),
        
        // 3. 删除用户的资料
        prisma.profile.deleteMany({
          where: { userId },
        }),
        
        // 4. 删除用户
        prisma.user.delete({
          where: { id: userId },
        }),
      ]);

    console.log('✅ 顺序事务成功:', {
      deletedComments: deletedComments.count,
      deletedPosts: deletedPosts.count,
      deletedProfile: deletedProfile.count,
      deletedUser: deletedUser.email,
    });

    return { deletedUser };
  } catch (error) {
    console.error('❌ 顺序事务失败:', error);
    throw error;
  }
}

// ==========================================
// 交互式事务（回调形式）
// ==========================================

async function interactiveTransactionExample() {
  console.log('\n━━━ 交互式事务示例 ━━━\n');

  try {
    // 场景：转账操作
    const fromUserId = 1;
    const toUserId = 2;
    const amount = 100;

    const result = await prisma.$transaction(async (tx) => {
      console.log('[Transaction] 开始转账...');
      console.log(`[Transaction] 从用户 ${fromUserId} 转账 ${amount} 元到用户 ${toUserId}`);

      // 1. 检查发送者账户
      const sender = await tx.user.findUnique({
        where: { id: fromUserId },
        select: { id: true, name: true, email: true },
      });

      if (!sender) {
        throw new Error('发送者不存在');
      }

      console.log('[Transaction] 发送者:', sender.name);

      // 2. 检查接收者账户
      const receiver = await tx.user.findUnique({
        where: { id: toUserId },
        select: { id: true, name: true, email: true },
      });

      if (!receiver) {
        throw new Error('接收者不存在');
      }

      console.log('[Transaction] 接收者:', receiver.name);

      // 3. 创建转账记录（假设有 Transaction 表）
      // 注意：这里为了演示，我们使用 Post 表模拟转账记录
      const transferRecord = await tx.post.create({
        data: {
          title: `Transfer: ${amount} from ${sender.name} to ${receiver.name}`,
          content: `Amount: ${amount}`,
          published: true,
          authorId: fromUserId,
        },
      });

      console.log('[Transaction] 创建转账记录:', transferRecord.id);

      // 4. 如果需要，可以在这里检查余额
      // 这里我们假设转账总是成功（实际应用中需要检查余额）

      console.log('[Transaction] ✅ 转账成功');

      return {
        success: true,
        sender,
        receiver,
        amount,
        recordId: transferRecord.id,
      };
    }, {
      maxWait: 5000, // 获取事务锁的最大等待时间（毫秒）
      timeout: 10000, // 事务的最大执行时间（毫秒）
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // 隔离级别
    });

    console.log('✅ 交互式事务成功:', result);
    return result;
  } catch (error) {
    console.error('❌ 交互式事务失败:', error);
    throw error;
  }
}

// ==========================================
// 事务中的错误处理
// ==========================================

async function transactionErrorHandlingExample() {
  console.log('\n━━━ 事务错误处理示例 ━━━\n');

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建用户
      const user = await tx.user.create({
        data: {
          email: 'transaction-test@example.com',
          name: 'Transaction Test User',
        },
      });

      console.log('[Transaction] 创建用户:', user.id);

      // 2. 创建帖子
      const post = await tx.post.create({
        data: {
          title: 'Transaction Test Post',
          content: 'This should be rolled back',
          authorId: user.id,
        },
      });

      console.log('[Transaction] 创建帖子:', post.id);

      // 3. 模拟错误 - 尝试创建重复邮箱的用户
      try {
        await tx.user.create({
          data: {
            email: 'transaction-test@example.com', // 重复邮箱！
            name: 'Duplicate User',
          },
        });
      } catch (error) {
        console.log('[Transaction] ⚠️ 检测到错误，抛出异常以回滚整个事务');
        throw new Error('邮箱已存在，回滚整个事务');
      }

      return { user, post };
    });

    console.log('✅ 事务成功:', result);
    return result;
  } catch (error) {
    console.error('❌ 事务失败（预期行为）:', error.message);
    console.log('✅ 所有操作已回滚（用户和帖子都未创建）');

    // 验证回滚
    const user = await prisma.user.findUnique({
      where: { email: 'transaction-test@example.com' },
    });

    if (!user) {
      console.log('✅ 验证成功：用户未创建（事务已回滚）');
    }

    return { rolledBack: true };
  }
}

// ==========================================
// 隔离级别示例
// ==========================================

async function isolationLevelExamples() {
  console.log('\n━━━ 隔离级别示例 ━━━\n');

  // 1. Read Uncommitted（可能读到未提交的数据）
  try {
    await prisma.$transaction(
      async (tx) => {
        const users = await tx.user.findMany();
        console.log('Read Uncommitted: 可能读到其他未提交事务的数据');
        return users;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadUncommitted,
      }
    );
  } catch (error) {
    console.log('⚠️ PostgreSQL 不支持 Read Uncommitted，自动降级为 Read Committed');
  }

  // 2. Read Committed（默认，只能读到已提交的数据）
  await prisma.$transaction(
    async (tx) => {
      const users = await tx.user.findMany();
      console.log('Read Committed: 只能读到已提交的数据（PostgreSQL 默认）');
      return users;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    }
  );

  // 3. Repeatable Read（事务内多次读取同一数据结果相同）
  await prisma.$transaction(
    async (tx) => {
      const users1 = await tx.user.findMany();
      // 即使其他事务修改了数据，这里再次读取结果相同
      const users2 = await tx.user.findMany();
      console.log('Repeatable Read: 事务内多次读取结果一致');
      return { users1, users2 };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    }
  );

  // 4. Serializable（最严格，完全串行化执行）
  await prisma.$transaction(
    async (tx) => {
      const users = await tx.user.findMany();
      console.log('Serializable: 最严格的隔离级别，防止所有并发问题');
      return users;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  console.log('\n✅ 隔离级别说明:');
  console.log('  - Read Uncommitted: 可能脏读（PostgreSQL 不支持，降级为 Read Committed）');
  console.log('  - Read Committed: 防止脏读（PostgreSQL 默认）');
  console.log('  - Repeatable Read: 防止脏读 + 不可重复读');
  console.log('  - Serializable: 防止所有并发问题（性能最低）');
}

// ==========================================
// 实际业务场景：订单创建
// ==========================================

async function createOrderTransaction() {
  console.log('\n━━━ 实际业务场景：订单创建 ━━━\n');

  try {
    const userId = 1;
    const items = [
      { productId: 1, quantity: 2, price: 100 },
      { productId: 2, quantity: 1, price: 200 },
    ];

    const result = await prisma.$transaction(async (tx) => {
      console.log('[Order] 开始创建订单...');

      // 1. 验证用户
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      // 2. 计算总价
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // 3. 创建订单
      const order = await tx.order.create({
        data: {
          orderNo: `ORD-${Date.now()}`,
          total,
          status: 'PENDING',
        },
      });

      console.log('[Order] 创建订单:', order.orderNo, '总价:', total);

      // 4. 创建订单项（这里用 Post 模拟）
      const orderItems = await Promise.all(
        items.map((item, index) =>
          tx.post.create({
            data: {
              title: `Order ${order.orderNo} - Item ${index + 1}`,
              content: `Product ${item.productId}, Qty: ${item.quantity}, Price: ${item.price}`,
              published: true,
              authorId: userId,
            },
          })
        )
      );

      console.log(`[Order] 创建 ${orderItems.length} 个订单项`);

      // 5. 更新库存（这里省略，实际应用中需要）
      // await tx.product.update({ ... })

      console.log('[Order] ✅ 订单创建成功');

      return {
        order,
        items: orderItems,
        user,
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15000,
    });

    console.log('✅ 订单创建成功:', {
      orderNo: result.order.orderNo,
      total: result.order.total,
      itemsCount: result.items.length,
    });

    return result;
  } catch (error) {
    console.error('❌ 订单创建失败:', error);
    throw error;
  }
}

// ==========================================
// 运行所有示例
// ==========================================

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Prisma 事务完整示例                ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // await sequentialTransactionExample();
    await interactiveTransactionExample();
    await transactionErrorHandlingExample();
    await isolationLevelExamples();
    await createOrderTransaction();

    console.log('\n✅ 所有示例执行完成！\n');
  } catch (error) {
    console.error('❌ 执行出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export {
  sequentialTransactionExample,
  interactiveTransactionExample,
  transactionErrorHandlingExample,
  isolationLevelExamples,
  createOrderTransaction,
};
