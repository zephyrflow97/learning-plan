# 第 1 章：微服务架构

## 📋 本章概述

微服务架构是一种将单个应用程序拆分为一组小型、独立服务的架构风格。每个服务运行在自己的进程中,通过轻量级机制(通常是 HTTP API)进行通信。这种架构风格能够提高系统的可扩展性、可维护性和团队的独立性,是现代大型应用的标准架构模式。

### 学习目标

完成本章后,你将能够:

- ✅ 理解微服务架构的核心概念和原则
- ✅ 掌握服务拆分的策略和方法
- ✅ 实现 API 网关模式
- ✅ 配置服务发现和负载均衡
- ✅ 实现服务间通信(REST、gRPC、消息队列)
- ✅ 处理分布式事务和数据一致性
- ✅ 实现断路器和服务降级
- ✅ 搭建微服务监控系统

### 前置知识

- ✅ 熟练掌握 TypeScript 和 Node.js
- ✅ 理解 RESTful API 设计
- ✅ 了解基本的网络和 HTTP 协议
- ✅ 熟悉数据库操作

---

## 1. 微服务架构基础

### 1.1 什么是微服务架构

> **🦠 The Metaphor: The Cell Division (Organism)**
> 单体应用就像是一个**单细胞生物**（如变形虫）。它所有的功能（消化、运动、繁殖）都挤在一个细胞膜里。简单，但脆弱。
> 微服务架构就像是一个**多细胞生物**（如人类）。
> *   **User Service** 是神经细胞。
> *   **Order Service** 是肌肉细胞。
> *   **Payment Service** 是血液细胞。
> 
> 它们各司其职，通过化学信号（API）通信。如果一个肌肉细胞坏死了，人不会死（系统容错性）。如果需要跑得更快，身体会制造更多的肌肉细胞（独立扩展），而不需要让大脑也变大。

**定义:**

微服务架构是一种架构风格,它将应用构建为一组小型服务,每个服务:
- 运行在自己的进程中
- 围绕业务能力构建
- 可以独立部署
- 采用轻量级通信机制

**与单体架构对比:**

```typescript
// ✅ 单体架构 - 所有功能在一个应用中
class MonolithicApp {
  private userService: UserService;
  private productService: ProductService;
  private orderService: OrderService;
  private paymentService: PaymentService;

  // 所有服务紧密耦合在一起
  async createOrder(userId: string, productIds: string[]) {
    const user = await this.userService.getUser(userId);
    const products = await this.productService.getProducts(productIds);
    const order = await this.orderService.createOrder(user, products);
    await this.paymentService.processPayment(order);
    return order;
  }
}

// ✅ 微服务架构 - 每个服务独立运行
// 用户服务 (User Service) - 独立应用
class UserServiceApp {
  async getUser(userId: string) {
    // 只负责用户相关逻辑
    return await this.userRepository.findById(userId);
  }
}

// 订单服务 (Order Service) - 独立应用
class OrderServiceApp {
  async createOrder(orderData: CreateOrderDTO) {
    // 通过 HTTP 调用其他服务
    const user = await this.httpClient.get(`${USER_SERVICE_URL}/users/${orderData.userId}`);
    const products = await this.httpClient.post(`${PRODUCT_SERVICE_URL}/products/batch`, {
      ids: orderData.productIds
    });
    
    // 订单服务只负责订单逻辑
    const order = await this.orderRepository.create({
      userId: user.id,
      products: products,
      total: this.calculateTotal(products)
    });
    
    // 发送消息到支付服务
    await this.messageQueue.publish('order.created', order);
    
    return order;
  }
}
```

**微服务架构的核心特征:**

1. **服务自治:** 每个服务可以独立开发、测试、部署
2. **去中心化:** 没有中央控制,每个服务管理自己的数据
3. **弹性:** 单个服务的失败不会导致整个系统崩溃
4. **可扩展:** 可以针对特定服务进行扩展
5. **技术多样性:** 不同服务可以使用不同的技术栈

### 1.2 微服务的优势和挑战

**优势:**

```typescript
/**
 * 💡 微服务架构的主要优势
 */

// 1. 独立部署和扩展
// 场景: 电商系统在促销期间订单服务压力大
// 单体架构: 必须扩展整个应用
// 微服务: 只需扩展订单服务

// Kubernetes 配置示例
// apiVersion: apps/v1
// kind: Deployment
// metadata:
//   name: order-service
// spec:
//   replicas: 10  # 只扩展订单服务到 10 个实例
//   ...

// 2. 技术栈灵活性
// 用户服务使用 Node.js + MongoDB
class UserService {
  constructor(private mongoClient: MongoClient) {}
}

// 推荐服务使用 Python + TensorFlow (适合机器学习)
// class RecommendationService:
//     def __init__(self, ml_model):
//         self.model = ml_model

// 3. 团队独立性
// 团队 A 负责用户服务,团队 B 负责订单服务
// 他们可以独立开发、测试、部署,不互相阻塞

// 4. 故障隔离
class OrderService {
  async getRecommendations(userId: string) {
    try {
      // 推荐服务挂了不影响核心订单功能
      const recommendations = await this.recommendationServiceClient.get(userId);
      return recommendations;
    } catch (error) {
      // 降级处理: 返回默认推荐
      console.error('推荐服务不可用,使用默认推荐', error);
      return this.getDefaultRecommendations();
    }
  }
}
```

**挑战:**

```typescript
/**
 * ⚠️ 微服务架构的主要挑战
 */

// 1. 分布式系统复杂性
// 问题: 网络延迟、部分失败、数据一致性

class OrderService {
  async createOrder(orderData: CreateOrderDTO) {
    try {
      // 调用用户服务 - 可能失败
      const user = await this.userServiceClient.getUser(orderData.userId);
      
      // 调用库存服务 - 可能失败
      const stockCheck = await this.inventoryServiceClient.checkStock(orderData.items);
      
      // 调用支付服务 - 可能失败
      const payment = await this.paymentServiceClient.processPayment(orderData.payment);
      
      // ❌ 如果支付成功但保存订单失败怎么办?
      const order = await this.orderRepository.save({...});
      
      return order;
    } catch (error) {
      // ⚠️ 需要复杂的错误处理和补偿逻辑
      throw error;
    }
  }
}

// 2. 数据一致性
// 问题: 每个服务有自己的数据库,如何保证数据一致性?

// 场景: 用户下单后需要同时:
// - 创建订单记录 (订单数据库)
// - 扣减库存 (库存数据库)
// - 扣减积分 (用户数据库)

// ⚠️ 不能使用传统的数据库事务,因为数据在不同数据库中

// 3. 服务间通信开销
// 问题: 服务调用需要网络通信,比进程内调用慢得多

// 单体应用: 函数调用 (纳秒级)
const user = userService.getUser(userId);  // 直接调用

// 微服务: HTTP 调用 (毫秒级)
const user = await fetch(`http://user-service/users/${userId}`);  // 网络延迟

// 4. 测试复杂性
// 问题: 需要测试多个服务的交互

// ⚠️ 集成测试需要启动多个服务
// docker-compose up user-service product-service order-service payment-service

// 5. 运维复杂度
// 问题: 需要管理大量的服务实例

// 单体应用: 1 个应用
// 微服务: 10+ 个服务,每个服务可能有多个实例
// user-service: 3 实例
// product-service: 5 实例
// order-service: 10 实例
// ...
```

### 1.3 何时使用微服务

> **🏛️ CS Master's Bridge: The Distributed Systems Trade-off**
>
> 微服务本质上是将 **函数调用 (Function Call)** 替换为 **网络调用 (Network Call)**。
> *   **Latency**: 纳秒级 (ns) -> 毫秒级 (ms)。这是 10^6 倍的性能损失。
> *   **Reliability**: 进程内调用几乎总是成功；网络调用经常失败 (Network is unreliable)。
> *   **Consistency**: ACID 事务 -> 最终一致性 (BASE)。
>
> **Conway's Law (康威定律)**: "系统设计受限于组织沟通结构。"
> *   如果你有 5 个人的团队，做微服务是自杀。
> *   如果你有 500 个人的团队，做单体是自杀。

```typescript
/**
 * 💡 微服务适用场景判断
 */

// ✅ 适合使用微服务的场景:

// 1. 大型团队
// - 团队规模: 20+ 开发人员
// - 需要: 团队可以独立工作,减少协调成本

// 2. 复杂业务领域
// - 业务模块: 用户、商品、订单、支付、物流、营销...
// - 需要: 不同模块可以独立演进

// 3. 高扩展性要求
// - 场景: 不同模块有不同的负载特征
// - 例如: 商品浏览量大,但订单量相对小
// - 需要: 可以针对性扩展

// 4. 技术栈多样性需求
// - 场景: 不同模块适合不同技术
// - 例如: 推荐系统用 Python,核心服务用 Node.js

// 5. 持续交付要求
// - 场景: 需要频繁发布新功能
// - 需要: 各团队可以独立部署,不互相影响

// ❌ 不适合使用微服务的场景:

// 1. 小型应用
// - 团队规模: < 5 人
// - 问题: 微服务的复杂度大于收益

// 2. 业务不确定
// - 场景: 创业初期,业务快速变化
// - 问题: 服务边界难以确定,重构成本高

// 3. 简单的 CRUD 应用
// - 场景: 只是简单的数据库操作
// - 问题: 不需要复杂的架构

/**
 * 🔍 决策框架
 */
