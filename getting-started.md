# 快速开始指南

欢迎开始你的 JavaScript 和 TypeScript 学习之旅！本指南将帮助你快速搭建学习环境，了解学习流程，并开始第一个阶段的学习。

## 📋 前置要求

在开始学习之前，请确保你：

- ✅ 有至少一门编程语言的基础经验
- ✅ 理解基本编程概念（变量、函数、循环、条件语句）
- ✅ 熟悉命令行基本操作
- ✅ 有学习的热情和耐心

## 🛠️ 环境搭建

### 1. 安装 Node.js

Node.js 是 JavaScript 的运行时环境，我们需要它来运行 JavaScript 代码和管理项目依赖。

**下载和安装：**
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS（长期支持）版本
3. 运行安装程序，按照提示完成安装

**验证安装：**
```bash
# 检查 Node.js 版本
node --version
# 应该显示类似：v18.17.0

# 检查 npm 版本
npm --version
# 应该显示类似：9.6.7
```

### 2. 安装代码编辑器

推荐使用 Visual Studio Code（VS Code），它是目前最流行的代码编辑器。

**下载和安装：**
1. 访问 [VS Code 官网](https://code.visualstudio.com/)
2. 下载适合你操作系统的版本
3. 运行安装程序，按照提示完成安装

**推荐安装的 VS Code 插件：**
- **ESLint** - JavaScript 代码检查工具
- **Prettier** - 代码格式化工具
- **JavaScript (ES6) code snippets** - JavaScript 代码片段
- **TypeScript Vue Plugin (Volar)** - TypeScript 支持
- **Path Intellisense** - 路径自动补全
- **Auto Rename Tag** - 自动重命名标签
- **Live Server** - 本地开发服务器

**安装插件方法：**
1. 打开 VS Code
2. 点击左侧的扩展图标（或按 `Ctrl+Shift+X` / `Cmd+Shift+X`）
3. 搜索插件名称
4. 点击"安装"按钮

### 3. 安装 Git（可选但推荐）

Git 是版本控制工具，可以帮助你管理代码版本和协作开发。

**下载和安装：**
1. 访问 [Git 官网](https://git-scm.com/)
2. 下载适合你操作系统的版本
3. 运行安装程序，按照提示完成安装

**验证安装：**
```bash
git --version
# 应该显示类似：git version 2.40.0
```

**配置 Git（首次使用）：**
```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 4. 创建学习工作区

创建一个专门的文件夹来存放你的学习项目：

```bash
# 创建学习目录
mkdir js-ts-learning
cd js-ts-learning

# 创建各阶段的目录
mkdir stage-1-beginner
mkdir stage-2-intermediate
mkdir stage-3-advanced
mkdir stage-4-master
```

## 📚 学习流程

### 第一步：了解学习路径

阅读 [README.md](./README.md) 了解完整的学习路径和四个阶段的内容概览。

### 第二步：阅读学习方法

阅读 [learning-guide.md](./learning-guide.md) 了解如何高效学习和使用本教程。

### 第三步：开始阶段 1

从 [阶段 1：入门级 - JavaScript 基础](./stage-1-beginner/) 开始学习。

### 学习节奏建议

**每日学习计划：**
- 理论学习：1-2 小时
- 代码实践：1-2 小时
- 练习和复习：30 分钟 - 1 小时

**每周学习计划：**
- 学习新知识点：3-4 天
- 项目实践：2-3 天
- 复习和总结：1 天

**阶段学习时长：**
- 阶段 1（入门级）：2-3 周
- 阶段 2（进阶级）：3-4 周
- 阶段 3（高级）：4-5 周
- 阶段 4（大师级）：6-8 周

## 🎯 学习方法

### 1. 主动学习

- **不要只是阅读代码**，要亲自动手写
- **尝试修改示例代码**，观察结果的变化
- **提出问题**，思考为什么这样设计
- **做笔记**，记录重要概念和心得

### 2. 项目驱动

- **每个知识点都在项目中应用**
- **先理解需求，再看实现**
- **尝试自己实现，再对比参考代码**
- **完成项目后，思考如何改进**

### 3. 循序渐进

- **不要跳过基础内容**
- **确保理解当前内容再继续**
- **遇到困难时，回顾前面的内容**
- **定期复习已学知识**

### 4. 实践为主

- **每天都要写代码**
- **完成所有练习题**
- **尝试解决实际问题**
- **参与开源项目（进阶后）**

## 🔧 开发环境配置

### VS Code 配置

创建 `.vscode/settings.json` 文件，配置编辑器：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### 创建第一个 JavaScript 文件

1. 在 VS Code 中打开你的学习目录
2. 创建一个新文件 `hello.js`
3. 输入以下代码：

```javascript
// 你的第一个 JavaScript 程序
console.log('Hello, JavaScript!');

// 定义一个函数
function greet(name) {
  return `Hello, ${name}!`;
}

// 调用函数
console.log(greet('World'));
```

4. 在终端中运行：

```bash
node hello.js
```

你应该看到输出：
```
Hello, JavaScript!
Hello, World!
```

恭喜！你已经成功运行了第一个 JavaScript 程序！🎉

## 📖 推荐阅读顺序

1. **阶段 1 - JavaScript 基础**
   - [01-javascript-basics](./stage-1-beginner/01-javascript-basics/) - JavaScript 基础语法
   - [02-functions-scope](./stage-1-beginner/02-functions-scope/) - 函数和作用域
   - [03-objects-arrays](./stage-1-beginner/03-objects-arrays/) - 对象和数组
   - [04-async-basics](./stage-1-beginner/04-async-basics/) - 异步编程入门
   - [05-dom-basics](./stage-1-beginner/05-dom-basics/) - DOM 操作基础
   - [项目：待办事项应用](./stage-1-beginner/projects/todo-app/)

2. **完成阶段 1 后**
   - 完成所有练习题
   - 通过自我评估
   - 进入阶段 2

## 🆘 遇到问题？

### 常见问题

**Q: Node.js 安装后无法使用？**
A: 重启终端或电脑，确保环境变量已生效。

**Q: VS Code 插件安装失败？**
A: 检查网络连接，或尝试使用 VPN。

**Q: 代码运行出错？**
A: 仔细阅读错误信息，检查代码拼写和语法。

**Q: 学习进度慢怎么办？**
A: 不要着急，每个人的学习节奏不同，重要的是理解而不是速度。

### 获取帮助

1. **查看 FAQ** - [常见问题解答](./teaching-support/faq.md)
2. **调试指南** - [调试和问题排查指南](./teaching-support/debugging-guide.md)
3. **官方文档** - [MDN Web Docs](https://developer.mozilla.org/)
4. **社区讨论** - [Stack Overflow](https://stackoverflow.com/)

## ✅ 准备检查清单

在开始学习之前，确保你已经：

- [ ] 安装了 Node.js 并验证版本
- [ ] 安装了 VS Code 和推荐插件
- [ ] 创建了学习工作区目录
- [ ] 成功运行了第一个 JavaScript 程序
- [ ] 阅读了学习方法和建议
- [ ] 了解了学习路径和阶段划分

## 🚀 开始学习

一切准备就绪！现在你可以：

**[👉 前往阶段 1：入门级 - JavaScript 基础](./stage-1-beginner/)**

记住：
- 保持耐心和好奇心
- 每天坚持学习和实践
- 不要害怕犯错，错误是最好的老师
- 享受学习的过程

祝你学习愉快！🎉
