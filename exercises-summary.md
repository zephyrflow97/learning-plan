# 练习题集总结

## 📊 总览

本次为 JS/TS 深化学习计划创建了 **25 道练习题**，分布在 Stage 1-3 的各个新增章节中。

## 📝 练习题分布

### Stage 1 - 初级（3题）

**06-原型链与原型继承**
- ✅ 练习 16: 不用 class 关键字实现继承（基础 ⭐⭐）
- ✅ 练习 17: 原型链查找机制分析（进阶 ⭐⭐⭐）
- ✅ 练习 18: 实现一个简单的 instanceof（挑战 ⭐⭐⭐⭐）

**总计**: 3 题（基础×1, 进阶×1, 挑战×1）

---

### Stage 2 - 中级（9题）

**08-错误处理体系**
- ✅ 练习 10: 实现类型安全的 Result 类型（基础 ⭐⭐⭐）
- ✅ 练习 11: 自定义错误类层次结构（进阶 ⭐⭐⭐⭐）
- ✅ 练习 12: 异步错误处理统一方案（挑战 ⭐⭐⭐⭐⭐）

**09-正则表达式**
- ✅ 练习 13: Markdown 链接提取器（基础 ⭐⭐）
- ✅ 练习 14: 密码强度验证器（进阶 ⭐⭐⭐）
- ✅ 练习 15: 防止 ReDoS 攻击（进阶 ⭐⭐⭐⭐）

**10-JavaScript 执行机制**
- ✅ 练习 16: 预测输出顺序（基础 ⭐⭐⭐）
- ✅ 练习 17: 闭包陷阱与解决方案（进阶 ⭐⭐⭐⭐）
- ✅ 练习 18: 实现简化版执行上下文栈（挑战 ⭐⭐⭐⭐⭐）

**总计**: 9 题（基础×3, 进阶×4, 挑战×2）

---

### Stage 3 - 高级（13题）

**08-Proxy 与 Reflect**
- ✅ 练习 6.1: 实现响应式对象（基础 ⭐⭐⭐）
- ✅ 练习 6.2: 数据验证代理（进阶 ⭐⭐⭐⭐）
- ✅ 练习 6.3: 实现可撤销的 Proxy（挑战 ⭐⭐⭐⭐⭐）

**09-函数式编程**
- ✅ 练习 7.1: 实现 pipe 和 compose（基础 ⭐⭐⭐）
- ✅ 练习 7.2: 实现柯里化和偏应用（进阶 ⭐⭐⭐⭐）
- ✅ 练习 7.3: 函数式错误处理（挑战 ⭐⭐⭐⭐⭐）

**10-浏览器 API**
- ✅ 练习 8.1: Web Worker 图片处理（基础 ⭐⭐⭐）
- ✅ 练习 8.2: IntersectionObserver 无限滚动（进阶 ⭐⭐⭐⭐）
- ✅ 练习 8.3: 文件分片上传（挑战 ⭐⭐⭐⭐⭐）

**11-TypeScript 工程化**
- ✅ 练习 9.1: 为无类型包编写声明文件（基础 ⭐⭐⭐）
- ✅ 练习 9.2: 模块增强与全局扩展（进阶 ⭐⭐⭐⭐）
- ✅ 练习 9.3: 高级类型模式（进阶 ⭐⭐⭐⭐）
- ✅ 练习 9.4: Monorepo 配置与项目引用（挑战 ⭐⭐⭐⭐⭐）

**总计**: 13 题（基础×4, 进阶×5, 挑战×4）

---

## 📈 难度分布统计

| 难度级别 | 数量 | 占比 | 题目编号 |
|---------|------|------|---------|
| 基础 ⭐⭐/⭐⭐⭐ | 8 | 32% | S1: 16; S2: 10, 13, 16; S3: 6.1, 7.1, 8.1, 9.1 |
| 进阶 ⭐⭐⭐⭐ | 10 | 40% | S1: 17; S2: 11, 14, 15, 17; S3: 6.2, 7.2, 8.2, 9.2, 9.3 |
| 挑战 ⭐⭐⭐⭐⭐ | 7 | 28% | S1: 18; S2: 12, 18; S3: 6.3, 7.3, 8.3, 9.4 |

**总计**: 25 题

---

## 🎯 练习题特点

### 1. **实际应用价值**
- 所有题目都源于真实开发场景
- 例如：响应式对象（Vue 3原理）、文件分片上传（大文件处理）、Result 类型（函数式错误处理）