class MicroserviceDecisionFramework {
  /**
   * 评估是否应该采用微服务架构
   * @param criteria 评估标准
   * @returns 是否适合微服务
   */
  evaluate(criteria: {
    teamSize: number;           // 团队规模
    domainComplexity: number;   // 业务复杂度 (1-10)
    scalabilityNeeds: number;   // 扩展性需求 (1-10)
    deploymentFrequency: number;// 部署频率 (次/月)
    budgetForInfra: number;     // 基础设施预算
  }): { suitable: boolean; score: number; reasons: string[] } {
    
    const reasons: string[] = [];
    let score = 0;
    
    // 团队规模评分
    if (criteria.teamSize >= 20) {
      score += 3;
      reasons.push('✅ 团队规模足够大,可以分成多个独立团队');
    } else if (criteria.teamSize >= 10) {
      score += 1;
      reasons.push('⚠️ 团队规模适中,可以考虑微服务');
    } else {
      score -= 2;
      reasons.push('❌ 团队规模太小,微服务可能增加负担');
    }
    
    // 业务复杂度评分
    if (criteria.domainComplexity >= 7) {
      score += 3;
      reasons.push('✅ 业务复杂度高,适合拆分');
    } else if (criteria.domainComplexity >= 5) {
      score += 1;
      reasons.push('⚠️ 业务复杂度适中');
    }
    
    // 扩展性需求评分
    if (criteria.scalabilityNeeds >= 7) {
      score += 2;
      reasons.push('✅ 扩展性需求高,微服务可以精准扩展');
    }
    
    // 部署频率评分
    if (criteria.deploymentFrequency >= 10) {
      score += 2;
      reasons.push('✅ 部署频繁,微服务支持独立部署');
    }
    
    return {
      suitable: score >= 5,
      score,
      reasons
    };
  }
}

// 使用示例
const framework = new MicroserviceDecisionFramework();

// 场景 1: 大型电商平台
const ecommercePlatform = framework.evaluate({
  teamSize: 50,
  domainComplexity: 9,
  scalabilityNeeds: 10,
  deploymentFrequency: 20,
  budgetForInfra: 100000
});
console.log('电商平台评估:', ecommercePlatform);
// 输出: { suitable: true, score: 10, reasons: [...] }

// 场景 2: 小型 SaaS 应用
const smallSaaS = framework.evaluate({
  teamSize: 5,
  domainComplexity: 4,
  scalabilityNeeds: 5,
  deploymentFrequency: 8,
  budgetForInfra: 5000
});
console.log('小型 SaaS 评估:', smallSaaS);
// 输出: { suitable: false, score: 0, reasons: [...] }
```

---

## 2. 服务拆分策略

### 2.1 拆分原则

```typescript
/**
 * 💡 服务拆分的核心原则
 */

// 原则 1: 单一职责原则 (Single Responsibility Principle)
// 每个服务应该只有一个变更的理由

// ✅ 好的拆分
class UserService {
  // 只负责用户相关的操作
  async createUser(userData: CreateUserDTO) { }
  async updateUser(userId: string, userData: UpdateUserDTO) { }
  async getUserProfile(userId: string) { }
  async authenticateUser(credentials: Credentials) { }
}

class OrderService {
  // 只负责订单相关的操作
  async createOrder(orderData: CreateOrderDTO) { }
  async getOrderStatus(orderId: string) { }
  async cancelOrder(orderId: string) { }
}

// ❌ 不好的拆分
class UserOrderService {
  // 职责混乱,用户和订单耦合在一起
  async createUser(userData: CreateUserDTO) { }
  async createOrder(orderData: CreateOrderDTO) { }
  async getUserOrders(userId: string) { }
}

// 原则 2: 业务能力边界 (Business Capability Boundary)
// 按照业务能力划分服务

/**
 * 🔍 电商系统的业务能力分析
 */
class EcommerceDomainAnalysis {
  // 识别核心业务能力
  getBusinessCapabilities() {
    return {
      // 用户管理能力
      userManagement: {
        capabilities: ['注册', '登录', '个人信息管理', '地址管理'],
        service: 'UserService'
      },
      
      // 商品目录能力
      productCatalog: {
        capabilities: ['商品CRUD', '分类管理', '搜索', '库存查询'],
        service: 'ProductService'
      },
      
      // 订单处理能力
      orderProcessing: {
        capabilities: ['下单', '订单状态管理', '订单查询', '取消订单'],
        service: 'OrderService'
      },
      
      // 支付能力
      payment: {
        capabilities: ['支付处理', '退款', '支付记录'],
        service: 'PaymentService'
      },
      
      // 物流能力
      shipping: {
        capabilities: ['物流跟踪', '配送管理'],
        service: 'ShippingService'
      },
      
      // 营销能力
      marketing: {
        capabilities: ['优惠券', '促销活动', '推荐系统'],
        service: 'MarketingService'
      }
    };
  }
}

// 原则 3: 数据独立性
// 每个服务拥有自己的数据库

// ✅ 好的设计 - 每个服务独立的数据库
class UserServiceWithDB {
  private userDatabase: Database;  // 用户服务专属数据库
  
  async getUser(userId: string) {
    return await this.userDatabase.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}

class OrderServiceWithDB {
  private orderDatabase: Database;  // 订单服务专属数据库
  
  async getOrder(orderId: string) {
    return await this.orderDatabase.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  }
}

// ❌ 不好的设计 - 共享数据库
class UserServiceBad {
  private sharedDatabase: Database;  // ❌ 多个服务共享同一个数据库
  
  async getUser(userId: string) {
    // 可能会被其他服务的数据库变更影响
    return await this.sharedDatabase.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}

// 原则 4: 高内聚低耦合
// 服务内部紧密相关,服务之间松散耦合

// ✅ 高内聚示例
class ProductService {
  // 这些方法都紧密相关,都是关于商品的
  async createProduct(productData: CreateProductDTO) {
    // 创建商品
    const product = await this.productRepository.create(productData);
    
    // 更新商品索引(仍然是商品相关)
    await this.updateSearchIndex(product);
    
    // 更新商品缓存(仍然是商品相关)
    await this.cacheProduct(product);
    
    return product;
  }
  
  private async updateSearchIndex(product: Product) {
    // 内部方法,只为 createProduct 服务
  }
  
  private async cacheProduct(product: Product) {
    // 内部方法,只为 createProduct 服务
  }
}

// ✅ 低耦合示例
class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    // 通过接口与其他服务通信,而不是直接依赖
    private userServiceClient: IUserServiceClient,
    private productServiceClient: IProductServiceClient
  ) {}
  
  async createOrder(orderData: CreateOrderDTO) {
    // 通过 API 调用,而不是直接访问其他服务的数据库
    const user = await this.userServiceClient.getUser(orderData.userId);
    const product = await this.productServiceClient.getProduct(orderData.productId);
    
    // 订单服务只管理订单数据
    return await this.orderRepository.create({
      userId: user.id,
      productId: product.id,
      total: product.price
    });
  }
}
```

### 2.2 拆分方法

```typescript
/**
 * 💡 服务拆分的具体方法
 */

// 方法 1: 按业务领域拆分 (Domain-Driven Design)
// 使用 DDD 的限界上下文(Bounded Context)

/**
 * 📚 电商系统的限界上下文
 */
interface BoundedContext {
  name: string;
  entities: string[];
  aggregates: string[];
  domainEvents: string[];
}

const ecommerceBoundedContexts: BoundedContext[] = [
  {
    name: '用户上下文',
    entities: ['User', 'Address', 'Profile'],
    aggregates: ['UserAggregate'],
    domainEvents: ['UserRegistered', 'UserProfileUpdated']
  },
  {
    name: '产品目录上下文',
    entities: ['Product', 'Category', 'Inventory'],
    aggregates: ['ProductAggregate'],
    domainEvents: ['ProductCreated', 'PriceChanged', 'StockUpdated']
  },
  {
    name: '订单上下文',
    entities: ['Order', 'OrderItem', 'OrderStatus'],
    aggregates: ['OrderAggregate'],
    domainEvents: ['OrderCreated', 'OrderShipped', 'OrderCancelled']
  }
];

// 每个限界上下文对应一个微服务

// 方法 2: 按变更频率拆分
// 将经常变更的部分和稳定的部分分离

class ServiceByChangeFrequency {
  // 高变更频率服务 - 营销活动服务
  // 原因: 促销规则经常变化
  class MarketingService {
    async createCampaign(campaign: Campaign) {
      // 每周都可能有新的促销活动
    }
  }
  
  // 低变更频率服务 - 用户服务
  // 原因: 用户管理逻辑相对稳定
  class UserService {
    async createUser(user: User) {
      // 用户注册流程很少改变
    }
  }
}

// 💡 好处: 可以更频繁地部署营销服务,而不影响稳定的用户服务

// 方法 3: 按团队边界拆分 (Conway's Law)
// 服务边界应该与团队边界对齐

/**
 * 🔍 团队组织结构影响服务拆分
 */
class TeamBasedServices {
  // 团队 A: 前台团队
  teamA = {
    name: '前台团队',
    services: ['ProductCatalogService', 'SearchService', 'RecommendationService'],
    responsibility: '用户可见的商品展示功能'
  };
  
  // 团队 B: 交易团队
  teamB = {
    name: '交易团队',
    services: ['OrderService', 'PaymentService', 'CartService'],
    responsibility: '订单和支付流程'
  };
  
  // 团队 C: 用户团队
  teamC = {
    name: '用户团队',
    services: ['UserService', 'AuthService', 'ProfileService'],
    responsibility: '用户账户和认证'
  };
}

// 方法 4: 按技术需求拆分

class ServiceByTechRequirements {
  // 需要高性能的服务 - 使用 Go
  // class SearchServiceGo {
  //   // Go 实现,性能优秀
  // }
  
  // 需要机器学习的服务 - 使用 Python
  // class RecommendationServicePython {
  //   // Python 实现,ML 库丰富
  // }
  
  // 常规业务服务 - 使用 TypeScript
  class OrderServiceTS {
    // TypeScript 实现,开发效率高
  }
}

/**
 * 🔍 实践: 识别服务边界
 */
class ServiceBoundaryIdentifier {
  /**
   * 分析实体之间的关系,识别聚合根
   */
  analyzeEntityRelationships() {
    // 示例: 电商订单聚合
    
    // 聚合根: Order
    // - 拥有 OrderItems
    // - 拥有 ShippingAddress
    // - 引用 User (不拥有)
    // - 引用 Product (不拥有)
    
    // 规则: 聚合内的实体应该在同一个服务中
    //       聚合间的引用通过服务间调用
    
    return {
      OrderService: {
        owns: ['Order', 'OrderItem', 'ShippingAddress'],
        references: ['User', 'Product']
      },
      UserService: {
        owns: ['User', 'UserProfile', 'Address'],
        references: []
      },
      ProductService: {
        owns: ['Product', 'Category', 'Inventory'],
        references: []
      }
    };
  }
  
