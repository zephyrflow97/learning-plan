# 第 5 章：数据可视化 — 让数据模式显形

> 数据可视化不是为了让图表好看，而是为了让数据中的模式、异常和趋势变得可见。

## 📖 本章内容

- [1. 工具选择](#1-工具选择)
- [2. Matplotlib](#2-matplotlib)
- [3. Plotly](#3-plotly)
- [4. Seaborn](#4-seaborn)
- [5. 图表选择指南](#5-图表选择指南)
- [最佳实践](#最佳实践)
- [练习题](#练习题)
- [参考资源](#参考资源)

---

## 1. 工具选择

| 工具 | 定位 | 适合场景 |
|------|------|---------|
| Matplotlib | 底层基础 | 出版级静态图、完全控制 |
| Seaborn | 统计图表 | 分布、关系、分类对比 |
| Plotly | 交互式图表 | Web 仪表盘、探索分析 |
| Bokeh | Web 交互 | 大数据和流式可视化 |

---

## 2. Matplotlib

推荐使用面向对象接口：`fig, ax = plt.subplots()`。

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

fig, axes = plt.subplots(2, 2, figsize=(12, 8))

axes[0, 0].plot(x, y)
axes[0, 0].set_title("折线图")

axes[0, 1].bar(["A", "B", "C"], [10, 20, 15])
axes[0, 1].set_title("柱状图")

np.random.seed(42)
axes[1, 0].scatter(np.random.randn(100), np.random.randn(100), alpha=0.7)
axes[1, 0].set_title("散点图")

axes[1, 1].hist(np.random.randn(1000), bins=30)
axes[1, 1].set_title("直方图")

fig.tight_layout()
plt.show()
```

---

## 3. Plotly

Plotly 默认支持缩放、悬停提示和导出，适合交互式探索。

```python
import plotly.express as px

df = px.data.gapminder()
china = df[df["country"] == "China"]

fig = px.line(
    china,
    x="year",
    y="gdpPercap",
    title="中国人均 GDP 变化",
)
fig.show()

fig = px.scatter(
    df[df["year"] == 2007],
    x="gdpPercap",
    y="lifeExp",
    size="pop",
    color="continent",
    hover_name="country",
    log_x=True,
)
fig.show()
```

---

## 4. Seaborn

Seaborn 封装了常用统计图表，适合快速理解变量之间的关系。

```python
import matplotlib.pyplot as plt
import seaborn as sns

tips = sns.load_dataset("tips")

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
sns.histplot(tips["total_bill"], kde=True, ax=axes[0])
sns.boxplot(x="day", y="total_bill", data=tips, ax=axes[1])
sns.violinplot(x="day", y="tip", data=tips, ax=axes[2])
plt.show()

sns.lmplot(x="total_bill", y="tip", hue="smoker", data=tips)
plt.show()
```

---

## 5. 图表选择指南

| 目标 | 推荐图表 |
|------|---------|
| 时间趋势 | 折线图 |
| 类别对比 | 柱状图 |
| 分布 | 直方图、箱线图、小提琴图 |
| 两变量关系 | 散点图、回归图 |
| 多变量相关 | 热力图、散点矩阵 |
| 占比 | 堆叠柱状图，谨慎使用饼图 |

---

## 最佳实践

- 先问清楚“这张图要回答什么问题”。
- 轴标签、标题、图例必须清晰。
- 避免不必要的装饰和 3D 效果。
- 使用色盲友好的配色。
- 探索分析用 Plotly，报告和论文图优先 Matplotlib / Seaborn。

## 练习题

1. 对销售数据绘制月度趋势折线图。
2. 对产品分类绘制销售额柱状图。
3. 对多个数值列绘制相关性热力图。

---

## 参考资源

- [Matplotlib 官方文档](https://matplotlib.org/stable/)
- [Seaborn 官方文档](https://seaborn.pydata.org/)
- [Plotly Python 文档](https://plotly.com/python/)
