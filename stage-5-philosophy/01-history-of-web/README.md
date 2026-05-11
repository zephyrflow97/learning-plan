# 第 1 章：钟摆的暴力 —— Web 演进简史

> **"History doesn't repeat itself, but it often rhymes."**  
> —— Mark Twain

## 1. 引言：算力的引力场

计算机科学的历史，本质上是一部**算力（Compute）**在"集中"与"分布"之间不断摇摆的历史。这种摇摆不是随机的，它受制于两个物理常数的博弈：**带宽（Bandwidth）**与**延迟（Latency）**。

每隔十年，这个巨大的钟摆就会带着毁灭性的力量砸向另一端，粉碎旧的王者，通过新的霸主。

作为一名 Web 工程师，如果你看不懂这个钟摆，你就会永远疲于奔命地追逐新框架。如果你看懂了，你就会发现，Next.js 今天的"创新"，不过是 1970 年代 IBM Mainframe 的一次回响。

---

## 2. 史前时代：大型机的幽灵 (1960s - 1980s)
**状态**：极度集中 (Centralized)

在个人电脑诞生之前，算力是昂贵的稀缺资源。IBM System/360 像神像一样供奉在恒温的机房里，而终端（Terminal）只是一个没有任何计算能力的显示器和键盘（Dumb Terminal）。

### 2.1 绿屏与块模式 (Block Mode)

你可能在老电影里见过黑客对着满屏绿字的屏幕敲击。那不仅仅是 UI 风格，那是**IBM 3270** 协议的遗产。

在那个时代，每一次按键都发送给服务器是极其昂贵的（中断处理成本太高）。所以，终端工作在**块模式 (Block Mode)** 下：
1.  主机发送一个表单定义给终端。
2.  用户在本地终端填写表单，光标在字段间跳动。此时**没有任何数据发往主机**。
3.  用户按下 `Enter` 键。
4.  终端将整屏数据打包，一次性发送给主机。

这听起来是不是很耳熟？是的，这就是 HTML `<form>` 提交的原型。

### 2.2 提线木偶的隐喻

在这种架构下，所有的逻辑、状态、渲染都在服务器端完成。终端只负责显示字符。

*   **架构模式**：Host-Terminal。
*   **隐喻**：这就像是**提线木偶**。木偶（终端）的一举一动，完全由幕后的操纵者（主机）控制。

这听起来很遥远？不。看看今天的 **Cloud Gaming (云游戏)** 或者 **ChatGPT**。当你的浏览器只负责显示 Token，而所有的智能都在 OpenAI 的服务器上时，我们又回到了大型机时代。

---

## 3. 第一纪元：CS 架构与胖客户端 (1990s)
**状态**：极度分散 (Decentralized)

摩尔定律让个人电脑（PC）的算力爆发。英特尔和微软联手，把算力塞进了每个人的办公桌。既然客户端有了算力，为什么要浪费带宽去服务器请求界面呢？

### 3.1 胖客户端的崛起

Client-Server (C/S) 架构应运而生。
*   **客户端 (Client)**：运行在 Windows 上的 `.exe` 程序（用 VB, Delphi, C++ 编写）。负责绘制 UI、处理业务逻辑、甚至缓存数据。
*   **服务端 (Server)**：退化为单纯的数据库（SQL Server, Oracle）。

这种架构的用户体验极佳。界面响应是毫秒级的，因为不需要网络请求就能响应鼠标点击。

### 3.2 部署地狱 (DLL Hell)

然而，这种架构有一个致命的阿喀琉斯之踵：**分发 (Distribution)**。

想象一下，你是一个银行系统的开发者，你修了一个严重的利息计算 Bug。
1.  你需要重新编译 `.exe`。
2.  你需要把这个文件刻录成光盘，或者通过龟速的局域网分发给 10,000 个柜员。
3.  如果用户的电脑上缺了一个 `MSVCRT.DLL`，或者版本不对，程序就会崩溃。这就是臭名昭著的 **DLL Hell**。