  /**
   * 识别事务边界
   * 需要在同一个事务中完成的操作应该在同一个服务中
   */
  identifyTransactionBoundaries() {
    // ✅ 同一个服务 - 可以使用数据库事务
    class OrderService {
      async createOrder(orderData: CreateOrderDTO) {
        await this.db.transaction(async (trx) => {
          // 这些操作必须全部成功或全部失败
          const order = await trx('orders').insert({...});
          await trx('order_items').insert([...]);
          await trx('shipping_info').insert({...});
        });
      }
    }
    
    // ⚠️ 跨服务 - 需要使用分布式事务或最终一致性
    class OrderServiceDistributed {
      async createOrder(orderData: CreateOrderDTO) {
        // 1. 创建订单
        const order = await this.orderRepository.create({...});
        
        // 2. 调用库存服务扣减库存 - 另一个数据库
        await this.inventoryServiceClient.decreaseStock(orderData.items);
        
        // 3. 调用支付服务 - 又一个数据库
        await this.paymentServiceClient.processPayment(orderData.payment);
        
        // ⚠️ 如果第 3 步失败,第 2 步已经执行,数据不一致!
      }
    }
  }
}
```

### 2.3 服务拆分实战案例

```typescript
/**
 * 🚀 实战案例: 重构单体应用为微服务
 */

// 原始单体应用
class MonolithicEcommerceApp {
  // ❌ 所有功能混在一起
  private userRepository: UserRepository;
  private productRepository: ProductRepository;
  private orderRepository: OrderRepository;
  private paymentGateway: PaymentGateway;
  
  async checkout(checkoutData: CheckoutData) {
    // 1. 验证用户
    const user = await this.userRepository.findById(checkoutData.userId);
    if (!user) throw new Error('用户不存在');
    
    // 2. 验证商品
    const product = await this.productRepository.findById(checkoutData.productId);
    if (!product) throw new Error('商品不存在');
    
    // 3. 检查库存
    if (product.stock < checkoutData.quantity) {
      throw new Error('库存不足');
    }
    
    // 4. 扣减库存
    await this.productRepository.updateStock(
      product.id,
      product.stock - checkoutData.quantity
    );
    
    // 5. 创建订单
    const order = await this.orderRepository.create({
      userId: user.id,
      productId: product.id,
      quantity: checkoutData.quantity,
      total: product.price * checkoutData.quantity
    });
    
    // 6. 处理支付
    const payment = await this.paymentGateway.charge({
      amount: order.total,
      userId: user.id
    });
    
    // 7. 更新订单状态
    await this.orderRepository.updateStatus(order.id, 'PAID');
    
    return order;
  }
}

// 拆分后的微服务架构

// 1. 用户服务
class UserMicroservice {
  constructor(private userRepository: UserRepository) {}
  
  /**
   * 获取用户信息
   * @param userId 用户 ID
   * @returns 用户信息
   */
  async getUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
  
  /**
   * 验证用户是否存在
   * @param userId 用户 ID
   * @returns 是否存在
   */
  async validateUser(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return !!user;
  }
}

// 2. 商品服务
class ProductMicroservice {
  constructor(
    private productRepository: ProductRepository,
    private inventoryRepository: InventoryRepository
  ) {}
  
  /**
   * 获取商品信息
   */
  async getProduct(productId: string) {
    return await this.productRepository.findById(productId);
  }
  
  /**
   * 检查并预留库存
   * @returns 预留 ID,用于后续确认或取消
   */
  async reserveStock(productId: string, quantity: number): Promise<string> {
    const inventory = await this.inventoryRepository.findByProductId(productId);
    
    if (inventory.available < quantity) {
      throw new InsufficientStockError('库存不足');
    }
    
    // 创建库存预留记录
    const reservation = await this.inventoryRepository.createReservation({
      productId,
      quantity,
      status: 'RESERVED',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 分钟后过期
    });
    
    // 减少可用库存
    await this.inventoryRepository.decreaseAvailable(productId, quantity);
    
    return reservation.id;
  }
  
  /**
   * 确认库存扣减
   */
  async confirmReservation(reservationId: string) {
    const reservation = await this.inventoryRepository.findReservation(reservationId);
    
    // 将预留转为实际扣减
    await this.inventoryRepository.updateReservationStatus(reservationId, 'CONFIRMED');
    await this.inventoryRepository.decreaseStock(
      reservation.productId,
      reservation.quantity
    );
  }
  
  /**
   * 取消库存预留
   */
  async cancelReservation(reservationId: string) {
    const reservation = await this.inventoryRepository.findReservation(reservationId);
    
    // 恢复可用库存
    await this.inventoryRepository.increaseAvailable(
      reservation.productId,
      reservation.quantity
    );
    
    await this.inventoryRepository.updateReservationStatus(reservationId, 'CANCELLED');
  }
}

// 3. 订单服务
class OrderMicroservice {
  constructor(
    private orderRepository: OrderRepository,
    private userServiceClient: UserServiceClient,
    private productServiceClient: ProductServiceClient,
    private paymentServiceClient: PaymentServiceClient,
    private eventBus: EventBus
  ) {}
  
  /**
   * 创建订单
   */
  async createOrder(orderData: CreateOrderDTO) {
    // ✅ 调用用户服务验证用户
    const userExists = await this.userServiceClient.validateUser(orderData.userId);
    if (!userExists) {
      throw new BadRequestException('用户不存在');
    }
    
    // ✅ 调用商品服务获取商品信息
    const product = await this.productServiceClient.getProduct(orderData.productId);
    
    // ✅ 调用商品服务预留库存
    const reservationId = await this.productServiceClient.reserveStock(
      orderData.productId,
      orderData.quantity
    );
    
    try {
      // 创建订单(状态: PENDING)
      const order = await this.orderRepository.create({
        userId: orderData.userId,
        productId: orderData.productId,
        quantity: orderData.quantity,
        total: product.price * orderData.quantity,
        status: 'PENDING',
        reservationId
      });
      
      // ✅ 发送事件: 订单已创建
      await this.eventBus.publish('order.created', {
        orderId: order.id,
        userId: order.userId,
        total: order.total,
        reservationId
      });
      
      return order;
    } catch (error) {
      // 失败时取消库存预留
      await this.productServiceClient.cancelReservation(reservationId);
      throw error;
    }
  }
  
  /**
   * 处理支付完成事件
   */
  async handlePaymentCompleted(event: PaymentCompletedEvent) {
    const order = await this.orderRepository.findById(event.orderId);
    
    // 更新订单状态
    await this.orderRepository.updateStatus(order.id, 'PAID');
    
    // 确认库存扣减
    await this.productServiceClient.confirmReservation(order.reservationId);
    
    // 发送事件: 订单已支付
    await this.eventBus.publish('order.paid', {
      orderId: order.id,
      userId: order.userId
    });
  }
}

// 4. 支付服务
class PaymentMicroservice {
  constructor(
    private paymentRepository: PaymentRepository,
    private paymentGateway: PaymentGateway,
    private eventBus: EventBus
  ) {}
  
  /**
   * 处理订单创建事件,发起支付
   */
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      // 调用第三方支付网关
      const paymentResult = await this.paymentGateway.charge({
        amount: event.total,
        userId: event.userId,
        orderId: event.orderId
      });
      
      // 保存支付记录
      await this.paymentRepository.create({
        orderId: event.orderId,
        amount: event.total,
        status: 'SUCCESS',
        transactionId: paymentResult.transactionId
      });
      
      // 发送事件: 支付成功
      await this.eventBus.publish('payment.completed', {
        orderId: event.orderId,
        amount: event.total
      });
    } catch (error) {
      // 支付失败,发送事件
      await this.eventBus.publish('payment.failed', {
        orderId: event.orderId,
        reason: error.message
      });
    }
  }
}

/**
 * 💡 拆分总结
 */
// 单体应用问题:
// - 所有逻辑耦合在一起
// - 难以独立扩展
// - 部署时互相影响
// - 团队协作困难

// 微服务架构优势:
// - 服务职责清晰
// - 可以独立部署和扩展
// - 使用事件驱动实现解耦
// - 团队可以独立开发

// 新增复杂性:
// - 需要处理服务间通信
// - 需要分布式事务或最终一致性
// - 需要更复杂的监控和运维
```

---

## 3. API 网关

### 3.1 API 网关概念

> **🔌 The Metaphor: The Electrical Fuse (Circuit Breaker)**
> 熔断器 (Circuit Breaker) 就像是家里的**保险丝**。
> 当电流过大（错误率过高/响应过慢）时，保险丝会**熔断**（Open State），切断电路。
> 这样可以防止电器被烧坏（防止级联故障/雪崩）。
> 过了一会儿，你可以试着合上闸（Half-Open State）。如果电流正常了，就恢复供电（Closed State）；如果还是不行，就继续断开。
> 这保护了系统不会因为一个服务的故障而整体瘫痪。

> **🏨 The Metaphor: The Hotel Reception**
> API 网关就是大酒店的**前台**。
> *   **没有网关**：客人（客户端）必须自己去找厨师点菜，找保洁打扫房间，找财务结账。这太乱了，而且不安全（厨师不想让客人进厨房）。
> *   **有网关**：客人只跟前台说话。“我要点菜”、“我要退房”。前台负责用对讲机联系厨师和财务。
> *   **Cross-cutting Concerns**: 前台还负责查验身份证（认证）、收押金（限流）、记录入住信息（日志）。这些杂活不需要厨师去操心。

> **🏛️ Architecture Pattern: API Gateway vs BFF**
>
> *   **API Gateway**: 通用入口，负责 Cross-cutting concerns (Auth, Rate Limiting, Logging)。通常是基础设施层 (Nginx, Kong, AWS API Gateway)。
> *   **BFF (Backend for Frontend)**: 为特定客户端 (Mobile, Web, IoT) 定制的聚合层。负责裁剪数据、聚合请求。通常由业务团队开发 (Node.js, GraphQL)。
>
> **Sidecar Pattern (Service Mesh)**:
> 在 Kubernetes 中，我们不再在代码里写 Retry/Circuit Breaker 逻辑，而是将其下沉到 **Sidecar Proxy (Envoy/Istio)**。
> *   App Container: 只管业务逻辑。
> *   Sidecar Container: 管网络通信、监控、安全。

```typescript
/**
 * 💡 API 网关 (API Gateway)
 * 
 * 定义: API 网关是微服务架构中的单一入口点,
 * 负责请求路由、协议转换、认证授权、限流等功能
 */

