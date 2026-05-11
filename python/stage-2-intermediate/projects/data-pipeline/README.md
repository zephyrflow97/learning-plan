# 实战项目：数据处理管道 (Data Pipeline)

> 综合运用 Stage 2 全部知识点，构建一个 ETL 风格的数据处理管道工具。
> 这是一个能处理真实数据的工具——不是玩具项目。

---

## 项目目标

创建一个灵活的数据处理管道，支持：
- 从多种格式（CSV、JSON）提取数据
- 通过可组合的处理器链转换数据
- 将结果输出到不同格式
- 数据验证和错误处理
- 完整的日志和统计

## 项目架构

```
data-pipeline/
├── src/
│   ├── __init__.py           # 包标识
│   ├── pipeline.py           # 核心管道引擎
│   ├── extractors.py         # 数据提取器（CSV/JSON）
│   ├── transformers.py       # 数据转换器
│   ├── loaders.py            # 数据加载/输出
│   └── validators.py         # 数据验证
├── tests/
│   └── test_pipeline.py      # pytest 测试套件
└── README.md                 # 本文件
```

## 设计原则

### 管道模式 (Pipeline Pattern)

```
数据源 → Extractor → Transformer₁ → Transformer₂ → ... → Validator → Loader → 输出
```

每个组件都是独立的、可复用的、可测试的。

### 涉及知识点

| Stage 2 章节 | 在项目中的应用 |
|:---|:---|
| Ch01 OOP | 处理器基类、策略模式 |
| Ch02 魔术方法 | `__repr__`、`__or__` 管道运算符 |
| Ch03 生成器 | 流式处理、惰性求值 |
| Ch04 装饰器 | 日志、计时、注册 |
| Ch05 上下文管理器 | 文件操作、资源清理 |
| Ch06 类型标注 | 全项目类型安全 |
| Ch07 模块/包 | 项目结构组织 |
| Ch08 pytest | 完整测试套件 |
| Ch09 正则 | 数据清洗、格式验证 |

## 核心 API

### 1. 创建管道

```python
from src.pipeline import Pipeline
from src.extractors import CSVExtractor, JSONExtractor
from src.transformers import FilterTransform, MapTransform, SortTransform
from src.loaders import CSVLoader, JSONLoader
from src.validators import SchemaValidator

# 方式 1：链式调用
pipeline = (
    Pipeline("sales-analysis")
    .extract(CSVExtractor("data/sales.csv"))
    .transform(FilterTransform(lambda row: row["amount"] > 100))
    .transform(MapTransform(lambda row: {**row, "tax": float(row["amount"]) * 0.1}))
    .transform(SortTransform(key="amount", reverse=True))
    .validate(SchemaValidator({"amount": float, "product": str}))
    .load(JSONLoader("output/result.json"))
)

# 方式 2：管道运算符
pipeline = (
    CSVExtractor("data/sales.csv")
    | FilterTransform(lambda row: row["amount"] > 100)
    | SortTransform(key="amount", reverse=True)
    | JSONLoader("output/result.json")
)
```

### 2. 执行管道

```python
stats = pipeline.run()
print(stats)
# PipelineStats(input_rows=1000, output_rows=342,
#               errors=3, elapsed_time=0.45s)
```

### 3. 处理错误

```python
# 管道不会因单条数据错误而崩溃
# 错误会被记录，统计中可查看
print(f"错误数: {stats.errors}")
print(f"错误详情: {stats.error_details}")
```

## 扩展点

- 添加新的 Extractor（如 TOML、XML）
- 添加新的 Transformer（如 GroupBy、Aggregate）
- 添加新的 Loader（如 SQLite、Markdown 表格）
- 添加新的 Validator（如正则验证、范围验证）

## 如何运行

```bash
# 运行管道
python -m src.pipeline

# 运行测试
pytest tests/ -v

# 类型检查
mypy src/
```

## 示例数据

### CSV 输入 (`data/sales.csv`)

```csv
product,amount,date,region
Laptop,1200.00,2024-01-15,East
Phone,800.00,2024-01-16,West
Cable,15.00,2024-01-16,East
Monitor,450.00,2024-01-17,East
```

### JSON 输出 (`output/result.json`)

```json
[
  {"product": "Laptop", "amount": 1200.0, "date": "2024-01-15", "region": "East", "tax": 120.0},
  {"product": "Phone", "amount": 800.0, "date": "2024-01-16", "region": "West", "tax": 80.0},
  {"product": "Monitor", "amount": 450.0, "date": "2024-01-17", "region": "East", "tax": 45.0}
]
```

## 学习要点

1. **管道模式** — 数据像水一样流过管道，每个组件只做一件事
2. **生成器** — 用 `yield` 实现流式处理，即使 GB 级数据也不爆内存
3. **装饰器** — `@timer` 自动统计每步耗时
4. **类型标注** — 全项目类型安全，`mypy` 零报错
5. **pytest** — 每个组件都有独立测试

> 完成这个项目后，你已经具备了 Python 工程化的核心能力。
> 接下来进入 Stage 3，探索 Python 的高级黑魔法！