在这个时代，**运维成本**成为了瓶颈。

---

## 4. 第二纪元：Web 1.0 与瘦客户端的复辟 (1995 - 2004)
**状态**：回归集中 (Centralized)

为了解决"部署地狱"，Tim Berners-Lee 的发明被 Netscape 商业化了。浏览器出现了。

突然间，我们又回到了"大型机模式"。

### 4.1 CGI：胶水代码的时代

Web 1.0 的核心技术是 **CGI (Common Gateway Interface)**。它不是一种语言，而是一种协议。它规定了 Web 服务器如何把 HTTP 请求转交给外部程序（通常是 Perl 或 C 脚本）。

让我们看一段 1996 年风格的 Perl CGI 代码：

```perl
#!/usr/bin/perl
use CGI;

$query = new CGI;
$name = $query->param('user_name');

print "Content-type: text/html\n\n";
print "<html><body>";
print "<h1>Hello, $name!</h1>";
print "</body></html>";
```

这段代码揭示了 Web 1.0 的本质：
1.  **无状态**：脚本运行完就退出了，内存释放。下一次请求一切重来。
2.  **字符串拼接**：整个互联网就是由无数个 `print` 语句拼接出来的字符串。
3.  **整页刷新**：用户点击一个按钮，浏览器必须丢弃当前页面，重新下载并渲染整个新页面。

### 4.2 为什么这是退步？

从用户体验角度，这是巨大的倒退。相比于 VB/Delphi 写出的原生应用，Web 1.0 慢、卡、丑，每次操作都要白屏。

### 4.3 为什么它赢了？

因为它解决了**分发**问题。
更新服务器上的一个 `index.pl` 文件，全世界用户的软件就瞬间更新了。没有安装过程，没有 DLL 冲突。

在软件工程中，**分发效率往往战胜运行效率**。这就是为什么 Web 最终吞噬了桌面软件。

---

## 5. 第三纪元：Ajax 与 Web 2.0 的反叛 (2005 - 2010)
**状态**：向客户端倾斜

2005 年 2 月，Jesse James Garrett 发表了那篇著名的文章《Ajax: A New Approach to Web Applications》。他并没有发明新技术，他只是发现了 `XMLHttpRequest` 这个被埋没在 IE5 中的组件。

### 5.1 Google Maps 的震撼

在此之前，地图网站（如 MapQuest）是这样的：你想看右边的地图，点击"向右"，页面白屏刷新，加载新图片。
Google Maps 发布时，用户发现，**拖动地图时，页面竟然没有刷新！**

这在当时是魔法。

### 5.2 幕后的魔法：XMLHttpRequest

让我们看看在 jQuery 诞生之前，原生的 Ajax 代码是多么丑陋，但这丑陋中孕育着革命：

```javascript
var xhr;
if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
} else {
    // IE6 的遗产
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
}

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
        // 局部更新 DOM，而不是整页刷新
        document.getElementById("content").innerHTML = xhr.responseText;
    }
};

xhr.open("GET", "/api/data", true);
xhr.send();
```

*   **隐喻变化**：网页不再是**文档 (Document)**，而是**应用 (Application)**。
*   **架构影响**：服务器不再只吐 HTML，开始吐 XML（后来变成了 JSON）。浏览器开始承担部分渲染逻辑。

---

## 6. 第四纪元：SPA 与 胖客户端的重生 (2010 - 2020)
**状态**：极度分散 (Decentralized)

iPhone 发布，V8 引擎发布。客户端算力再次过剩。AngularJS (2010) 和 React (2013) 登场。

工程师们想："既然浏览器这么快，我们为什么不把整个应用都搬到浏览器里呢？"
于是，**Single Page Application (SPA)** 诞生了。

### 6.1 历史的押韵

SPA 的架构其实就是 90 年代 C/S 架构的复辟！
*   **Client**: 变成了运行在浏览器里的 JavaScript Bundle。
*   **Server**: 退化为 API Server，只吐 JSON。
*   **Routing**: 以前是服务器决定你看哪个页面，现在是客户端 JS 决定。