// ❌ 没有 API 网关的问题
// 客户端需要知道所有服务的地址
class ClientWithoutGateway {
  async loadUserDashboard(userId: string) {
    // 客户端直接调用多个服务
    const user = await fetch('http://user-service:3001/users/' + userId);
    const orders = await fetch('http://order-service:3002/orders?userId=' + userId);
    const products = await fetch('http://product-service:3003/products/recommended?userId=' + userId);
    
    // ⚠️ 问题:
    // 1. 客户端需要知道所有服务的地址
    // 2. 服务地址变更时客户端需要更新
    // 3. 跨域问题(CORS)
    // 4. 没有统一的认证
    // 5. 多次 HTTP 请求,性能差
  }
}

// ✅ 使用 API 网关
class ClientWithGateway {
  async loadUserDashboard(userId: string) {
    // 客户端只需要知道网关地址
    const dashboard = await fetch('http://api-gateway/api/v1/dashboard/' + userId, {
      headers: {
        'Authorization': 'Bearer ' + this.authToken
      }
    });
    
    // ✅ 优势:
    // 1. 单一入口,客户端只需要知道网关地址
    // 2. 网关负责路由到正确的服务
    // 3. 统一处理认证和授权
    // 4. 可以聚合多个服务的数据,减少客户端请求次数
  }
}
```

### 3.2 API 网关功能

```typescript
/**
 * 🔧 API 网关的核心功能
 */

import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

class APIGateway {
  private app: express.Application;
  
  // 服务注册表
  private serviceRegistry = {
    'user-service': 'http://user-service:3001',
    'product-service': 'http://product-service:3002',
    'order-service': 'http://order-service:3003',
    'payment-service': 'http://payment-service:3004'
  };
  
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  private setupMiddleware() {
    this.app.use(express.json());
    
    // 功能 1: CORS 处理
    this.app.use(this.corsMiddleware());
    
    // 功能 2: 请求日志
    this.app.use(this.loggingMiddleware());
    
    // 功能 3: 认证
    this.app.use('/api/v1/protected/*', this.authenticationMiddleware());
    
    // 功能 4: 限流
    this.app.use('/api/v1/', this.rateLimitMiddleware());
  }
  
  /**
   * 功能 1: CORS 处理
   */
  private corsMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    };
  }
  
  /**
   * 功能 2: 请求日志
   */
  private loggingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log({
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('user-agent'),
          ip: req.ip
        });
      });
      
      next();
    };
  }
  
  /**
   * 功能 3: 认证中间件
   */
  private authenticationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '缺少认证令牌' });
      }
      
      const token = authHeader.substring(7);
      
      try {
        // 验证 JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // 将用户信息附加到请求对象
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          roles: decoded.roles
        };
        
        next();
      } catch (error) {
        return res.status(401).json({ error: '无效的认证令牌' });
      }
    };
  }
  
  /**
   * 功能 4: 限流
   */
  private rateLimitMiddleware() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 分钟
      max: 100, // 限制每个 IP 100 个请求
      message: '请求过于频繁,请稍后再试',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
  
  /**
   * 功能 5: 请求路由
   */
  private setupRoutes() {
    // 路由到用户服务
    this.app.all('/api/v1/users/*', async (req, res) => {
      await this.proxyRequest(req, res, 'user-service');
    });
    
    // 路由到商品服务
    this.app.all('/api/v1/products/*', async (req, res) => {
      await this.proxyRequest(req, res, 'product-service');
    });
    
    // 路由到订单服务
    this.app.all('/api/v1/orders/*', async (req, res) => {
      await this.proxyRequest(req, res, 'order-service');
    });
    
    // 功能 6: 请求聚合
    this.app.get('/api/v1/dashboard/:userId', async (req, res) => {
      await this.aggregateDashboard(req, res);
    });
  }
  
  /**
   * 代理请求到目标服务
   */
  private async proxyRequest(req: Request, res: Response, serviceName: string) {
    const serviceUrl = this.serviceRegistry[serviceName];
    
    if (!serviceUrl) {
      return res.status(404).json({ error: '服务不存在' });
    }
    
    try {
      // 移除 /api/v1/users 前缀,只保留后面的路径
      const path = req.path.replace(/^\/api\/v1\/\w+/, '');
      const targetUrl = `${serviceUrl}${path}`;
      
      console.log(`[网关] 路由请求: ${req.method} ${req.path} -> ${targetUrl}`);
      
      // 转发请求到目标服务
      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        params: req.query,
        headers: {
          // 转发原始请求头
          ...req.headers,
          // 添加追踪 ID
          'X-Request-ID': this.generateRequestId(),
          // 添加用户信息(如果已认证)
          'X-User-ID': req.user?.id,
        }
      });
      
      // 返回响应
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error(`[网关] 请求失败:`, error.message);
      
      if (error.response) {
        // 目标服务返回了错误
        res.status(error.response.status).json(error.response.data);
      } else {
        // 网络错误或服务不可用
        res.status(503).json({ error: '服务暂时不可用' });
      }
    }
  }
  
  /**
   * 功能 6: 请求聚合 - 组合多个服务的数据
   */
  private async aggregateDashboard(req: Request, res: Response) {
    const userId = req.params.userId;
    
    try {
      // 并行调用多个服务
      const [userResponse, ordersResponse, recommendationsResponse] = await Promise.all([
        axios.get(`${this.serviceRegistry['user-service']}/users/${userId}`),
        axios.get(`${this.serviceRegistry['order-service']}/orders?userId=${userId}&limit=5`),
        axios.get(`${this.serviceRegistry['product-service']}/products/recommended?userId=${userId}`)
      ]);
      
      // 聚合数据
      const dashboard = {
        user: userResponse.data,
        recentOrders: ordersResponse.data,
        recommendations: recommendationsResponse.data
      };
      
      res.json(dashboard);
    } catch (error: any) {
      console.error('[网关] 聚合请求失败:', error.message);
      res.status(500).json({ error: '无法加载仪表板数据' });
    }
  }
  
  /**
   * 功能 7: 响应缓存
   */
  private cacheMiddleware() {
    const cache = new Map<string, { data: any; timestamp: number }>();
    const CACHE_TTL = 60 * 1000; // 60 秒
    
    return (req: Request, res: Response, next: NextFunction) => {
      // 只缓存 GET 请求
      if (req.method !== 'GET') {
        return next();
      }
      
      const cacheKey = req.path + JSON.stringify(req.query);
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[网关] 缓存命中: ${cacheKey}`);
        return res.json(cached.data);
      }
      
      // 拦截 res.json,保存到缓存
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return originalJson(data);
      };
      
      next();
    };
  }
  
  /**
   * 功能 8: 断路器 - 防止级联失败
   */
  private circuitBreakerMiddleware() {
    const circuitBreakers = new Map<string, CircuitBreaker>();
    
    return async (req: Request, res: Response, next: NextFunction) => {
      const serviceName = this.getServiceNameFromPath(req.path);
      
      if (!circuitBreakers.has(serviceName)) {
        circuitBreakers.set(serviceName, new CircuitBreaker(serviceName));
      }
      
      const breaker = circuitBreakers.get(serviceName)!;
      
      if (breaker.isOpen()) {
        console.log(`[网关] 断路器打开: ${serviceName}`);
        return res.status(503).json({ 
          error: '服务暂时不可用',
          reason: '断路器已打开'
        });
      }
      
      next();
    };
  }
  
  private getServiceNameFromPath(path: string): string {
    // /api/v1/users/123 -> user-service
    const match = path.match(/^\/api\/v1\/(\w+)/);
    return match ? `${match[1]}-service` : 'unknown-service';
  }
  
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  start(port: number) {
    this.app.listen(port, () => {
      console.log(`[网关] API 网关运行在端口 ${port}`);
    });
  }
}

/**
 * 断路器实现
 */
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  private readonly FAILURE_THRESHOLD = 5;  // 失败阈值
  private readonly TIMEOUT = 60000;        // 断路器打开时间: 60 秒
  
  constructor(private serviceName: string) {}
  
  isOpen(): boolean {
    if (this.state === 'OPEN') {
      // 检查是否可以进入半开状态
      if (Date.now() - this.lastFailureTime > this.TIMEOUT) {
        console.log(`[断路器] ${this.serviceName} 进入半开状态`);
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }
  
  recordSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.log(`[断路器] ${this.serviceName} 关闭`);
      this.state = 'CLOSED';
    }
    this.failureCount = 0;
  }
  
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      console.log(`[断路器] ${this.serviceName} 打开`);
      this.state = 'OPEN';
    }
  }
}

/**
 * 使用示例
 */
const gateway = new APIGateway();
gateway.start(8000);
```

---

## 4. 服务发现和负载均衡

### 4.1 服务发现概念

```typescript
/**
 * 💡 服务发现 (Service Discovery)
 * 
 * 问题: 微服务架构中,服务实例的 IP 和端口是动态的
 * - 服务可能随时启动或关闭
 * - 服务可能自动扩展(增加或减少实例)
 * - 服务可能在不同的机器上运行
 * 
 * 解决方案: 服务发现机制
 * - 服务注册: 服务启动时向注册中心注册自己
 * - 服务查询: 客户端从注册中心查询服务地址
 * - 健康检查: 注册中心定期检查服务健康状态
 */

// ❌ 硬编码服务地址的问题
class OrderServiceWithHardcodedURL {
  private userServiceURL = 'http://192.168.1.100:3001';  // ❌ 固定 IP
  
  async getUser(userId: string) {
    // 问题:
    // 1. IP 地址改变时需要修改代码
    // 2. 服务有多个实例时无法负载均衡
    // 3. 服务宕机时无法自动切换
    return await fetch(`${this.userServiceURL}/users/${userId}`);
  }
}

// ✅ 使用服务发现
class OrderServiceWithDiscovery {
  constructor(private serviceRegistry: ServiceRegistry) {}
  
  async getUser(userId: string) {
    // 动态获取服务地址
    const userServiceURL = await this.serviceRegistry.getServiceURL('user-service');
    
    return await fetch(`${userServiceURL}/users/${userId}`);
  }
}
```

### 4.2 服务注册中心实现

```typescript
/**
 * 服务注册中心 - 使用 Consul
 */
import Consul from 'consul';

interface ServiceInstance {
  id: string;
  name: string;
  address: string;
  port: number;
  tags?: string[];
  meta?: Record<string, string>;
}

class ServiceRegistry {
  private consul: Consul.Consul;
  
  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: process.env.CONSUL_PORT || '8500'
    });
  }
  
  /**
   * 注册服务
   */
  async registerService(service: ServiceInstance): Promise<void> {
    console.log(`[注册中心] 注册服务: ${service.name} (${service.address}:${service.port})`);
    
    await this.consul.agent.service.register({
      id: service.id,
      name: service.name,
      address: service.address,
      port: service.port,
      tags: service.tags,
      meta: service.meta,
      
      // 健康检查配置
      check: {
        http: `http://${service.address}:${service.port}/health`,
        interval: '10s',      // 每 10 秒检查一次
        timeout: '5s',        // 超时时间 5 秒
        deregistercriticalserviceafter: '1m'  // 1 分钟后注销不健康的服务
      }
    });
  }
  
  /**
   * 注销服务
   */
  async deregisterService(serviceId: string): Promise<void> {
    console.log(`[注册中心] 注销服务: ${serviceId}`);
    await this.consul.agent.service.deregister(serviceId);
  }
  
  /**
   * 发现服务 - 获取所有健康的服务实例
   */
  async discoverService(serviceName: string): Promise<ServiceInstance[]> {
    const result = await this.consul.health.service({
      service: serviceName,
      passing: true  // 只返回健康的实例
    });
    
    return result.map((entry: any) => ({
      id: entry.Service.ID,
      name: entry.Service.Service,
      address: entry.Service.Address,
      port: entry.Service.Port,
      tags: entry.Service.Tags,
      meta: entry.Service.Meta
    }));
  }
  
  /**
   * 获取服务 URL - 带负载均衡
   */
  async getServiceURL(serviceName: string): Promise<string> {
    const instances = await this.discoverService(serviceName);
    
    if (instances.length === 0) {
      throw new Error(`服务不可用: ${serviceName}`);
    }
    
    // 简单的轮询负载均衡
    const instance = this.selectInstance(instances);
    
    return `http://${instance.address}:${instance.port}`;
  }
  
  /**
   * 负载均衡 - 轮询策略
   */
  private instanceIndex = new Map<string, number>();
  
  private selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const serviceName = instances[0].name;
    const currentIndex = this.instanceIndex.get(serviceName) || 0;
    const selectedInstance = instances[currentIndex % instances.length];
    
    this.instanceIndex.set(serviceName, currentIndex + 1);
    
    return selectedInstance;
  }
}

