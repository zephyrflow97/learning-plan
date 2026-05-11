# Project References 配置示例

本目录包含一个完整的 Monorepo Project References 配置示例。

## 目录结构

```
04-project-references/
├── README.md                    ← 你正在看的文件
├── tsconfig.root.json           ← 根配置：聚合所有子项目
├── tsconfig.base.json           ← 基础配置：所有子项目继承
├── packages/
│   ├── shared/
│   │   ├── tsconfig.json        ← shared 包配置（无依赖）
│   │   └── src/
│   │       └── index.ts         ← 共享类型和工具函数
│   ├── api/
│   │   ├── tsconfig.json        ← api 包配置（依赖 shared）
│   │   └── src/
│   │       └── index.ts         ← API 服务入口
│   └── web/
│       ├── tsconfig.json        ← web 包配置（依赖 shared）
│       └── src/
│           └── index.ts         ← Web 应用入口
```

## 依赖关系

```
shared ← api
shared ← web
```

`shared` 是基础包，被 `api` 和 `web` 同时依赖。

## 关键概念

### 1. `composite: true`

每个子项目必须开启 `composite`，这会：
- 强制 `declaration: true`（生成 .d.ts）
- 生成 `.tsbuildinfo`（增量编译缓存）
- 要求 `rootDir` 明确指定

### 2. `references`

依赖方通过 `references` 数组指向被依赖的子项目：
```json
{ "references": [{ "path": "../shared" }] }
```

### 3. `tsc --build`

使用 `tsc --build`（而非普通 `tsc`）编译：
```bash
tsc --build tsconfig.root.json           # 增量编译
tsc --build tsconfig.root.json --watch   # 监听模式
tsc --build tsconfig.root.json --clean   # 清理构建产物
tsc --build tsconfig.root.json --force   # 忽略缓存，全量编译
```

### 4. 增量编译的收益

- 只重新编译**有变化的子项目**及其依赖者
- 编译结果缓存在 `.tsbuildinfo` 文件中
- 大型 Monorepo 中可以将编译时间从分钟级降到秒级

## 配合 Monorepo 工具

| 工具 | 集成方式 |
|------|---------|
| **npm workspaces** | `package.json` 的 `workspaces` 字段 |
| **pnpm workspaces** | `pnpm-workspace.yaml` |
| **Turborepo** | `turbo.json` 定义 `build` 管线，自动利用 Project References |
| **Nx** | `project.json` + `@nx/js` 插件 |
