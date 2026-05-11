# 第 3 章：安全

## 📋 本章概述

应用安全是生产环境的第一要务。本章将学习认证和授权机制、密码安全、加密技术、常见安全漏洞防护以及安全审计等关键知识，帮助你构建安全可靠的应用系统。

### 学习目标

完成本章后，你将能够：

- ✅ 实现 JWT、Session、OAuth2.0 等认证机制
- ✅ 设计和实现权限控制系统（RBAC、ABAC）
- ✅ 掌握密码安全最佳实践
- ✅ 理解和应用加密技术
- ✅ 防护常见安全漏洞（SQL 注入、XSS、CSRF）
- ✅ 配置安全 HTTP 头部
- ✅ 进行安全审计和漏洞扫描

### 前置知识

- ✅ 熟练掌握 TypeScript 和 Node.js
- ✅ 理解 HTTP 协议和 Cookie/Session
- ✅ 了解基本的加密概念
- ✅ 掌握数据库操作

---

## 1. 认证机制

### 1.1 认证方式对比

| 认证方式 | 优势 | 劣势 | 适用场景 |
|---------|------|------|----------|
| **Session** | 服务端控制，可随时撤销 | 需要服务端存储，不适合分布式 | 传统 Web 应用 |
| **JWT** | 无状态，天然支持分布式 | 无法撤销，Token 可能较大 | 微服务、移动应用 |
| **OAuth2.0** | 第三方登录，减少密码管理 | 实现复杂，依赖第三方 | 社交登录 |
| **API Key** | 简单直接 | 安全性低，不适合用户认证 | 服务间调用 |

### 1.2 JWT 认证实现

> **🎟️ The Metaphor: The Passport vs The Wristband**
> *   **Session (Passport)**: 每次你出国（请求），海关（服务器）都要查你的护照，然后在电脑里查你的记录（数据库/Redis）。如果国家注销了你的护照，你立马就过不去了。
> *   **JWT (Wristband)**: 就像音乐节的**手环**。上面写着你的名字和过期时间，还有主办方的防伪签名。保安（服务器）只看手环是不是真的，不过期就放行，根本不需要查电脑。
>     *   **好处**: 快，保安不需要联网。
>     *   **坏处**: 如果你把手环弄丢了，或者你想把捣乱的人赶出去，你没办法（除非换锁/换签名密钥）。

> **🛡️ Security Internals: JWT vs Session**
>
> *   **Session**: 状态存储在服务端 (Redis/Memcached)。客户端只存 SessionID。
>     *   优点: 可控 (Revocation, Listing sessions)。
>     *   缺点: 有状态，水平扩展需要共享存储。
> *   **JWT (JSON Web Token)**: 状态存储在客户端 (Payload)。
>     *   **Signature**: 使用 HMAC (对称) 或 RSA/ECDSA (非对称) 签名。防止篡改。
>     *   **Stateless**: 服务端无需查库即可验证 (CPU 换 I/O)。
>     *   **Revocation Problem**: 无法撤销 (除非 Token 过期)。解决方案: Blacklist (又变回有状态了) 或 短期 Access Token + 长期 Refresh Token。

**JWT 结构：** Header.Payload.Signature

```typescript
// JWT Payload 示例
{
  "userId": "user-123",
  "email": "user@example.com",
  "roles": ["user", "admin"],
  "iat": 1640000000,  // 签发时间
  "exp": 1640086400   // 过期时间
}
```

**关键实现要点：**

1. **密钥管理**：使用环境变量存储密钥，定期轮换
2. **过期时间**：Access Token 短期（15分钟），Refresh Token 长期（7天）
3. **Token 刷新**：Access Token 过期后使用 Refresh Token 获取新的 Token
4. **黑名单机制**：需要撤销时将 Token 加入黑名单（Redis）

**安全最佳实践：**

- ✅ 使用 HTTPS 传输 Token
- ✅ Token 存储在 HTTP-only Cookie 中（防止 XSS）
- ✅ 敏感操作要求重新认证
- ✅ 限制 Token 的使用范围（audience）
- ❌ 不要在 Token 中存储敏感信息

### 1.3 OAuth 2.0 授权流程

> **🔑 The Metaphor: The Valet Key**
> OAuth 2.0 就像是**代客泊车钥匙**。
> 你（资源拥有者）把车钥匙给泊车小弟（第三方应用）。
> 这把钥匙（Access Token）只能用来**开车**（访问特定资源），不能用来**打开后备箱**（访问敏感信息），也不能用来**过户**（修改密码）。
> 而且这把钥匙是**临时**的，过一会就失效了。
> 你不需要把你的主钥匙（账号密码）给泊车小弟。

