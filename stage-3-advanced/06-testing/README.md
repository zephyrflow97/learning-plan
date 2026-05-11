# 第 6 章：测试

本章将学习如何编写高质量的测试代码，包括单元测试、集成测试和端到端测试。

## 📚 本章目标

- ✅ 掌握 Jest 测试框架
- ✅ 编写单元测试和集成测试
- ✅ 使用 Mock 和 Stub
- ✅ 理解 TDD 开发流程
- ✅ 提高测试覆盖率

---

## 1. Jest 基础

> **🔬 The Metaphor: The Microscope (Unit Testing)**
> 单元测试就像是用**显微镜**观察细胞。
> 你把一个函数（细胞）从系统（组织）中剥离出来，放在载玻片上。
> 你给它各种刺激（输入），观察它的反应（输出）。
> 你不关心它周围的血管（数据库）或神经（网络），你只关心它自己是不是健康的。
> 如果细胞病了，显微镜能立刻告诉你。

### 1.1 简单测试

```typescript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

// sum.test.ts
import { sum } from './sum';

describe('sum 函数', () => {
  it('应该正确计算两个数的和', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });
  
  it('应该处理浮点数', () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
```

---

## 2. 测试异步代码

### 2.1 Promise 测试

```typescript
// api.ts
export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// api.test.ts
describe('fetchUser', () => {
  it('应该获取用户数据', async () => {
    const user = await fetchUser('123');
    expect(user).toHaveProperty('id', '123');
    expect(user).toHaveProperty('name');
  });
  
  it('应该处理错误', async () => {
    await expect(fetchUser('invalid')).rejects.toThrow();
  });
});
```

---

## 3. Mock 和 Stub

### 3.1 Mock 函数

> **🎭 The Metaphor: The Stunt Double (Mocking)**
> 在拍电影（测试）时，主角（被测函数）不能真的跳楼（连接真实数据库/发送真实扣款请求）。
> 这时候需要**替身演员** (Mock Object)。
> 替身长得像主角（接口一致），但跳楼时其实是跳到了气垫上（模拟行为）。
> 导演（测试框架）还可以事后问替身：“你刚才跳了几次？姿势对不对？”（断言调用次数和参数）。

```typescript
// userService.ts
export class UserService {
  constructor(private repository: UserRepository) {}
  
  async createUser(data: CreateUserData): Promise<User> {
    const user = await this.repository.save(data);
    return user;
  }
}

// userService.test.ts
describe('UserService', () => {
  it('应该创建用户', async () => {
    // 创建 mock 仓库
    const mockRepository = {
      save: jest.fn().mockResolvedValue({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com'
      })
    };
    
    const service = new UserService(mockRepository as any);
    const user = await service.createUser({
      name: 'Alice',
      email: 'alice@example.com'
    });
    
    expect(user.id).toBe('1');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

---

## 4. 测试覆盖率

### 4.1 配置覆盖率

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 5. TDD 实践

### 5.1 TDD 流程

```typescript
// 1. 编写测试（红色 - 失败）
describe('Calculator', () => {
  it('应该计算两个数的乘积', () => {
    const calculator = new Calculator();
    expect(calculator.multiply(3, 4)).toBe(12);
  });
});

// 2. 实现功能（绿色 - 通过）
class Calculator {
  multiply(a: number, b: number): number {
    return a * b;
  }
}

// 3. 重构（保持绿色）
class Calculator {
  multiply(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc * n, 1);
  }
}
```

---

## 6. 集成测试

> **🧩 The Metaphor: The Puzzle (Integration Testing)**
> 集成测试就像是**拼图**。
> 单元测试保证了每一块拼图的形状是对的。
> 但这不够。你还得把它们拼在一起，看看能不能**严丝合缝**。
> 也许两块拼图单独看都没问题，但拼在一起时，接口（边缘）对不上，或者颜色（数据）不协调。
> 集成测试就是检查这些**连接点**。

### 6.1 API 测试

```typescript
// app.test.ts
import request from 'supertest';
import { app } from './app';

describe('POST /api/users', () => {
  it('应该创建新用户', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'Alice',
        email: 'alice@example.com'
      })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Alice');
  });
  
  it('应该验证输入', async () => {
    await request(app)
      .post('/api/users')
      .send({
        name: ''  // 无效的name
      })
      .expect(400);
  });
});
```

---

## 7. 最佳实践

1. **AAA 模式** - Arrange, Act, Assert
2. **一个测试一个断言** - 保持测试简单
3. **测试行为而非实现** - 关注输出而非内部
4. **使用描述性名称** - 测试名称应说明测试内容
5. **独立性** - 测试之间不应相互依赖
6. **快速执行** - 单元测试应该快速运行

---

## 下一步

**下一章：** [练习题](../exercises/)

通过练习巩固所学知识！💪