### 6.2 分布式系统的谬误

SPA 架构隐含了一个危险的假设：**网络是可靠的**。
但实际上，网络不仅不可靠，而且有延迟。

*   **瀑布流请求 (Waterfall Requests)**：
    SPA 加载流程通常是：下载 JS -> 解析 JS -> 请求 User API -> 请求 Posts API -> 渲染。
    这导致了严重的 **TTI (Time to Interactive)** 延迟。
*   **SEO 死亡**：爬虫抓不到内容。
*   **首屏性能 (FCP) 崩溃**：用户必须下载 5MB 的 JS 文件，页面才能动。

为了解决这些问题，我们发明了 Webpack，发明了 Code Splitting，发明了 Hydration。前端工程变得比后端还复杂。

---

## 7. 第五纪元：边缘计算与同构 (2020 - 未来)
**状态**：量子态 (Superposition)

钟摆又荡回来了，但这次它不再是非黑即白。
Next.js, Remix, Server Components 的出现，标志着 **Isomorphic (同构)** 时代的到来。

### 7.1 React Server Components (RSC)

RSC 是这一趋势的终极体现。让我们对比一下 PHP 和 RSC：

**PHP (1995):**
```php
<ul>
  <?php foreach ($db->query('SELECT * FROM users') as $user): ?>
    <li><?= $user->name ?></li>
  <?php endforeach; ?>
</ul>
```

**React Server Component (2023):**
```jsx
// app/users/page.js
async function Users() {
  const users = await db.query('SELECT * FROM users');
  return (
    <ul>
      {users.map(user => (
        <li>{user.name}</li>
      ))}
    </ul>
  );
}
```

看出来了吗？**它们几乎一模一样！**
我们绕了一大圈，又回到了服务器端直接读数据库渲染 HTML 的模式。

区别在于：
1.  **PHP**：每次交互都要刷新整个页面。
2.  **RSC**：交互时，服务器只发送 diff 数据，客户端无缝更新，保留状态。

### 7.2 边缘计算 (The Edge)

服务器不再是远在弗吉尼亚的数据中心，而是离用户 50 公里内的 CDN 节点。
Vercel, Cloudflare Workers 让逻辑在边缘运行。

这打破了"集中 vs 分散"的二元对立。算力既是集中的（由云厂商管理），又是物理上分散的（遍布全球）。

---

## 8. 理论核心：带宽延迟积 (Bandwidth-Latency Product)

为什么钟摆会摆动？除了商业因素，背后有深刻的物理原因。

网络性能由两个因素决定：
1.  **带宽 (Bandwidth)**：水管有多粗。
2.  **延迟 (Latency)**：水管有多长。

*   **Web 1.0 时代**：带宽极小（56k Modem），延迟极高。传输 HTML（纯文本）是唯一可行的方案。
*   **SPA 时代**：4G/光纤普及，带宽不再是瓶颈。但延迟依然受光速限制（物理定律）。
    SPA 通过预加载所有代码，消除了**交互时的延迟**（点击菜单不需要去服务器），但牺牲了**首次加载的延迟**。
*   **Edge 时代**：我们试图通过把服务器推到用户家门口，来同时解决带宽和延迟问题。

---

## 9. 结语：架构师的视角

当你看着这个钟摆来回摆动时，你应该明白：

1.  **没有完美的架构，只有适合时代的架构**。Web 1.0 适合带宽只有 56k 的时代；SPA 适合 4G/光纤时代。
2.  **分久必合，合久必分**。逻辑和数据，总是在"离用户更近"（低延迟）和"离数据更近"（一致性/算力）之间拉扯。
3.  **不要嘲笑旧技术**。JSP 和 PHP 的"服务端组件"思想，在 React Server Components 中借尸还魂。

作为架构师，你的任务不是站队，而是**识别当前的物理约束**（带宽、延迟、算力成本），然后把钟摆推向最有利的一端。