> **🛡️ Security Protocol: PKCE (Proof Key for Code Exchange)**
>
> 传统的 Authorization Code 模式在移动端/SPA 中存在 **Authorization Code Interception Attack** 风险。
>
> **PKCE Flow**:
> 1.  Client 生成随机 `code_verifier`，计算 `code_challenge = SHA256(code_verifier)`。
> 2.  Authorization Request 带上 `code_challenge`。
> 3.  Token Request 带上原始 `code_verifier`。
> 4.  Server 验证 `SHA256(code_verifier) === code_challenge`。
>
> 这样即使攻击者截获了 Authorization Code，因为没有 `code_verifier`，也无法换取 Token。

OAuth 2.0 提供了多种授权模式：

**授权码模式（Authorization Code）** - 最安全，适合有后端的应用

流程：
1. 用户点击"使用 Google 登录"
2. 重定向到 Google 授权页面
3. 用户同意授权
4. Google 重定向回应用，带上授权码
5. 应用后端用授权码换取 Access Token
6. 使用 Access Token 获取用户信息

**关键安全点：**

- **State 参数**：防止 CSRF 攻击
- **PKCE**：防止授权码拦截攻击
- **重定向 URL 白名单**：防止开放重定向漏洞

---

## 2. 授权和权限控制

### 2.1 RBAC（基于角色的访问控制）

RBAC 是最常用的权限模型，核心概念：

- **用户（User）**：系统的使用者
- **角色（Role）**：权限的集合
- **权限（Permission）**：对资源的操作

**数据模型设计：**

```
用户 --(多对多)-- 角色 --(多对多)-- 权限
```

**权限定义示例：**

```typescript
// 权限格式：resource:action
const permissions = {
  'user:read': '查看用户',
  'user:create': '创建用户',
  'user:update': '更新用户',
  'user:delete': '删除用户',
  'order:read': '查看订单',
  'order:cancel': '取消订单',
};

// 角色定义
const roles = {
  admin: ['user:*', 'order:*', 'product:*'],  // 所有权限
  manager: ['user:read', 'order:*', 'product:read'],
  customer: ['order:read', 'order:cancel'],
};
```

### 2.2 ABAC（基于属性的访问控制）

ABAC 更加灵活，基于用户属性、资源属性、环境属性等进行访问控制。

**策略示例：**

```typescript
// 规则：用户只能访问自己的订单
function canAccessOrder(user: User, order: Order): boolean {
  return user.id === order.userId;
}

// 规则：管理员可以访问所有订单
function canAccessOrder(user: User, order: Order): boolean {
  return user.role === 'admin' || user.id === order.userId;
}

// 规则：工作时间内才能访问管理后台
function canAccessAdmin(user: User): boolean {
  const hour = new Date().getHours();
  return user.role === 'admin' && hour >= 9 && hour < 18;
}
```

---

## 3. 密码安全

### 3.1 密码存储

**永远不要明文存储密码！**

正确的密码存储方式：

1. **使用强哈希算法**：bcrypt、scrypt、Argon2
2. **加盐（Salt）**：防止彩虹表攻击
3. **慢哈希**：增加暴力破解成本

**bcrypt 示例：**

```typescript
import bcrypt from 'bcrypt';

// 注册时：哈希密码
const saltRounds = 12;  // 工作因子，越大越安全但越慢
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// 登录时：验证密码
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**密码策略：**

- ✅ 最小长度 8 位
- ✅ 包含大小写字母、数字、特殊字符
- ✅ 不能是常见密码（password123）
- ✅ 定期提醒用户更换密码
- ✅ 记录密码历史，防止重复使用

### 3.2 密码重置

安全的密码重置流程：

1. 用户输入邮箱
2. 生成随机 Token（crypto.randomBytes）
3. Token 存储到数据库，设置过期时间（如 1 小时）
4. 发送包含 Token 的重置链接到邮箱
5. 用户点击链接，输入新密码
6. 验证 Token 有效性，更新密码
7. 删除或标记 Token 为已使用

**安全要点：**

- Token 应该是随机的、不可预测的
- Token 只能使用一次
- Token 有过期时间
- 密码重置成功后通知用户

---

## 4. 加密技术

### 4.1 对称加密 vs 非对称加密

> **🚚 The Metaphor: The Armored Truck (HTTPS)**
> HTTPS 是互联网上的**运钞车**。
> *   **非对称加密 (RSA)**: 就像是**交换钥匙**的过程。银行（服务器）把一把开着的锁（公钥）给你，你把你的箱子锁上（用公钥加密）寄回去。只有银行有钥匙（私钥）能打开。这很安全，但开锁关锁很慢。
> *   **对称加密 (AES)**: 就像是**运钞车本身**。一旦双方确认了身份并交换了“车钥匙”（会话密钥），之后的钱（数据）就直接装在车里跑。这很快。
> 
> HTTPS 的握手就是先用非对称加密交换车钥匙，然后用对称加密开车。

**对称加密**（AES）：加密和解密使用同一个密钥

- 优势：速度快
- 劣势：密钥分发困难
- 用途：数据加密（如加密数据库字段）

**非对称加密**（RSA）：公钥加密，私钥解密

- 优势：密钥分发安全
- 劣势：速度慢
- 用途：数字签名、密钥交换

**混合加密**（HTTPS）：使用非对称加密传输对称密钥，再用对称密钥加密数据

### 4.2 加密应用场景

**敏感数据加密：**

```typescript
import crypto from 'crypto';