/**
 * 服务启动时自动注册
 */
class MicroserviceApp {
  private serviceRegistry: ServiceRegistry;
  private serviceId: string;
  
  constructor(
    private serviceName: string,
    private port: number
  ) {
    this.serviceRegistry = new ServiceRegistry();
    this.serviceId = `${serviceName}-${process.pid}-${Date.now()}`;
  }
  
  async start() {
    const app = express();
    
    // 添加健康检查端点
    app.get('/health', (req, res) => {
      res.json({ status: 'UP', timestamp: new Date().toISOString() });
    });
    
    // 其他路由...
    app.get('/users/:id', async (req, res) => {
      // 业务逻辑
    });
    
    // 启动服务器
    app.listen(this.port, async () => {
      console.log(`[${this.serviceName}] 服务启动在端口 ${this.port}`);
      
      // 注册到服务发现中心
      await this.registerToConsul();
    });
    
    // 优雅关闭
    process.on('SIGTERM', async () => {
      await this.deregisterFromConsul();
      process.exit(0);
    });
  }
  
  private async registerToConsul() {
    await this.serviceRegistry.registerService({
      id: this.serviceId,
      name: this.serviceName,
      address: this.getLocalIP(),
      port: this.port,
      tags: ['api', 'v1'],
      meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
  
  private async deregisterFromConsul() {
    await this.serviceRegistry.deregisterService(this.serviceId);
  }
  
  private getLocalIP(): string {
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'localhost';
  }
}

// 使用示例
const userService = new MicroserviceApp('user-service', 3001);
userService.start();
```

### 4.3 客户端负载均衡

> **👮 The Metaphor: The Traffic Cop (Load Balancer)**
> 负载均衡器 (Load Balancer) 就像是路口的**交警**。
> 面对汹涌的车流（请求），交警指挥着交通：
> *   "你，走左边车道（Server A）。"
> *   "你，走右边车道（Server B）。"
> 
> 他的目标是让所有车道都**跑满但堵死**。
> *   **Round Robin**: 轮流指。左、右、左、右... 公平但死板。
> *   **Least Connections**: 谁空闲指给谁。聪明。
> *   **IP Hash**: 认车牌。同一辆车永远指给同一条道（Session Sticky）。

```typescript
/**
 * 💡 负载均衡策略
 */

// 策略 1: 轮询 (Round Robin)
class RoundRobinLoadBalancer {
  private currentIndex = 0;
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const selected = instances[this.currentIndex % instances.length];
    this.currentIndex++;
    return selected;
  }
}

// 策略 2: 随机
class RandomLoadBalancer {
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }
}

// 策略 3: 最少连接数
class LeastConnectionsLoadBalancer {
  private connections = new Map<string, number>();
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    // 选择连接数最少的实例
    let minConnections = Infinity;
    let selectedInstance = instances[0];
    
    for (const instance of instances) {
      const connections = this.connections.get(instance.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }
    
    return selectedInstance;
  }
  
  incrementConnections(instanceId: string) {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, current + 1);
  }
  
  decrementConnections(instanceId: string) {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, Math.max(0, current - 1));
  }
}

// 策略 4: 加权轮询
interface WeightedServiceInstance extends ServiceInstance {
  weight: number;  // 权重,性能好的实例权重更高
}

class WeightedRoundRobinLoadBalancer {
  private currentWeight = 0;
  
  selectInstance(instances: WeightedServiceInstance[]): WeightedServiceInstance {
    const totalWeight = instances.reduce((sum, inst) => sum + inst.weight, 0);
    
    let selectedInstance = instances[0];
    let currentSum = 0;
    
    for (const instance of instances) {
      currentSum += instance.weight;
      if (this.currentWeight < currentSum) {
        selectedInstance = instance;
        break;
      }
    }
    
    this.currentWeight = (this.currentWeight + 1) % totalWeight;
    
    return selectedInstance;
  }
}

/**
 * 带重试和故障转移的服务客户端
 */
class ResilientServiceClient {
  constructor(
    private serviceRegistry: ServiceRegistry,
    private loadBalancer: RoundRobinLoadBalancer
  ) {}
  
  async call<T>(
    serviceName: string,
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    // 获取所有可用实例
    const instances = await this.serviceRegistry.discoverService(serviceName);
    
    if (instances.length === 0) {
      throw new Error(`没有可用的服务实例: ${serviceName}`);
    }
    
    // 尝试多个实例
    for (let i = 0; i < Math.min(maxRetries, instances.length); i++) {
      const instance = this.loadBalancer.selectInstance(instances);
      const url = `http://${instance.address}:${instance.port}${path}`;
      
      try {
        console.log(`[客户端] 调用 ${serviceName}: ${url}`);
        
        const response = await fetch(url, {
          ...options,
          // 设置超时
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json() as T;
      } catch (error: any) {
        console.error(`[客户端] 调用失败: ${url}`, error.message);
        lastError = error;
        
        // 从实例列表中移除失败的实例,尝试下一个
        const index = instances.indexOf(instance);
        instances.splice(index, 1);
        
        if (instances.length === 0) {
          break;
        }
      }
    }
    
    throw new Error(`服务调用失败: ${serviceName}, ${lastError?.message}`);
  }
}
```

---

## 5. 服务间通信

### 5.1 同步通信 - REST API

```typescript
/**
 * 💡 REST API - 最常用的同步通信方式
 */

// 服务提供方 - 用户服务
class UserServiceAPI {
  setupRoutes(app: express.Application) {
    // GET /users/:id - 获取用户
    app.get('/users/:id', async (req, res) => {
      try {
        const user = await this.userRepository.findById(req.params.id);
        
        if (!user) {
          return res.status(404).json({ error: '用户不存在' });
        }
        
        res.json(user);
      } catch (error) {
        console.error('[用户服务] 获取用户失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
      }
    });
    
    // POST /users - 创建用户
    app.post('/users', async (req, res) => {
      try {
        const user = await this.userRepository.create(req.body);
        res.status(201).json(user);
      } catch (error) {
        console.error('[用户服务] 创建用户失败:', error);
        res.status(500).json({ error: '内部服务器错误' });
      }
    });
  }
}

// 服务消费方 - 订单服务调用用户服务
class OrderService {
  constructor(
    private userServiceClient: ResilientServiceClient
  ) {}
  
  async createOrder(orderData: CreateOrderDTO) {
    // 调用用户服务验证用户
    const user = await this.userServiceClient.call<User>(
      'user-service',
      `/users/${orderData.userId}`,
      { method: 'GET' }
    );
    
    // 创建订单
    const order = await this.orderRepository.create({
      userId: user.id,
      ...orderData
    });
    
    return order;
  }
}
```

### 5.2 同步通信 - gRPC

> **🔧 Under the Hood: Protobuf & HTTP/2**
>
> *   **Protobuf (Protocol Buffers)**: 二进制序列化格式。比 JSON 小 3-10 倍，解析快 20-100 倍。
>     *   JSON: 文本解析 (Scanner/Parser)，CPU 密集。
>     *   Protobuf: 简单的内存复制和指针移动。
> *   **HTTP/2**: 多路复用 (Multiplexing)。在一个 TCP 连接上并发处理多个请求。解决了 HTTP/1.1 的 Head-of-Line Blocking 问题。
>
> **Use Case**: 内部服务间通信 (East-West traffic) 用 gRPC；外部通信 (North-South traffic) 用 REST/GraphQL。

```typescript
/**
 * 💡 gRPC - 高性能的 RPC 框架
 * 
 * 优势:
 * - 使用 Protocol Buffers,序列化性能高
 * - 支持双向流
 * - 类型安全
 * - 多语言支持
 */

// 1. 定义 Protocol Buffer (user.proto)
/*
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  string user_id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message ListUsersRequest {
  int32 limit = 1;
  int32 offset = 2;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  string created_at = 4;
}
*/

// 2. 服务端实现
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

class UserServiceGRPC {
  private server: grpc.Server;
  
  constructor(private userRepository: UserRepository) {
    this.server = new grpc.Server();
    this.loadProtoAndRegister();
  }
  
  private loadProtoAndRegister() {
    const packageDefinition = protoLoader.loadSync('./proto/user.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    
    const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;
    
    this.server.addService(userProto.UserService.service, {
      GetUser: this.getUser.bind(this),
      CreateUser: this.createUser.bind(this),
      ListUsers: this.listUsers.bind(this)
    });
  }
  
  /**
   * 实现 GetUser RPC
   */
  private async getUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      const userId = call.request.user_id;
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: '用户不存在'
        });
      }
      
      callback(null, user);
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }
  
