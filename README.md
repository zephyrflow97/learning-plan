# JavaScript 和 TypeScript 学习计划

欢迎来到 JavaScript 和 TypeScript 从入门到大师的完整学习路径！本学习计划采用项目驱动的方式，通过实际项目帮助你系统化地掌握现代 Web 开发技能。

## 🎯 学习目标

本学习计划旨在帮助具有其他编程语言基础的开发者：
- 掌握 JavaScript 核心语法和现代特性
- 精通 TypeScript 类型系统和高级特性
- 学习前端和后端开发技能
- 理解架构设计和最佳实践
- **掌握可观测性、防御性编程和系统韧性工程（新增）**
- **建立应对熵增和复杂度的架构思维（新增）**
- 能够独立开发生产级应用

## 👥 适合人群

- 有至少一门编程语言的基础经验
- 理解基本编程概念（变量、函数、循环、条件语句）
- 熟悉面向对象或函数式编程基本概念
- 希望通过实际项目学习和巩固知识
- **希望从"写代码"进阶到"设计系统"的工程师**

## 📚 学习路径

本学习计划分为五个阶段，每个阶段都包含理论讲解、代码示例和实战项目：

### 阶段 1：入门级 - JavaScript 基础
**学习时长：** 3-4 周  
**学习目标：** 掌握 JavaScript 基础语法和核心概念

**核心内容：**
- JavaScript 基础语法
- 函数和作用域
- 对象和数组操作
- 异步编程入门
- DOM 操作基础
- **原型链与原型继承（新增）**：理解 JavaScript 对象系统的底层机制

**实战项目：** [待办事项应用](./stage-1-beginner/projects/todo-app/)

[📖 开始学习阶段 1](./stage-1-beginner/)

---

### 阶段 2：进阶级 - TypeScript 入门 & 可观测性
**学习时长：** 4-5 周  
**学习目标：** 掌握 TypeScript 基础、Node.js 开发及**结构化日志**

**核心内容：**
- TypeScript 基础
- ES6+ 现代特性
- Node.js 基础 & Express
- 异步编程进阶
- **可观测性基础 (Observability Basics)**：结构化日志 (Pino)、请求上下文 (Context)、错误清洗
- **错误处理体系（新增）**：Error 类型体系、自定义错误、Result 模式
- **正则表达式（新增）**：模式匹配、捕获组、实战应用
- **JavaScript 执行机制深入（新增）**：执行上下文、词法环境、闭包原理

**实战项目：** [任务管理 API](./stage-2-intermediate/projects/task-api/) (需集成日志系统)

[📖 开始学习阶段 2](./stage-2-intermediate/)

---

### 阶段 3：高级 - 深入 TypeScript、架构与重构
**学习时长：** 6-8 周  
**学习目标：** 掌握高级特性、架构设计及**遗留代码治理**

**核心内容：**
- TypeScript 高级类型
- 装饰器和元编程
- 设计模式
- 架构和最佳实践
- 性能优化
- 测试
- **重构与遗留代码 (Refactoring Legacy Code)**：代码异味、绞杀植物模式、防御性编程
- **Proxy 与 Reflect（新增）**：元编程、13 种 Trap、响应式系统原理
- **函数式编程范式（新增）**：纯函数、组合、柯里化、不可变数据
- **现代浏览器 API（新增）**：Web Workers、Observer API、File API、模块化
- **TypeScript 工程化进阶（新增）**：声明文件、Project References、构建工具

**实战项目：** [实时聊天应用](./stage-3-advanced/projects/realtime-chat/) (需包含审计日志) + [ts-toolkit 工具库](./stage-3-advanced/projects/ts-toolkit/)（新增）

[📖 开始学习阶段 3](./stage-3-advanced/)

---

### 阶段 4：大师级 - 生产级应用与韧性工程
**学习时长：** 6-8 周  
**学习目标：** 掌握企业级开发、系统设计及**高可用架构**

**核心内容：**
- 微服务架构
- 数据库和 ORM
- 安全
- **韧性工程 (Reliability Engineering)**：DevOps、SRE、熔断、限流、混沌工程
- 前端高级
- 系统设计

**实战项目：** [全栈电商平台](./stage-4-expert/projects/ecommerce-platform/)

[📖 开始学习阶段 4](./stage-4-expert/)

---

### 阶段 5：哲学级 - 编程之道 (The Tao of Coding)
**学习时长：** 终身  
**学习目标：** 建立上帝视角，掌握对抗熵增的元知识

**核心内容：**
- **Web 演进史**：从图书馆到操作系统
- **复杂度的本质**：对抗热力学第二定律
- **范式战争**：命令式 vs 声明式
- **抽象泄漏定律**：地图不是疆域
- **权衡的艺术**：没有银弹
- **事故管理 (Incident Management)**：从失败中学习

[📖 开始学习阶段 5](./stage-5-philosophy/)

---

## 🗂️ 目录结构

```
learning-plan/
├── README.md                          # 本文件
├── PROGRESS.md                        # 进度追踪
├── JS_TS_DEEP_DIVE_PLAN.md            # 深化学习构建计划
├── stage-1-beginner/
│   ├── 01-javascript-basics/
│   ├── 02-functions-scope/
│   ├── 03-objects-arrays/
│   ├── 04-async-basics/
│   ├── 05-dom-basics/
│   ├── 06-prototype-inheritance/      # [NEW] 原型链与原型继承
│   ├── projects/todo-app/
│   └── exercises/
├── stage-2-intermediate/
│   ├── 01-typescript-basics/
│   ├── 02-es6-features/
│   ├── 03-nodejs-basics/
│   ├── 04-async-advanced/
│   ├── 05-observability-basics/       # [NEW] 可观测性基础
│   ├── 08-error-handling/             # [NEW] 错误处理体系
│   ├── 09-regexp/                     # [NEW] 正则表达式
│   ├── 10-js-execution-model/         # [NEW] JavaScript 执行机制深入
│   ├── projects/task-api/
│   └── exercises/
├── stage-3-advanced/
│   ├── 01-typescript-advanced/
│   ├── 02-decorators-metaprogramming/
│   ├── 03-design-patterns/
│   ├── 04-architecture-best-practices/
│   ├── 05-performance-optimization/
│   ├── 06-testing/
│   ├── 07-refactoring-legacy/         # [NEW] 重构与遗留代码
│   ├── 08-proxy-reflect/              # [NEW] Proxy 与 Reflect
│   ├── 09-functional-programming/     # [NEW] 函数式编程范式
│   ├── 10-browser-apis/               # [NEW] 现代浏览器 API
│   ├── 11-ts-engineering/             # [NEW] TypeScript 工程化进阶
│   ├── projects/realtime-chat/
│   ├── projects/ts-toolkit/           # [NEW] TypeScript 工具库项目
│   └── exercises/
├── stage-4-expert/
│   ├── ...
│   └── 04-reliability-engineering/    # [RENAME] 韧性工程与 DevOps
├── stage-5-philosophy/
│   ├── ...
│   └── 06-incident-management/        # [NEW] 事故管理
└── ...
```

## 🚀 快速开始

1. **环境准备**
   - 安装 Node.js, VS Code, Git
2. **开始学习**
   - 阅读 [快速开始指南](./getting-started.md)
   - 从 [阶段 1](./stage-1-beginner/) 开始

## 📄 许可证

MIT License