// AES-256-GCM 加密
function encrypt(text: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}
```

**应用场景：**

- 加密信用卡号、身份证号
- 加密数据库备份文件
- 加密配置文件中的敏感信息
- 加密传输中的数据

---

## 5. 常见安全漏洞防护

### 5.1 SQL 注入

> **🤖 The Metaphor: The Robot Uprising**
> SQL 注入就像是你对一个扫地机器人说：“把地扫干净，**然后把房子烧了**。”
> 如果机器人（数据库）没有分辨出哪部分是指令，哪部分是数据，它就会乖乖地把房子烧了。
> **参数化查询 (Prepared Statements)** 就是把指令和数据分开传给机器人。
> 指令：“把地扫干净，区域是 [X]。”
> 数据：“X = '然后把房子烧了'。”
> 机器人会想：“哦，我要去扫一个叫‘然后把房子烧了’的区域。” 房子安全了。

> **🛡️ Security Mechanics: Prepared Statements**
>
> 为什么参数化查询能防注入？
> *   **Compilation**: 数据库引擎先编译 SQL 模板 (Parse Tree)。
> *   **Binding**: 然后将用户输入作为**数据**绑定到占位符。
> *   **Execution**: 数据库将输入视为纯数据，绝不会将其解析为 SQL 指令。
> *   **String Concatenation**: `'SELECT * FROM users WHERE id = ' + input`。输入被直接拼接进 SQL 语句，数据库无法区分哪部分是代码，哪部分是数据。

**原理：** 攻击者在输入中插入恶意 SQL 代码

**防护：**
- ✅ 使用参数化查询或 ORM
- ✅ 输入验证和清理
- ✅ 最小权限原则（数据库用户权限）

### 5.2 XSS（跨站脚本攻击）

> **🐴 The Metaphor: The Trojan Horse**
> XSS (Cross-Site Scripting) 就像是**特洛伊木马**。
> 攻击者把恶意的士兵（JavaScript 代码）藏在看似无害的礼物（用户评论/URL 参数）里，送进你的城池（浏览器）。
> 当你的浏览器毫无防备地把这个礼物展示出来（渲染 DOM）时，木马里的士兵就会跳出来，打开城门（窃取 Cookie/Token），让敌人大军长驱直入。
> **防御**: 永远不要信任希腊人送的礼物（永远不要信任用户输入，必须转义）。

**类型：**
- **反射型 XSS**：恶意脚本在 URL 参数中
- **存储型 XSS**：恶意脚本存储在数据库中
- **DOM XSS**：前端 JavaScript 代码漏洞

**防护：**
- ✅ 输出转义（HTML 实体编码）
- ✅ Content Security Policy (CSP)
- ✅ HTTP-only Cookie
- ✅ 使用安全的模板引擎
- ❌ 不要使用 innerHTML、eval()

### 5.3 CSRF（跨站请求伪造）

**原理：** 攻击者诱导用户在已登录网站上执行非预期操作

**防护：**
- ✅ CSRF Token（同步令牌模式）
- ✅ SameSite Cookie 属性
- ✅ 双重 Cookie 验证
- ✅ 验证 Referer/Origin 头

```typescript
// CSRF Token 中间件
app.use((req, res, next) => {
  if (req.method === 'GET') {
    // 生成 CSRF Token
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  } else {
    // 验证 CSRF Token
    const token = req.header('X-CSRF-Token');
    if (token !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
});
```

### 5.4 其他常见漏洞

| 漏洞 | 描述 | 防护措施 |
|------|------|----------|
| **XXE** | XML 外部实体注入 | 禁用外部实体，使用安全的 XML 解析器 |
| **SSRF** | 服务端请求伪造 | 白名单验证 URL，禁止访问内网 |
| **路径遍历** | 访问未授权文件 | 验证和清理文件路径，使用白名单 |
| **开放重定向** | 重定向到恶意网站 | 验证重定向 URL，使用白名单 |
| **不安全反序列化** | 执行恶意代码 | 避免反序列化不可信数据，使用 JSON |

---

## 6. 安全 HTTP 头部

### 6.1 重要的安全头部

```typescript
// 配置安全头部
app.use((req, res, next) => {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 防止 MIME 类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS 防护（已过时，使用 CSP）
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 强制 HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  // 不发送 Referer
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // 权限策略
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
  
  next();
});
```

使用 helmet 中间件可以自动配置这些头部：

```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## 7. API 安全

### 7.1 API 安全最佳实践

1. **认证和授权**
   - 所有 API 都需要认证
   - 基于角色的访问控制
   - API Key 管理

2. **速率限制**
   - 防止暴力破解
   - 防止 DDoS 攻击
   - 按 IP、用户、API Key 限流

3. **输入验证**
   - 验证所有输入参数
   - 使用 Schema 验证（Joi、Zod）
   - 限制请求大小

4. **输出过滤**
   - 不返回敏感信息
   - 统一错误响应格式
   - 避免泄露系统信息

5. **日志和监控**
   - 记录所有 API 调用
   - 监控异常行为
   - 告警机制

---

## 8. 依赖安全

### 8.1 依赖管理

**定期更新依赖：**

```bash
# 检查过时的包
npm outdated

# 更新依赖
npm update

# 检查安全漏洞
npm audit

# 自动修复漏洞
npm audit fix
```

**使用工具：**

- **Snyk**：持续监控依赖漏洞
- **Dependabot**：自动创建 PR 更新依赖
- **npm audit**：内置安全审计

**最佳实践：**

- ✅ 锁定依赖版本（package-lock.json）
- ✅ 定期审查依赖
- ✅ 移除未使用的依赖
- ✅ 使用可信的包源

---

## 9. 安全审计

### 9.1 安全检查清单

**认证和授权：**
- [ ] 密码使用强哈希算法存储
- [ ] JWT Token 设置合理的过期时间
- [ ] 实现了权限控制
- [ ] 敏感操作需要重新认证

**数据安全：**
- [ ] 敏感数据加密存储
- [ ] 使用 HTTPS 传输
- [ ] 数据库连接加密
- [ ] 定期备份数据

**输入验证：**
- [ ] 所有输入都经过验证
- [ ] 使用参数化查询防止 SQL 注入
- [ ] 输出转义防止 XSS
- [ ] CSRF Token 保护

**错误处理：**
- [ ] 不泄露敏感错误信息
- [ ] 记录详细的服务端日志
- [ ] 统一的错误响应格式

**依赖安全：**
- [ ] 定期更新依赖
- [ ] 使用 npm audit 检查漏洞
- [ ] 移除未使用的依赖

**配置安全：**
- [ ] 敏感配置存储在环境变量
- [ ] 不提交密钥到版本控制
- [ ] 使用密钥管理服务（AWS Secrets Manager）

---

## 10. 实战练习

### 练习 1：实现完整的认证系统

实现一个包含以下功能的认证系统：
- 用户注册（邮箱验证）
- 用户登录（JWT）
- 密码重置
- Token 刷新
- 登出

### 练习 2：RBAC 权限系统

设计并实现一个 RBAC 权限系统：
- 用户、角色、权限的数据模型
- 权限检查中间件
- 动态权限分配
- 管理界面

### 练习 3：安全漏洞修复

给定一个有多个安全漏洞的应用，识别并修复：
- SQL 注入
- XSS
- CSRF
- 不安全的密码存储

---

## 11. 延伸阅读

### 推荐资源
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Aca demy](https://portswigger.net/web-security)
- [JWT.io](https://jwt.io/)
- [OAuth 2.0 RFC](https://oauth.net/2/)

### 工具推荐
- **安全扫描**：OWASP ZAP、Burp Suite
- **依赖检查**：Snyk、npm audit
- **密码工具**：bcrypt、argon2
- **加密工具**：OpenSSL、crypto

---

**下一章：**[第 4 章 - 韧性工程与 DevOps](../04-reliability-engineering/)