  /**
   * 实现 CreateUser RPC
   */
  private async createUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      const user = await this.userRepository.create(call.request);
      callback(null, user);
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }
  
  /**
   * 实现 ListUsers RPC - 流式响应
   */
  private async listUsers(call: grpc.ServerWritableStream<any, any>) {
    try {
      const { limit, offset } = call.request;
      const users = await this.userRepository.findMany({ limit, offset });
      
      // 逐个发送用户数据
      for (const user of users) {
        call.write(user);
      }
      
      call.end();
    } catch (error: any) {
      call.destroy(new Error(error.message));
    }
  }
  
  start(port: number) {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('[gRPC] 启动失败:', error);
          return;
        }
        console.log(`[gRPC] 服务运行在端口 ${port}`);
        this.server.start();
      }
    );
  }
}

// 3. 客户端实现
class UserServiceGRPCClient {
  private client: any;
  
  constructor(serviceAddress: string) {
    const packageDefinition = protoLoader.loadSync('./proto/user.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    
    const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;
    
    this.client = new userProto.UserService(
      serviceAddress,
      grpc.credentials.createInsecure()
    );
  }
  
  async getUser(userId: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.client.GetUser({ user_id: userId }, (error: any, user: User) => {
        if (error) {
          reject(error);
        } else {
          resolve(user);
        }
      });
    });
  }
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    return new Promise((resolve, reject) => {
      this.client.CreateUser(userData, (error: any, user: User) => {
        if (error) {
          reject(error);
        } else {
          resolve(user);
        }
      });
    });
  }
  
  async listUsers(limit: number, offset: number): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const users: User[] = [];
      
      const call = this.client.ListUsers({ limit, offset });
      
      call.on('data', (user: User) => {
        users.push(user);
      });
      
      call.on('end', () => {
        resolve(users);
      });
      
      call.on('error', (error: any) => {
        reject(error);
      });
    });
  }
}

// 使用示例
const grpcClient = new UserServiceGRPCClient('localhost:50051');
const user = await grpcClient.getUser('user-123');
```

### 5.3 异步通信 - 消息队列

```typescript
/**
 * 💡 消息队列 - 异步解耦的通信方式
 * 
 * 优势:
 * - 异步处理,不阻塞主流程
 * - 削峰填谷,应对流量峰值
 * - 服务解耦,发送方和接收方独立
 * - 可靠性,消息持久化防止丢失
 */

// 使用 RabbitMQ
import * as amqp from 'amqplib';

class MessageQueue {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  
  async connect(url: string = 'amqp://localhost') {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    
    console.log('[消息队列] 已连接到 RabbitMQ');
  }
  
  /**
   * 发布消息到交换机
   */
  async publish(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error('消息队列未连接');
    }
    
    // 确保交换机存在
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    
    // 发布消息
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,  // 持久化消息
        timestamp: Date.now(),
        contentType: 'application/json'
      }
    );
    
    console.log(`[消息队列] 发布消息: ${exchange}.${routingKey}`, message);
  }
  
  /**
   * 订阅消息
   */
  async subscribe(
    exchange: string,
    queueName: string,
    routingKeys: string[],
    handler: (message: any) => Promise<void>
  ) {
    if (!this.channel) {
      throw new Error('消息队列未连接');
    }
    
    // 确保交换机存在
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    
    // 创建队列
    await this.channel.assertQueue(queueName, { durable: true });
    
    // 绑定路由键
    for (const routingKey of routingKeys) {
      await this.channel.bindQueue(queueName, exchange, routingKey);
    }
    
    // 设置预取数量 - 一次只处理一条消息
    await this.channel.prefetch(1);
    
    // 消费消息
    await this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`[消息队列] 收到消息: ${msg.fields.routingKey}`, content);
          
          // 处理消息
          await handler(content);
          
          // 确认消息
          this.channel!.ack(msg);
        } catch (error) {
          console.error('[消息队列] 处理消息失败:', error);
          
          // 拒绝消息并重新入队
          this.channel!.nack(msg, false, true);
        }
      },
      { noAck: false }  // 手动确认
    );
    
    console.log(`[消息队列] 开始监听队列: ${queueName}`);
  }
  
  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

/**
 * 🚀 实战示例: 订单系统使用消息队列
 */

// 订单服务 - 发布订单事件
class OrderServiceWithMQ {
  constructor(
    private orderRepository: OrderRepository,
    private messageQueue: MessageQueue
  ) {}
  
  async createOrder(orderData: CreateOrderDTO) {
    // 1. 创建订单
    const order = await this.orderRepository.create({
      ...orderData,
      status: 'PENDING'
    });
    
    console.log('[订单服务] 订单已创建:', order.id);
    
    // 2. 发布订单创建事件
    await this.messageQueue.publish(
      'orders',  // 交换机
      'order.created',  // 路由键
      {
        orderId: order.id,
        userId: order.userId,
        items: order.items,
        total: order.total,
        timestamp: new Date().toISOString()
      }
    );
    
    return order;
  }
}

// 支付服务 - 订阅订单事件
class PaymentServiceWithMQ {
  constructor(
    private paymentRepository: PaymentRepository,
    private messageQueue: MessageQueue
  ) {}
  
  async start() {
    // 订阅订单创建事件
    await this.messageQueue.subscribe(
      'orders',           // 交换机
      'payment-service',  // 队列名称
      ['order.created'],  // 路由键
      this.handleOrderCreated.bind(this)
    );
  }
  
