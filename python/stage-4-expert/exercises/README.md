# Stage 4 练习

以下 25 道练习覆盖 Stage 4 的核心知识点。建议按顺序完成，每道题都包含类型标注、日志记录和必要测试。

## FastAPI 练习（1-6）

1. **图书管理 API**：实现 `Book` 模型和 GET/POST/PUT/DELETE 端点，支持按作者、价格范围和出版年份筛选。
2. **依赖注入链**：实现 `verify_api_key`、`get_current_user` 和 `require_role(role)`。
3. **WebSocket 聊天**：支持多房间、加入/离开房间、广播消息和在线用户统计。
4. **文件上传 API**：支持 CSV / JSON 上传，限制文件大小为 10MB，返回行数、列数和列名摘要。
5. **API 版本管理**：让 `/api/v1/users` 和 `/api/v2/users` 共存。
6. **异步批量操作**：`POST /batch/process` 接收多个 URL，并发请求后返回结果汇总。

---

## 数据库练习（7-10）

7. **博客数据库设计**：用 SQLModel 设计 User、Post、Comment、Tag，并实现完整 CRUD。
8. **分页查询**：实现通用分页函数。

```python
async def paginate(session, model, page: int = 1, page_size: int = 20, order_by: str = "id"):
    """返回 items、total、page、page_size、total_pages。"""
```

9. **N+1 问题优化**：构造一个 N+1 查询，再分别用 `selectinload` 和 `joinedload` 优化。
10. **事务处理**：实现转账功能，确保余额扣减和增加是原子操作。

---

## Pandas 数据分析练习（11-16）

11. **数据清洗**：给定含缺失值、重复值和异常值的 CSV，完成清洗流水线。
12. **销售数据分析**：月度汇总、环比增长率、Top 10 产品、季节性分析。
13. **数据合并**：合并用户、订单、产品表，生成综合分析报告。
14. **时间序列分析**：对股票或气温数据做移动平均、季节性分解和趋势检测。
15. **透视表报表**：按部门和月份统计销售额、员工数和人均产出。
16. **数据可视化仪表盘**：用 Matplotlib 或 Plotly 创建至少 4 个图表。

---

## 机器学习练习（17-21）

17. **鸢尾花分类**：比较逻辑回归、决策树、随机森林和 SVM，用交叉验证评估。
18. **房价预测**：在 California Housing 数据集上比较线性回归和随机森林。
19. **特征工程 Pipeline**：构建缺失值处理、标准化、One-Hot 编码和模型训练流水线。
20. **过拟合诊断**：构建一个过拟合模型，再通过正则化、减少特征或增加数据改进。
21. **模型持久化**：用 `joblib` 保存模型，加载后在新数据上预测。

---

## Docker / 部署练习（22-25）

22. **Docker FastAPI**：为 FastAPI 项目编写多阶段 Dockerfile，目标镜像小于 200MB。
23. **Docker Compose 编排**：编排 FastAPI + PostgreSQL + Redis，包含 healthcheck 和 volume。
24. **GitHub Actions CI**：运行 ruff、mypy、pytest，并构建 Docker 镜像。
25. **配置管理**：用 `pydantic-settings` 实现 dev / staging / prod 多环境配置。