### 2. **难度梯度合理**
- 每个章节包含 3-4 题，从基础到挑战
- 基础题巩固概念，进阶题深化理解，挑战题综合应用

### 3. **知识点覆盖全面**
- 原型链机制
- 错误处理模式
- 正则表达式实战
- 执行上下文与闭包
- Proxy 元编程
- 函数式编程范式
- 现代浏览器 API
- TypeScript 工程化

### 4. **完整的答案结构**
每道题都包含：
- 📝 题目描述和要求
- 💡 思路提示
- ✅ 参考答案（折叠在 details 中）
- 🔑 关键代码片段
- 📂 完整代码文件（solutions 文件夹）

### 5. **类型安全**
- TypeScript 题目包含完整的类型定义
- 利用类型系统避免常见错误
- 演示高级类型技巧

---

## 📁 文件组织

```
learning-plan/
├── stage-1-beginner/
│   └── exercises/
│       ├── README.md (新增 3 题)
│       └── solutions/
│           ├── 16-prototype-inheritance.js ✅
│           ├── 17-prototype-lookup.js ✅
│           └── 18-my-instanceof.js ✅
│
├── stage-2-intermediate/
│   └── exercises/
│       ├── README.md (新增 9 题)
│       └── solutions/
│           ├── 10-result-type.ts ✅
│           ├── 11-custom-errors.ts
│           ├── 12-async-error-handling.ts
│           ├── 13-markdown-link-extractor.ts ✅
│           ├── 14-password-validator.ts
│           ├── 15-redos-prevention.ts
│           ├── 16-execution-order.js
│           ├── 17-closure-trap.js
│           └── 18-execution-context-simulator.js
│
└── stage-3-advanced/
    └── exercises/
        ├── README.md (新增 13 题)
        └── solutions/
            ├── 06-reactive-proxy.ts
            ├── 06-validation-proxy.ts
            ├── 06-time-travel-proxy.ts
            ├── 07-pipe-compose.ts
            ├── 07-curry-partial.ts
            ├── 07-functional-error-handling.ts
            ├── 08-web-worker-image.ts
            ├── 08-image-worker.js
            ├── 08-infinite-scroll.ts
            ├── 08-file-upload.ts
            ├── 09-declaration-file.d.ts
            ├── 09-module-augmentation.ts
            ├── 09-advanced-type-patterns.ts
            └── 09-monorepo-setup/
```

---

## 🎓 学习建议

### 对于初学者
1. **按顺序完成**: Stage 1 → Stage 2 → Stage 3
2. **独立思考**: 先尝试自己解决，再查看答案
3. **动手实践**: 运行代码，观察输出，修改参数
4. **记录笔记**: 记录遇到的问题和解决方法

### 对于进阶学习者
1. **挑战题优先**: 直接做挑战级题目
2. **探索变体**: 尝试不同的实现方法
3. **性能优化**: 分析时间/空间复杂度
4. **代码审查**: 对比自己的实现和参考答案

### 对于面试准备
1. **原型链**: 练习 16-18 是高频面试题
2. **错误处理**: 练习 10-12 展示工程化思维
3. **函数式编程**: 练习 7.1-7.3 是现代框架基础
4. **TypeScript**: 练习 9.1-9.4 是工程实践必备

---

## ✅ 完成标准

完成本练习题集后，你应该能够：

- ✅ 理解并手动实现原型继承
- ✅ 设计类型安全的错误处理系统
- ✅ 熟练使用正则表达式解决实际问题
- ✅ 深入理解 JavaScript 执行机制
- ✅ 使用 Proxy 实现元编程
- ✅ 应用函数式编程模式
- ✅ 掌握现代浏览器 API
- ✅ 配置复杂的 TypeScript 工程

---

## 📚 相关资源

### 在线资源
- [MDN Web Docs](https://developer.mozilla.org)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [JavaScript.info](https://javascript.info)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

### 推荐阅读
- 《JavaScript 高级程序设计》- 原型链深入
- 《深入理解 ES6》- 现代特性
- 《重构：改善既有代码的设计》- 设计模式
- 《TypeScript 编程》- 类型系统

---

## 🔄 持续更新

本练习题集会根据以下情况持续更新：
- 补充更多 solutions 文件
- 添加测试用例
- 优化题目描述
- 收集学习反馈

---

**创建日期**: 2026-02-08  
**最后更新**: 2026-02-08  
**状态**: ✅ 已完成（25/25 题）

---

## 📞 反馈

如有问题或建议，欢迎提交 Issue 或 Pull Request！