  private async handleOrderCreated(event: any) {
    console.log('[支付服务] 处理订单创建事件:', event.orderId);
    
    try {
      // 处理支付
      const payment = await this.processPayment(event);
      
      // 发布支付成功事件
      await this.messageQueue.publish(
        'payments',
        'payment.completed',
        {
          orderId: event.orderId,
          paymentId: payment.id,
          amount: event.total,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('[支付服务] 支付失败:', error);
      
      // 发布支付失败事件
      await this.messageQueue.publish(
        'payments',
        'payment.failed',
        {
          orderId: event.orderId,
          reason: (error as Error).message,
          timestamp: new Date().toISOString()
        }
      );
    }
  }
  
  private async processPayment(event: any) {
    // 支付处理逻辑
    return await this.paymentRepository.create({
      orderId: event.orderId,
      amount: event.total,
      status: 'SUCCESS'
    });
  }
}

// 通知服务 - 订阅支付事件
class NotificationServiceWithMQ {
  constructor(
    private emailService: EmailService,
    private messageQueue: MessageQueue
  ) {}
  
  async start() {
    // 订阅支付相关事件
    await this.messageQueue.subscribe(
      'payments',
      'notification-service',
      ['payment.completed', 'payment.failed'],
      this.handlePaymentEvent.bind(this)
    );
  }
  
  private async handlePaymentEvent(event: any) {
    const routingKey = event.type;
    
    if (routingKey === 'payment.completed') {
      await this.sendPaymentSuccessEmail(event);
    } else if (routingKey === 'payment.failed') {
      await this.sendPaymentFailureEmail(event);
    }
  }
  
  private async sendPaymentSuccessEmail(event: any) {
    console.log('[通知服务] 发送支付成功邮件:', event.orderId);
    // 发送邮件逻辑
  }
  
  private async sendPaymentFailureEmail(event: any) {
    console.log('[通知服务] 发送支付失败邮件:', event.orderId);
    // 发送邮件逻辑
  }
}
```

---

## 6. 分布式事务

### 6.1 分布式事务的挑战

```typescript
/**
 * ⚠️ 分布式事务问题
 * 
 * 场景: 用户下单需要:
 * 1. 创建订单 (订单服务/订单数据库)
 * 2. 扣减库存 (库存服务/库存数据库)
 * 3. 扣减余额 (用户服务/用户数据库)
 * 
 * 问题: 如果第 3 步失败,前两步已经执行,数据不一致!
 * 
 * 传统解决方案: 数据库事务 (ACID)
 * ❌ 无法使用,因为数据在不同的数据库中
 * 
 * 分布式解决方案:
 * 1. 两阶段提交 (2PC) - 强一致性,性能差
 * 2. 三阶段提交 (3PC) - 改进版 2PC
 * 3. Saga 模式 - 最终一致性,性能好
 * 4. TCC 模式 - Try-Confirm-Cancel
 */
```

### 6.2 Saga 模式实现

> **🏛️ Pattern: Event Sourcing & CQRS**
>
> *   **Event Sourcing (事件溯源)**: 不存当前状态，只存状态变更事件 (Events)。当前状态 = `reduce(events)`。
>     *   优势: 完美的审计日志，可回溯任意时间点状态。
>     *   劣势: 查询慢 (需要 Snapshot)。
> *   **CQRS (Command Query Responsibility Segregation)**: 读写分离。
>     *   Write Model: 针对高并发写入优化 (Event Store)。
>     *   Read Model: 针对查询优化 (Materialized Views, Elasticsearch)。
>     *   Sync: 通过 Event Bus 异步更新 Read Model (最终一致性)。

```typescript
/**
 * 💡 Saga 模式
 * 
 * 原理: 将分布式事务拆分为一系列本地事务
 * - 每个本地事务更新数据库并发布事件
 * - 如果某个步骤失败,执行补偿事务回滚之前的操作
 * 
 * 两种实现方式:
 * 1. 编排式 (Orchestration) - 中央协调器
 * 2. 编排式 (Choreography) - 事件驱动
 */

// 方式 1: 编排式 Saga - 使用中央协调器
class OrderSagaOrchestrator {
  constructor(
    private orderService: OrderServiceClient,
    private inventoryService: InventoryServiceClient,
    private paymentService: PaymentServiceClient,
    private sagaRepository: SagaRepository
  ) {}
  
  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    // 创建 Saga 实例
    const saga = await this.sagaRepository.create({
      type: 'CREATE_ORDER',
      data: orderData,
      status: 'STARTED',
      steps: []
    });
    
    try {
      // 步骤 1: 创建订单
      console.log('[Saga] 步骤 1: 创建订单');
      const order = await this.orderService.createOrder(orderData);
      await this.sagaRepository.addStep(saga.id, {
        name: 'CREATE_ORDER',
        status: 'COMPLETED',
        data: { orderId: order.id }
      });
      
      try {
        // 步骤 2: 预留库存
        console.log('[Saga] 步骤 2: 预留库存');
        const reservation = await this.inventoryService.reserveStock({
          productId: orderData.productId,
          quantity: orderData.quantity
        });
        await this.sagaRepository.addStep(saga.id, {
          name: 'RESERVE_STOCK',
          status: 'COMPLETED',
          data: { reservationId: reservation.id }
        });
        
        try {
          // 步骤 3: 处理支付
          console.log('[Saga] 步骤 3: 处理支付');
          const payment = await this.paymentService.processPayment({
            orderId: order.id,
            amount: order.total
          });
          await this.sagaRepository.addStep(saga.id, {
            name: 'PROCESS_PAYMENT',
            status: 'COMPLETED',
            data: { paymentId: payment.id }
          });
          
          // 所有步骤成功
          console.log('[Saga] 所有步骤完成');
          await this.sagaRepository.updateStatus(saga.id, 'COMPLETED');
          
          // 步骤 4: 确认库存扣减
          await this.inventoryService.confirmReservation(reservation.id);
          
          // 步骤 5: 更新订单状态
          await this.orderService.markAsPaid(order.id);
          
          return order;
        } catch (error) {
          // 支付失败 - 补偿步骤 2
          console.log('[Saga] 支付失败,开始补偿');
          await this.compensateReserveStock(reservation.id, saga.id);
          throw error;
        }
      } catch (error) {
        // 库存预留失败 - 补偿步骤 1
        console.log('[Saga] 库存预留失败,开始补偿');
        await this.compensateCreateOrder(order.id, saga.id);
        throw error;
      }
    } catch (error) {
      // 订单创建失败 - 直接失败
      console.log('[Saga] Saga 失败');
      await this.sagaRepository.updateStatus(saga.id, 'FAILED');
      throw error;
    }
  }
  
  /**
   * 补偿事务: 取消订单
   */
  private async compensateCreateOrder(orderId: string, sagaId: string) {
    console.log('[Saga] 补偿: 取消订单', orderId);
    
    try {
      await this.orderService.cancelOrder(orderId);
      await this.sagaRepository.addStep(sagaId, {
        name: 'COMPENSATE_CREATE_ORDER',
        status: 'COMPLETED',
        data: { orderId }
      });
    } catch (error) {
      console.error('[Saga] 补偿失败:', error);
      // 记录补偿失败,需要人工介入
      await this.sagaRepository.addStep(sagaId, {
        name: 'COMPENSATE_CREATE_ORDER',
        status: 'FAILED',
        data: { orderId, error: (error as Error).message }
      });
    }
  }
  
  /**
   * 补偿事务: 释放库存
   */
  private async compensateReserveStock(reservationId: string, sagaId: string) {
    console.log('[Saga] 补偿: 释放库存', reservationId);
    
    try {
      await this.inventoryService.cancelReservation(reservationId);
      await this.sagaRepository.addStep(sagaId, {
        name: 'COMPENSATE_RESERVE_STOCK',
        status: 'COMPLETED',
        data: { reservationId }
      });
    } catch (error) {
      console.error('[Saga] 补偿失败:', error);
      await this.sagaRepository.addStep(sagaId, {
        name: 'COMPENSATE_RESERVE_STOCK',
        status: 'FAILED',
        data: { reservationId, error: (error as Error).message }
      });
    }
  }
}

// Saga 状态存储
interface SagaStep {
  name: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  data: any;
  timestamp: Date;
}

interface SagaInstance {
  id: string;
  type: string;
  status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'COMPENSATING';
  data: any;
  steps: SagaStep[];
  createdAt: Date;
  updatedAt: Date;
}

class SagaRepository {
  async create(saga: Omit<SagaInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<SagaInstance> {
    // 保存到数据库
    return { ...saga, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
  }
  
  async addStep(sagaId: string, step: Omit<SagaStep, 'timestamp'>): Promise<void> {
    // 添加步骤到数据库
  }
  
  async updateStatus(sagaId: string, status: SagaInstance['status']): Promise<void> {
    // 更新 Saga 状态
  }
  
  async findById(sagaId: string): Promise<SagaInstance | null> {
    // 从数据库查询
    return null;
  }
}

// 方式 2: 编排式 Saga - 事件驱动
/**
 * 💡 编排式 Saga 实现
 * 
 * 流程:
 * 1. 订单服务创建订单,发布 order.created 事件
 * 2. 库存服务监听事件,预留库存,发布 stock.reserved 事件
 * 3. 支付服务监听事件,处理支付,发布 payment.completed 事件
 * 4. 订单服务监听事件,更新订单状态
 * 
 * 如果任何步骤失败,发布相应的补偿事件
 */

class OrderServiceChoreography {
  constructor(
    private orderRepository: OrderRepository,
    private messageQueue: MessageQueue
  ) {
    this.setupEventHandlers();
  }
  
  async createOrder(orderData: CreateOrderDTO) {
    // 创建订单
    const order = await this.orderRepository.create({
      ...orderData,
      status: 'PENDING'
    });
    
    // 发布事件
    await this.messageQueue.publish('saga', 'order.created', {
      orderId: order.id,
      productId: orderData.productId,
      quantity: orderData.quantity,
      amount: order.total
    });
    
    return order;
  }
  
  private setupEventHandlers() {
    // 监听支付完成事件
    this.messageQueue.subscribe(
      'saga',
      'order-service-saga',
      ['payment.completed', 'stock.reservation.failed', 'payment.failed'],
      async (event: any) => {
        const routingKey = event.type;
        
        if (routingKey === 'payment.completed') {
          // 更新订单状态为已支付
          await this.orderRepository.updateStatus(event.orderId, 'PAID');
        } else if (routingKey === 'stock.reservation.failed' || routingKey === 'payment.failed') {
          // 取消订单
          await this.orderRepository.updateStatus(event.orderId, 'CANCELLED');
        }
      }
    );
  }
}

class InventoryServiceChoreography {
  constructor(
    private inventoryRepository: InventoryRepository,
    private messageQueue: MessageQueue
  ) {
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // 监听订单创建事件
    this.messageQueue.subscribe(
      'saga',
      'inventory-service-saga',
      ['order.created', 'payment.failed'],
      async (event: any) => {
        const routingKey = event.type;
        
        if (routingKey === 'order.created') {
          try {
            // 预留库存
            const reservation = await this.inventoryRepository.reserveStock(
              event.productId,
              event.quantity
            );
            
            // 发布库存预留成功事件
            await this.messageQueue.publish('saga', 'stock.reserved', {
              orderId: event.orderId,
              reservationId: reservation.id,
              amount: event.amount
            });
          } catch (error) {
            // 发布库存预留失败事件
            await this.messageQueue.publish('saga', 'stock.reservation.failed', {
              orderId: event.orderId,
              reason: (error as Error).message
            });
          }
        } else if (routingKey === 'payment.failed') {
          // 补偿: 释放库存
          await this.inventoryRepository.cancelReservation(event.reservationId);
        }
      }
    );
  }
}
```

---

## 7. 监控和追踪

### 7.1 分布式追踪

```typescript
/**
 * 💡 分布式追踪 (Distributed Tracing)
 * 
 * 问题: 一个请求可能经过多个服务,如何追踪完整的调用链路?
 * 
 * 解决方案: 使用 OpenTelemetry 进行分布式追踪
 */

import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

/**
 * 初始化追踪
 */
function initTracing(serviceName: string) {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });
  
  // 导出到 Jaeger
  const exporter = new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  });
  
  provider.addSpanProcessor(new SpanProcessor(exporter));
  provider.register();
  
  console.log(`[追踪] 服务 ${serviceName} 追踪已初始化`);
}

/**
 * Express 中间件 - 自动创建 span
 */
function tracingMiddleware(serviceName: string) {
  const tracer = trace.getTracer(serviceName);
  
  return (req: Request, res: Response, next: NextFunction) => {
    // 从请求头中提取追踪上下文
    const traceId = req.header('X-Trace-Id') || generateTraceId();
    const spanId = req.header('X-Span-Id') || generateSpanId();
    const parentSpanId = req.header('X-Parent-Span-Id');
    
    // 创建 span
    const span = tracer.startSpan(`${req.method} ${req.path}`, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.target': req.path,
        'http.user_agent': req.get('user-agent'),
      }
    });
    
    // 将 span 放入上下文
    const ctx = trace.setSpan(context.active(), span);
    
    // 记录响应
    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode);
      
      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`
        });
      }
      
      span.end();
    });
    
    // 继续处理请求
    context.with(ctx, () => next());
  };
}

/**
 * 服务间调用时传递追踪上下文
 */
class TracedHttpClient {
  async call(url: string, options: RequestInit = {}) {
    const tracer = trace.getTracer('http-client');
    const span = tracer.startSpan(`HTTP ${options.method || 'GET'}`);
    
    try {
      // 将追踪上下文注入请求头
      const headers = {
        ...options.headers,
        'X-Trace-Id': span.spanContext().traceId,
        'X-Span-Id': span.spanContext().spanId,
        'X-Parent-Span-Id': getCurrentSpanId()
      };
      
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      span.setAttribute('http.status_code', response.status);
      span.setStatus({ code: SpanStatusCode.OK });
      
      return response;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

### 7.2 指标监控

```typescript
/**
 * 💡 Prometheus 指标监控
 */
