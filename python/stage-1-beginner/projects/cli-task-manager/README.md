# 实战项目：CLI 任务管理器

> *"The best way to learn is to build something."*

## 项目概述

构建一个命令行任务管理器，综合运用 Stage 1 的数据结构、函数、文件操作、异常处理、类型标注和模块化组织。

## 功能特性

- 添加新任务：标题、描述、优先级、截止日期。
- 编辑和更新任务。
- 标记任务完成或未完成。
- 删除任务。
- 按状态、优先级、关键词筛选。
- 输出任务统计：已完成、进行中、过期。
- 使用 JSON 文件持久化存储。
- 彩色终端输出和基础日志。

## 项目结构

```text
cli-task-manager/
├── README.md
├── src/
│   ├── main.py          # 主入口，argparse 命令解析
│   ├── task_manager.py  # 核心业务逻辑
│   ├── storage.py       # JSON 文件存储
│   ├── display.py       # 终端输出
│   └── models.py        # 数据模型
└── tasks.json           # 运行后自动生成
```

## 运行方式

```bash
cd projects/cli-task-manager

python src/main.py add --title "学习 Python" --priority high
python src/main.py add --title "写文档" --desc "完成 README" --due 2026-03-01

python src/main.py list
python src/main.py list --status pending
python src/main.py list --priority high

python src/main.py done 1
python src/main.py delete 2
python src/main.py stats
python src/main.py search "Python"
```

## 涵盖知识

| 知识点 | 应用场景 |
|--------|---------|
| `dict` / `list` | 任务数据存储 |
| 函数设计与模块化 | 各模块职责分离 |
| 文件操作与 JSON | 数据持久化 |
| 异常处理 | 输入验证、文件读写错误 |
| `pathlib` | 路径管理 |
| `argparse` | 命令行参数解析 |
| f-string | 格式化输出 |
| logging | 操作日志 |
| dataclass | 数据模型 |
| 类型标注 | 提高可读性 |

## 实现步骤

1. 定义数据模型 `models.py`。
2. 实现存储层 `storage.py`。
3. 实现核心逻辑 `task_manager.py`。
4. 实现终端显示 `display.py`。
5. 实现命令行入口 `main.py`。

## 验收清单

- [ ] 能添加、列出、完成和删除任务。
- [ ] 数据持久化到 JSON 文件。
- [ ] 支持按状态和优先级筛选。
- [ ] 支持关键词搜索。
- [ ] 有清晰的终端输出。
- [ ] 代码有类型标注。
- [ ] 处理了边界情况和异常。
