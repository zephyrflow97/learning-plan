# 04. 韧性工程与 DevOps (Reliability Engineering)

> **🛡️ 核心理念**
>
> "Hope is not a strategy." —— Google SRE
>
> 传统的运维 (Ops) 是"出了事去修"。
> 现代的 SRE (Site Reliability Engineering) 是"把运维当软件工程来做"。
> 我们的目标不是由人来维护系统，而是由**系统来维护系统**。

---

## 1. 关键指标：SLO & SLA

*   **SLI (Indicator)**: 指标。例如：HTTP 请求成功率。
*   **SLO (Objective)**: 目标。例如：成功率 > 99.9%。(这是团队内部的底线)
*   **SLA (Agreement)**: 协议。例如：如果成功率 < 99.9%，我赔你钱。(这是对客户的承诺)

**Error Budget (错误预算)**:
如果你承诺 99.9% 的可用性，意味着你每个月有 **43 分钟** 的时间可以挂掉。
*   如果预算没用完：可以大胆发布新功能，甚至做混沌工程。
*   如果预算用完了：停止发布新功能，全力修 Bug，直到下个月。

---

## 2. 韧性设计模式 (Resilience Patterns)

如何让系统在部分组件挂掉时，依然能活下来？

### 2.1 熔断器 (Circuit Breaker)
家里的保险丝。
如果 `Service A` 调用 `Service B` 连续失败 5 次，熔断器跳闸。
后续的调用直接返回错误（或缓存数据），不再去请求 `Service B`。
**好处**: 防止 `Service B` 被重试流量彻底打死，也防止 `Service A` 被卡死。

### 2.2 限流 (Rate Limiting)
保护自己不被流量冲垮。
"每秒只允许 1000 个请求，多余的直接拒绝 (HTTP 429)。"
**算法**: 令牌桶 (Token Bucket)、漏桶 (Leaky Bucket)。

### 2.3 优雅降级 (Graceful Degradation)
当核心依赖挂了，系统应该"跛脚走路"，而不是"直接猝死"。
*   **例子**: 电商详情页。
    *   如果"推荐服务"挂了，就不显示推荐商品，但依然显示商品详情和购买按钮。
    *   用户体验下降，但核心业务（赚钱）不受影响。

---

## 3. DevOps 与 CI/CD

### Infrastructure as Code (IaC)
不要手动去服务器上敲命令装软件。
用代码描述你的基础设施 (Terraform, Dockerfile, K8s YAML)。
**好处**: 可版本控制、可复现、可审计。

### CI/CD Pipeline
*   **CI (Continuous Integration)**: 提交代码 -> 自动跑测试 -> 自动构建 Docker 镜像。
*   **CD (Continuous Deployment)**: 自动部署到测试环境 -> 人工审批 -> 自动部署到生产环境。

---

## 🎯 实战任务

在 **Ecommerce Platform** 项目中：
1.  **Docker 化**: 为所有微服务编写 `Dockerfile`。
2.  **编排**: 使用 `docker-compose` 一键启动整个环境。
3.  **韧性**: 在 API Gateway 实现简单的**限流**策略。
4.  **熔断**: 在服务调用处（如订单调库存）模拟网络超时，验证系统是否能正确处理（而不是卡死）。