import promClient from 'prom-client';

class MetricsCollector {
  private register: promClient.Registry;
  
  // HTTP 请求计数器
  private httpRequestCounter: promClient.Counter;
  
  // HTTP 请求延迟直方图
  private httpRequestDuration: promClient.Histogram;
  
  // 活跃连接数
  private activeConnections: promClient.Gauge;
  
  // 数据库查询延迟
  private dbQueryDuration: promClient.Histogram;
  
  constructor(serviceName: string) {
    this.register = new promClient.Registry();
    
    // 添加默认指标
    promClient.collectDefaultMetrics({ register: this.register });
    
    // HTTP 请求计数
    this.httpRequestCounter = new promClient.Counter({
      name: `${serviceName}_http_requests_total`,
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register]
    });
    
    // HTTP 请求延迟
    this.httpRequestDuration = new promClient.Histogram({
      name: `${serviceName}_http_request_duration_seconds`,
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register]
    });
    
    // 活跃连接数
    this.activeConnections = new promClient.Gauge({
      name: `${serviceName}_active_connections`,
      help: 'Number of active connections',
      registers: [this.register]
    });
    
    // 数据库查询延迟
    this.dbQueryDuration = new promClient.Histogram({
      name: `${serviceName}_db_query_duration_seconds`,
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register]
    });
  }
  
  /**
   * 记录 HTTP 请求
   */
  recordHttpRequest(method: string, path: string, statusCode: number, duration: number) {
    this.httpRequestCounter.labels(method, path, statusCode.toString()).inc();
    this.httpRequestDuration.labels(method, path, statusCode.toString()).observe(duration);
  }
  
  /**
   * 更新活跃连接数
   */
  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }
  
  /**
   * 记录数据库查询
   */
  recordDbQuery(operation: string, table: string, duration: number) {
    this.dbQueryDuration.labels(operation, table).observe(duration);
  }
  
  /**
   * 获取指标
   */
  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }
}

/**
 * Express 中间件 - 收集 HTTP 指标
 */
function metricsMiddleware(metricsCollector: MetricsCollector) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    metricsCollector.setActiveConnections(
      metricsCollector['activeConnections'].hashMap[''].value + 1
    );
    
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      
      metricsCollector.recordHttpRequest(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      );
      
      metricsCollector.setActiveConnections(
        metricsCollector['activeConnections'].hashMap[''].value - 1
      );
    });
    
    next();
  };
}

/**
 * 暴露指标端点
 */
function setupMetricsEndpoint(app: express.Application, collector: MetricsCollector) {
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await collector.getMetrics());
  });
}
```

---

## 8. 总结和最佳实践

### 8.1 微服务架构最佳实践

```typescript
/**
 * ✅ 微服务架构最佳实践清单
 */

const microservicesBestPractices = {
  // 1. 服务拆分
  serviceSplitting: {
    principles: [
      '按业务能力拆分,而不是技术层次',
      '保持服务的独立性和自治性',
      '避免过度拆分,保持适当的粒度',
      '服务应该有清晰的边界和职责'
    ],
    antiPatterns: [
      '❌ 按数据库表拆分服务',
      '❌ 服务之间频繁的循环依赖',
      '❌ 服务拆分过细,增加复杂度'
    ]
  },
  
  // 2. 数据管理
  dataManagement: {
    principles: [
      '每个服务拥有自己的数据库',
      '通过 API 访问其他服务的数据',
      '使用事件来保持数据同步',
      '接受最终一致性'
    ],
    antiPatterns: [
      '❌ 多个服务共享同一个数据库',
      '❌ 直接访问其他服务的数据库',
      '❌ 分布式事务'
    ]
  },
  
  // 3. 通信
  communication: {
    principles: [
      '同步调用用于请求-响应(REST/gRPC)',
      '异步消息用于事件通知',
      '实现超时和重试机制',
      '使用断路器防止级联失败'
    ],
    patterns: [
      'API 网关统一入口',
      '服务发现动态路由',
      '客户端负载均衡',
      '消息队列解耦服务'
    ]
  },
  
  // 4. 弹性和容错
  resilience: {
    principles: [
      '实现健康检查端点',
      '使用断路器模式',
      '实现优雅降级',
      '记录详细日志'
    ],
    patterns: [
      '重试机制',
      '超时控制',
      '舱壁模式',
      '限流和熔断'
    ]
  },
  
  // 5. 监控和可观测性
  observability: {
    required: [
      '分布式追踪 (Jaeger/Zipkin)',
      '指标监控 (Prometheus)',
      '日志聚合 (ELK/Loki)',
      '健康检查和告警'
    ],
    metrics: [
      '请求速率',
      '错误率',
      '响应延迟',
      '系统资源使用'
    ]
  },
  
  // 6. 部署和运维
  deployment: {
    practices: [
      '容器化 (Docker)',
      '容器编排 (Kubernetes)',
      'CI/CD 自动化',
      '蓝绿部署或金丝雀发布',
      '版本化 API'
    ]
  }
};
```

### 8.2 常见陷阱和解决方案

```typescript
/**
 * ⚠️ 常见陷阱和解决方案
 */

const commonPitfalls = [
  {
    problem: '分布式单体 (Distributed Monolith)',
    description: '虽然拆分了服务,但服务之间紧密耦合,必须一起部署',
    solution: [
      '减少服务间的同步调用',
      '使用异步消息解耦',
      '确保服务可以独立部署',
      '避免共享数据库'
    ]
  },
  {
    problem: '过度拆分',
    description: '服务拆分太细,导致管理复杂度急剧上升',
    solution: [
      '从较大的服务开始,根据需要逐步拆分',
      '合并紧密耦合的服务',
      '权衡复杂度和收益'
    ]
  },
  {
    problem: '数据一致性问题',
    description: '分布式环境下难以保证强一致性',
    solution: [
      '接受最终一致性',
      '使用 Saga 模式处理分布式事务',
      '实现补偿机制',
      '记录所有状态变更'
    ]
  },
  {
    problem: '级联失败',
    description: '一个服务故障导致整个系统瘫痪',
    solution: [
      '实现断路器',
      '设置合理的超时',
      '使用限流保护服务',
      '实现优雅降级'
    ]
  },
  {
    problem: '监控和调试困难',
    description: '请求跨越多个服务,难以定位问题',
    solution: [
      '实现分布式追踪',
      '使用关联 ID 追踪请求',
      '集中化日志管理',
      '建立完善的监控体系'
    ]
  }
];
```

---

## 9. 练习题

### 练习 1: 服务拆分设计

**问题:** 设计一个社交媒体平台的微服务架构,包含以下功能:
- 用户管理(注册、登录、个人资料)
- 帖子发布和浏览
- 评论和点赞
- 关注和粉丝
- 消息通知
- 内容推荐

**要求:**
1. 识别核心业务能力
2. 设计服务边界
3. 定义服务间的通信方式
4. 说明数据存储策略

### 练习 2: API 网关实现

**问题:** 实现一个 API 网关,支持:
- 请求路由
- 认证和授权
- 限流(每分钟 100 个请求)
- 请求日志
- 断路器

### 练习 3: Saga 模式

**问题:** 实现一个旅游预订系统的 Saga:
1. 预订航班
2. 预订酒店
3. 预订租车
4. 处理支付

如果任何步骤失败,需要取消之前的预订。

### 练习 4: 服务发现

**问题:** 实现一个简单的服务注册中心,支持:
- 服务注册
- 服务发现
- 健康检查
- 自动注销不健康的服务

---

## 10. 延伸阅读

### 推荐书籍
- 《微服务设计》 by Sam Newman
- 《微服务架构设计模式》 by Chris Richardson
- 《构建微服务》 by Sam Newman

### 在线资源
- [Microservices.io](https://microservices.io/) - 微服务模式大全
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Kubernetes 官方文档](https://kubernetes.io/docs/)

### 工具和框架
- **服务框架:** NestJS, Express, Fastify
- **服务发现:** Consul, Etcd
- **API 网关:** Kong, Traefik
- **消息队列:** RabbitMQ, Kafka
- **监控:** Prometheus, Grafana, Jaeger

---

**下一章:** [第 2 章 - 数据库和 ORM](../02-database-orm/)
```

由于内容非常详实,我将继续创建剩余的章节。让我继续编写第 2 章 - 数据库和 ORM:

由于内容非常长,我需要分批创建文件。让我继续创建各章节的内容。现在让我创建完整的项目文档和练习题,然后更新进度追踪文档。

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[
  {
    "id": "1",
    "content": "创建阶段 4 目录结构和主 README.md",
    "status": "completed"
  },
  {
    "id": "2",
    "content": "编写第 1 章: 微服务架构 (01-microservices/README.md)",
    "status": "in_progress"
  },
  {
    "id": "3",
    "content": "编写第 2 章: 数据库和 ORM (02-database-orm/README.md)",
    "status": "pending"
  },
  {
    "id": "4",
    "content": "编写第 3 章: 安全 (03-security/README.md)",
    "status": "pending"
  },
  {
    "id": "5",
    "content": "编写第 4 章: DevOps 和部署 (04-devops-deployment/README.md)",
    "status": "pending"
  },
  {
    "id": "6",
    "content": "编写第 5 章: 前端高级 (05-frontend-advanced/README.md)",
    "status": "pending"
  },
  {
    "id": "7",
    "content": "编写第 6 章: 系统设计 (06-system-design/README.md)",
    "status": "pending"
  },
  {
    "id": "8",
    "content": "编写全栈电商平台项目指南 (projects/ecommerce-platform/README.md)",
    "status": "pending"
  },
  {
    "id": "9",
    "content": "编写练习题和评估 (exercises/README.md)",
    "status": "pending"
  },
  {
    "id": "10",
    "content": "更新任务追踪文档,标记阶段 4 任务为已完成",
    "status": "pending"
  }
]