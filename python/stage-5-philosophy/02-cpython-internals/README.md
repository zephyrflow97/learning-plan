# 第 2 章：CPython 内部实现

> *"We are what we pretend to be, so we must be careful about what we pretend to be."*
> — Kurt Vonnegut
>
> Python 假装自己是一门简单的语言。
> 你写 `x = 1`，它说"好的"。你写 `for item in things`，它默默遍历。
> 但在这层温柔的面纱之下，是一台精密而复杂的 C 语言机器——CPython。
> 理解它，不是为了拆穿 Python 的"谎言"，而是为了真正懂得：
> **每一行简单的代码背后，有多少精巧的工程在支撑。**

---

## 📖 本章内容

- [CPython 架构总览](#cpython-架构总览)
- [PyObject：万物之源](#pyobject万物之源)
- [引用计数机制](#引用计数机制)
- [小整数池与字符串驻留](#小整数池与字符串驻留)
- [字节码与 dis 模块](#字节码与-dis-模块)
- [Python 编译过程](#python-编译过程)
- [CPython vs 其他实现](#cpython-vs-其他实现)

---

## CPython 架构总览

> 🧠 **CS Master's Bridge：从源码到执行**
>
> 当你运行 `python script.py` 时，发生了什么？
> 不是"解释执行"这么简单——Python 实际上有一个 **编译步骤**。
> 只不过它编译的目标不是机器码，而是字节码。

### 源码结构

CPython 的源码仓库（约 160 万行 C 代码 + 约 80 万行 Python 代码）：

```
cpython/
├── Include/           # C 头文件——Python 对象的定义
│   ├── object.h       # PyObject 的定义——万物之源
│   ├── longobject.h   # 整数对象
│   ├── listobject.h   # 列表对象
│   └── ...
├── Objects/           # 内置类型的 C 实现
│   ├── longobject.c   # int 的实现（是的，Python 的 int 叫 "long"）
│   ├── listobject.c   # list 的实现
│   ├── dictobject.c   # dict 的实现——Python 中最精妙的数据结构
│   └── ...
├── Python/            # 解释器核心
│   ├── ceval.c        # 字节码执行引擎——CPython 的心脏
│   ├── compile.c      # AST → 字节码编译器
│   ├── ast.c          # AST 节点定义
│   └── ...
├── Parser/            # 解析器（源码 → AST）
│   ├── parser.c       # PEG 解析器（3.9+ 替代了旧的 LL(1)）
│   └── ...
├── Modules/           # 标准库的 C 模块
│   ├── _io/           # IO 模块
│   ├── _json.c        # JSON 解析加速
│   └── ...
├── Lib/               # 标准库的 Python 模块
│   ├── os.py
│   ├── asyncio/
│   └── ...
└── Tools/             # 开发工具
```

### 编译与构建流程

```
                CPython 构建流程
    ┌──────────────────────────────────────┐
    │  1. ./configure                       │
    │     检测系统特性，生成 Makefile        │
    │                                       │
    │  2. make                              │
    │     编译所有 .c → .o → python 可执行文件│
    │                                       │
    │  3. make install                      │
    │     安装到系统路径                     │
    └──────────────────────────────────────┘

    你得到的 `python` 就是一个 C 程序
    它的 main() 函数在 Programs/python.c
```

> ⚛️ **The Science：为什么 CPython 用 C 写？**
>
> 1989 年 Guido 开始写 Python 时，C 是系统编程的事实标准。
> 用 C 写解释器的好处：
> - **性能**：解释器本身的开销尽可能小
> - **可移植性**：C 在几乎所有平台上都能编译
> - **C 扩展生态**：可以直接调用 C 库（NumPy、Pillow 的基础）
> - **FFI 友好**：ctypes、cffi 可以直接调用 .so/.dll
>
> 代价是：CPython 的开发门槛很高——你需要同时懂 C 和 Python。

---

## PyObject：万物之源

在 CPython 中，**一切都是 PyObject**。整数、字符串、列表、函数、类、模块——全都是。

### PyObject 结构体

```c
// Include/object.h（简化版）
typedef struct _object {
    Py_ssize_t ob_refcnt;    // 引用计数
    PyTypeObject *ob_type;   // 类型指针
} PyObject;
```

就这么两个字段：
- `ob_refcnt`：有多少东西在引用这个对象（用于垃圾回收）
- `ob_type`：指向类型对象（决定这个对象能做什么）

### 变长对象

有些对象需要额外的大小信息：

```c
typedef struct {
    PyObject ob_base;
    Py_ssize_t ob_size;      // 元素个数
} PyVarObject;
```

`list`、`tuple`、`str` 都是 PyVarObject。

### 类型也是对象

```
    Python 中一切都是对象

    42          ──→  PyLongObject  ──→  ob_type ──→ int (PyTypeObject)
    "hello"     ──→  PyUnicodeObject ──→ ob_type ──→ str (PyTypeObject)
    [1, 2, 3]   ──→  PyListObject  ──→  ob_type ──→ list (PyTypeObject)
    int         ──→  PyTypeObject  ──→  ob_type ──→ type (PyTypeObject)
    type        ──→  PyTypeObject  ──→  ob_type ──→ type（指向自己！）

    type 的类型是 type 本身——这是 Python 对象系统的"第一推动力"
```

用 Python 验证：

```python
>>> type(42)
<class 'int'>
>>> type(int)
<class 'type'>
>>> type(type)
<class 'type'>        # type 的类型是它自己！

>>> isinstance(42, object)
True
>>> isinstance(int, object)
True
>>> isinstance(type, object)
True                   # 一切都是 object

>>> issubclass(type, object)
True                   # type 是 object 的子类
>>> isinstance(object, type)
True                   # object 是 type 的实例
# 这是一个鸡生蛋的问题——在 C 层面通过特殊初始化解决
```

### 整数对象的真实结构

```c
// Include/longintrepr.h（简化版）
struct _longobject {
    PyObject ob_base;
    Py_ssize_t ob_size;       // 位数（可以是负数表示负整数）
    digit ob_digit[1];        // 数字数组（大整数用多个 digit 表示）
};
```

这就是为什么 Python 的整数可以无限大——它用数组存储：

```python
>>> import sys
>>> sys.getsizeof(0)     # 28 字节（PyObject 头 + ob_size）
28
>>> sys.getsizeof(1)     # 28 字节（1 个 digit）
28
>>> sys.getsizeof(2**30) # 32 字节（2 个 digit）
32
>>> sys.getsizeof(2**60) # 36 字节（3 个 digit）
36
# 每多一个 digit（30 位），多 4 字节
```

> 🎭 **The Drama：一个整数 28 字节？！**
>
> C 的 `int` 是 4 字节。Python 的 `0` 是 28 字节——7 倍的开销。
> 这就是动态类型的代价：每个对象都要携带类型信息和引用计数。
>
> 但 Python 不在乎。它的哲学是：
> **开发者的时间比 CPU 的时间贵。**
> 如果 28 字节的整数让你可以不用考虑整数溢出，那就值了。

---

## 引用计数机制

Python 最基本的内存管理机制是 **引用计数**（Reference Counting）。

### 工作原理

```python
a = [1, 2, 3]     # 创建列表对象，refcnt = 1
b = a              # b 也指向它，refcnt = 2
c = [a, a]         # 被列表引用两次，refcnt = 4

del b              # refcnt = 3
c.pop()            # refcnt = 2
del c              # refcnt ？（取决于 c 本身的销毁过程）
```

在 C 层面：

```c
// 引用计数的核心操作
#define Py_INCREF(op)  ((op)->ob_refcnt++)
#define Py_DECREF(op)  \
    if (--(op)->ob_refcnt == 0) \
        _Py_Dealloc(op)        // 引用归零，立即释放
```

### 用 sys.getrefcount 观察

```python
import sys

a = []
print(sys.getrefcount(a))  # 2（a 本身 + getrefcount 的参数）

b = a
print(sys.getrefcount(a))  # 3

del b
print(sys.getrefcount(a))  # 2
```

注意 `sys.getrefcount()` 本身会临时增加一次引用（因为参数传递），所以总是比你预期的多 1。

### 引用计数的优缺点

| 优点 | 缺点 |
|------|------|
| 实时回收：归零立即释放 | 循环引用无法处理 |
| 确定性：可预测的销毁时机 | 每次赋值都要 +1/-1（性能开销）|
| 实现简单直观 | 多线程下需要 GIL 保护 |
| 缓存友好（局部性好）| 大对象图销毁时可能卡顿 |

> 🌌 **The Big Picture：引用计数 vs 追踪式 GC**
>
> ```
> 引用计数 (CPython)          追踪式 GC (Java, Go, JS)
> ┌──────────────────┐       ┌──────────────────────┐
> │ 每次赋值更新计数  │       │ 周期性扫描所有对象    │
> │ 归零立即释放      │       │ 标记可达对象          │
> │ 实时、确定性      │       │ 清除不可达对象        │
> │ 但有循环引用问题  │       │ 无循环引用问题        │
> │ 需要 GIL 保护    │       │ 但有"停顿"(STW)       │
> └──────────────────┘       └──────────────────────┘
>
> CPython 的方案：引用计数 + 分代 GC（处理循环引用）
> 这是一种务实的折衷——大部分对象用引用计数快速回收，
> 少数循环引用靠 GC 处理。
> ```

---

## 小整数池与字符串驻留

### 小整数池 (Integer Interning)

CPython 预先创建了 -5 到 256 之间的所有整数对象，全局共享：

```python
# 小整数——共享同一个对象
a = 256
b = 256
print(a is b)  # True —— 同一个对象

# 大整数——各自创建新对象
a = 257
b = 257
print(a is b)  # False —— 不同对象（在交互模式下）
# 注意：在同一个编译单元中（如 .py 文件），编译器可能会优化为同一对象
```

为什么是 -5 到 256？

```
频率分析显示：程序中 99% 的整数都在这个范围内。
预缓存这些对象可以：
1. 节省内存（不用重复创建）
2. 提高性能（不用分配/释放）
3. 加速比较（is 比 == 快）

为什么不缓存更多？
- 内存开销：每个整数对象 28 字节
- 256 个对象 = 7168 字节，可以接受
- 如果缓存到 10000 = 280KB，开始不值了
```

### 字符串驻留 (String Interning)

```python
# 看起来像标识符的字符串会被自动驻留
a = "hello"
b = "hello"
print(a is b)  # True —— 同一个对象

# 包含特殊字符的不会自动驻留
a = "hello world"
b = "hello world"
print(a is b)  # 可能是 False（取决于实现和上下文）

# 手动驻留
import sys
a = sys.intern("hello world!")
b = sys.intern("hello world!")
print(a is b)  # True —— 强制驻留
```

驻留的规则（CPython 实现细节，非语言规范）：

```
自动驻留的字符串：
├── 看起来像标识符的（只含字母、数字、下划线）
├── 长度较短的（通常 < 20 字符）
├── 字节码中的常量字符串
└── 字典的键（dict 查找优化）

不自动驻留的：
├── 运行时动态创建的长字符串
├── 包含空格或特殊字符的
└── 从外部输入读取的
```

> 🧰 **Toolbox：不要用 `is` 比较值！**
>
> ```python
> # ❌ 危险！
> if user_input is "admin":  # 可能 True 也可能 False，取决于驻留
>     grant_access()
>
> # ✅ 安全！
> if user_input == "admin":  # 始终比较值
>     grant_access()
> ```
>
> `is` 比较的是 **身份**（同一个对象），`==` 比较的是 **值**（内容相等）。
> `is` 只应该用于和 `None`、`True`、`False` 比较——因为它们是单例。

---

## 字节码与 dis 模块

### 什么是字节码

Python 源码不是直接执行的——它先被编译成 **字节码**（bytecode），然后由虚拟机执行。

```python
# 源码
def add(a, b):
    return a + b

# 编译后的字节码（.pyc 文件中存储的就是这个）
import dis
dis.dis(add)
```

输出：

```
  2           0 LOAD_FAST                0 (a)
              2 LOAD_FAST                1 (b)
              4 BINARY_ADD
              6 RETURN_VALUE
```

每条字节码指令包含：
- **偏移量**（0, 2, 4, 6）：指令在字节码中的位置
- **操作码**（LOAD_FAST, BINARY_ADD）：要执行的操作
- **参数**（0, 1）：操作数
- **注释**（(a), (b)）：dis 模块添加的可读说明

### 字节码执行模型：基于栈的虚拟机

```
执行 add(3, 5) 的栈变化：

指令              栈（底 → 顶）        说明
─────────────────────────────────────────────
LOAD_FAST 0      [3]                  把 a 的值压入栈
LOAD_FAST 1      [3, 5]              把 b 的值压入栈
BINARY_ADD       [8]                  弹出两个值，相加，结果压入栈
RETURN_VALUE     []                   弹出栈顶作为返回值
```

### 常见字节码指令

```python
import dis

# 变量操作
def variables():
    x = 1          # STORE_FAST
    y = x          # LOAD_FAST + STORE_FAST
    global g
    g = x          # STORE_GLOBAL

dis.dis(variables)

# 函数调用
def calls():
    print("hello") # LOAD_GLOBAL + LOAD_CONST + CALL_FUNCTION

dis.dis(calls)

# 控制流
def control(x):
    if x > 0:      # LOAD_FAST + LOAD_CONST + COMPARE_OP + POP_JUMP_IF_FALSE
        return True
    return False

dis.dis(control)
```

### 字节码优化示例

```python
# Python 编译器会做一些简单的优化

# 常量折叠
def constant_fold():
    x = 2 * 3 * 7  # 编译时计算为 42

dis.dis(constant_fold)
# LOAD_CONST   1 (42)     ← 编译器直接算好了
# STORE_FAST   0 (x)

# 但 Python 的优化非常保守
def no_fold():
    x = 2
    y = x * 3  # 不会优化，因为 x 可能在运行时被改变

dis.dis(no_fold)
# LOAD_CONST   1 (2)
# STORE_FAST   0 (x)
# LOAD_FAST    0 (x)      ← 运行时才知道 x 的值
# LOAD_CONST   2 (3)
# BINARY_MULTIPLY
# STORE_FAST   1 (y)
```

### code 对象

每个函数都有一个 `__code__` 对象，包含了所有编译后的信息：

```python
def example(a, b=10):
    """A sample function."""
    c = a + b
    return c

code = example.__code__

print(code.co_name)        # 'example'
print(code.co_filename)    # 源文件名
print(code.co_varnames)    # ('a', 'b', 'c')
print(code.co_consts)      # (None, 10) —— 常量表
print(code.co_stacksize)   # 2 —— 最大栈深度
print(code.co_code)        # b'|\x00|\x01\x17\x00}\x02|\x02S\x00' —— 原始字节码
```

> ⚛️ **The Science：为什么 Python 用基于栈的虚拟机？**
>
> 虚拟机有两种主要设计：
>
> | | 基于栈 (Stack-based) | 基于寄存器 (Register-based) |
> |---|---|---|
> | 代表 | CPython, JVM | Lua VM, Dalvik (Android) |
> | 指令格式 | `BINARY_ADD` | `ADD r1, r2, r3` |
> | 指令数量 | 更多（每步更小） | 更少（每步更大） |
> | 实现难度 | 简单 | 复杂（需要寄存器分配） |
> | 性能 | 较低 | 较高 |
>
> CPython 选择基于栈是因为：
> 1. 实现简单——Guido 一个人就能写
> 2. 生成字节码简单——不用做寄存器分配
> 3. 代码紧凑——指令不需要指定操作数位置
>
> 代价是性能。这就是为什么 Python 比 C 慢 10-100 倍——
> 但也是为什么 Python 能轻松支持 `eval()`、动态类型、运行时修改类——
> 虚拟机可以做任何运行时决策。

---

## Python 编译过程

### 完整的编译-执行流水线

```
    Python 源码的旅程

    ┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  源码 (.py)  │────→│ Token 流 │────→│   AST    │────→│ 字节码   │
    │             │     │          │     │          │     │ (.pyc)   │
    └─────────────┘     └──────────┘     └──────────┘     └──────────┘
     source code         tokenizer         parser          compiler
                                          (PEG, 3.9+)

                                                               │
                                                               ▼
                                                          ┌──────────┐
                                                          │ CPython  │
                                                          │ VM 执行  │
                                                          │ (ceval.c)│
                                                          └──────────┘
```

### 阶段 1：词法分析 (Tokenization)

```python
import tokenize
import io

source = "x = 1 + 2"
tokens = tokenize.generate_tokens(io.StringIO(source).readline)

for tok in tokens:
    print(tok)

# TokenInfo(type=1 (NAME), string='x', ...)
# TokenInfo(type=54 (OP), string='=', ...)
# TokenInfo(type=2 (NUMBER), string='1', ...)
# TokenInfo(type=54 (OP), string='+', ...)
# TokenInfo(type=2 (NUMBER), string='2', ...)
```

### 阶段 2：语法分析 → AST

```python
import ast

source = """
def greet(name):
    return f"Hello, {name}!"
"""

tree = ast.parse(source)
print(ast.dump(tree, indent=2))
```

输出（简化）：

```
Module(body=[
  FunctionDef(
    name='greet',
    args=arguments(args=[arg(arg='name')]),
    body=[
      Return(value=
        JoinedStr(values=[
          Constant(value='Hello, '),
          FormattedValue(value=Name(id='name')),
          Constant(value='!')
        ])
      )
    ]
  )
])
```

### 阶段 3：AST → 字节码

```python
# 你可以直接编译 AST
code = compile(tree, "<string>", "exec")

# 也可以编译源码字符串
code = compile("x = 1 + 2", "<string>", "exec")

import dis
dis.dis(code)
# LOAD_CONST   0 (3)     ← 常量折叠：1+2 在编译时算好了
# STORE_NAME   0 (x)
```

### 阶段 4：字节码缓存 (.pyc)

```
Python 3 的 .pyc 缓存机制：

project/
├── module.py
└── __pycache__/
    └── module.cpython-312.pyc    ← 编译后的字节码

.pyc 文件的结构：
┌──────────────┐
│ Magic Number │  4 字节 —— 标识 Python 版本
├──────────────┤
│ Flags        │  4 字节 —— 缓存失效策略
├──────────────┤
│ Timestamp    │  4 字节 —— 源文件修改时间
├──────────────┤
│ Size         │  4 字节 —— 源文件大小
├──────────────┤
│ Code Object  │  N 字节 —— marshal 序列化的代码对象
└──────────────┘

当源文件改变时（时间戳或大小变了），.pyc 自动重新生成。
```

### 阶段 5：字节码执行 (ceval.c)

CPython 虚拟机的核心是 `Python/ceval.c` 中的主循环：

```c
// 极度简化的 CPython 字节码执行循环
PyObject*
_PyEval_EvalFrameDefault(PyThreadState *tstate, _PyInterpreterFrame *frame, int throwflag)
{
    for (;;) {
        // 1. 获取下一条指令
        opcode = _Py_OPCODE(*next_instr);
        oparg = _Py_OPARG(*next_instr);
        next_instr++;

        switch (opcode) {
            case LOAD_FAST:
                value = localsplus[oparg];
                PUSH(value);
                break;

            case BINARY_ADD:
                right = POP();
                left = TOP();
                result = PyNumber_Add(left, right);
                SET_TOP(result);
                break;

            case RETURN_VALUE:
                retval = POP();
                goto exit_returning;

            // ... 还有约 150 个 case
        }
    }
}
```

> 🎭 **The Drama：一个 switch/case 统治一切**
>
> 没错，Python 的所有代码最终都在这个巨大的 switch/case 中执行。
> 你的 `for` 循环、`if` 判断、函数调用、类定义——
> 全部被翻译成字节码指令，在这个循环里一条一条执行。
>
> `ceval.c` 大约有 6000 行代码——这 6000 行 C 代码
> 就是 Python 的 "CPU"。
>
> 每一条 Python 语句的执行都要经过：
> 1. 从字节码数组取出操作码（1 次数组访问）
> 2. 跳转到对应的 case（1 次跳转）
> 3. 执行操作（可能涉及多次函数调用和类型检查）
> 4. 回到循环头（1 次跳转）
>
> 而 C 编译后的代码直接是 CPU 指令——没有这些中间层。
> 这就是 Python 慢的根本原因。
> 但也是 Python 强大的根本原因——虚拟机层让一切皆可能。

---

## CPython vs 其他实现

Python 是一门 **语言规范**，CPython 只是它最流行的 **实现**。

### 主要实现对比

```
Python 语言规范
     │
     ├── CPython     —— 参考实现（C 语言）
     │   └── 最广泛使用，"标准" Python
     │
     ├── PyPy        —— JIT 编译实现（RPython）
     │   └── 通过 JIT 编译实现 4-10x 加速
     │
     ├── GraalPython —— GraalVM 上的实现（Java/Truffle）
     │   └── 多语言运行时，可与 Java/JS/Ruby 互操作
     │
     ├── Jython      —— JVM 实现（Java）
     │   └── 已停滞，停留在 Python 2.7
     │
     ├── IronPython  —— .NET 实现（C#）
     │   └── 与 .NET 生态集成
     │
     ├── MicroPython —— 微控制器实现
     │   └── 在 ESP32 等嵌入式设备上运行
     │
     └── Cinder      —— Instagram 的 CPython 分支
         └── 内置 JIT，针对 Instagram 的工作负载优化
```

### 详细对比表

| 特性 | CPython | PyPy | GraalPython |
|------|---------|------|-------------|
| **语言** | C | RPython | Java/Truffle |
| **Python 版本** | 3.13+ | 3.10 | 3.10 |
| **性能** | 基准 (1x) | 4-10x 快 | 变化大 |
| **启动速度** | 快 | 慢（JIT 预热） | 很慢 |
| **C 扩展兼容** | 100% | 部分（通过兼容层）| 部分 |
| **GIL** | 有（3.13 可选移除）| 有 | 无 |
| **内存使用** | 适中 | 较高 | 高 |
| **适用场景** | 通用 | 长时间运行的程序 | 多语言互操作 |

### PyPy 的 JIT 魔法

```python
# 这段代码在 PyPy 上比 CPython 快 10 倍以上
def sum_squares(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

result = sum_squares(10_000_000)
```

为什么？

```
CPython 执行过程（每次循环）：
1. LOAD_FAST total          → 查找局部变量数组
2. LOAD_FAST i              → 查找局部变量数组
3. LOAD_FAST i              → 又查找一次
4. BINARY_MULTIPLY          → 调用 PyNumber_Multiply
   → 检查类型 → 调用 long_mul → 创建新 PyObject → 更新 refcnt
5. BINARY_ADD               → 同上
6. STORE_FAST total         → 存回局部变量数组
→ 每次循环约 20+ 次函数调用

PyPy JIT 编译后：
1. 检测热循环 → 触发 JIT
2. 分析类型 → 发现 total 和 i 始终是 int
3. 生成机器码 → 直接用 CPU 整数运算
→ 每次循环约 2-3 条 CPU 指令
```

> 🧠 **CS Master's Bridge：为什么 CPython 不加 JIT？**
>
> CPython 3.13 开始实验性引入了一个 "copy-and-patch" JIT。
> 但它比 PyPy 的 JIT 简单得多，原因是：
>
> 1. **C 扩展兼容性**：PyPy 可以重新设计对象布局，CPython 不行
>    （NumPy、Pandas 直接操作 PyObject 的 C 结构体）
> 2. **引用计数**：JIT 优化要求减少引用计数操作，但 C 扩展依赖它
> 3. **渐进主义**：CPython 的策略是小步快跑，不做大的架构变动
>
> 这又回到了 Zen of Python 第 9 条："Practicality beats purity."
> 一个完美但不兼容的 JIT 不如一个简陋但兼容的 JIT。

---

## dict 的实现演化

dict 是 Python 中最重要的数据结构——类的属性、模块的命名空间、关键字参数、甚至局部变量的 fallback 都用 dict。

### 3.5 之前：经典哈希表

```
经典开放寻址哈希表：

索引:  0     1     2     3     4     5     6     7
      ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
hash  │     │  H1 │     │  H2 │     │     │  H3 │     │
key   │     │ 'a' │     │ 'b' │     │     │ 'c' │     │
value │     │  1  │     │  2  │     │     │  3  │     │
      └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘

问题：大量空槽浪费内存（负载因子通常 < 2/3）
每个空槽也要存 hash + key + value 的空间
```

### 3.6+：紧凑字典 (Compact Dict)

```
新设计：分离索引和数据

索引数组（1 字节 per 槽）：
  [None, 0, None, 1, None, None, 2, None]

数据数组（紧密排列）：
  ┌──────┬─────┬───────┐
  │ hash │ key │ value │
  ├──────┼─────┼───────┤
  │  H1  │ 'a' │   1   │  ← 索引 0
  │  H2  │ 'b' │   2   │  ← 索引 1
  │  H3  │ 'c' │   3   │  ← 索引 2
  └──────┴─────┴───────┘

优点：
1. 内存更省（索引数组用 1 字节，空槽开销极小）
2. 数据紧密排列 → 缓存友好
3. 副作用：数据数组是按插入顺序的 → dict 保序！
```

3.7+ 把"保序"从实现细节提升为 **语言规范**。

---

## 实践：探索 CPython 内部

```python
# 1. 查看对象的引用计数
import sys
x = "hello"
print(sys.getrefcount(x))

# 2. 查看字节码
import dis
def my_func(a, b):
    return a + b
dis.dis(my_func)

# 3. 查看 AST
import ast
print(ast.dump(ast.parse("x = 1 + 2"), indent=2))

# 4. 查看 code 对象
print(my_func.__code__.co_varnames)
print(my_func.__code__.co_consts)
print(my_func.__code__.co_stacksize)

# 5. 小整数池验证
a = 256
b = 256
print(f"256: {a is b}")  # True
a = 257
b = 257
print(f"257: {a is b}")  # False（交互模式下）

# 6. 查看对象大小
print(f"int(0): {sys.getsizeof(0)} bytes")
print(f"int(1): {sys.getsizeof(1)} bytes")
print(f"str(''): {sys.getsizeof('')} bytes")
print(f"list(): {sys.getsizeof([])} bytes")
print(f"dict(): {sys.getsizeof(dict())} bytes")

# 7. id() 返回的就是内存地址（CPython 实现）
x = [1, 2, 3]
print(f"对象地址: {id(x):#x}")
print(f"十六进制: {hex(id(x))}")
```

---

## 总结：CPython 的设计哲学

> 🌌 **The Big Picture：工程是权衡的艺术**
>
> CPython 的每个设计决策都是权衡：
>
> | 决策 | 选择了 | 放弃了 |
> |------|--------|--------|
> | 基于栈的 VM | 实现简单 | 极致性能 |
> | 引用计数 | 即时回收、确定性 | 无 GIL 的多线程 |
> | PyObject 头部 | 运行时灵活性 | 内存效率 |
> | 保守的编译器 | 正确性、可维护性 | 编译期优化 |
> | C 语言实现 | 可移植、C 扩展生态 | 开发效率 |
>
> 这些权衡不是"错误"——它们是 **有意识的选择**。
> 每一个选择都服务于 Python 的核心价值：
> **让开发者写更少的代码，犯更少的错，更快地交付。**
>
> 理解这些权衡，你就理解了为什么 Python "慢但伟大"。

---

## 参考资源

- [CPython Source Code](https://github.com/python/cpython)
- [CPython Internals (Anthony Shaw)](https://realpython.com/products/cpython-internals-book/)
- [Inside The Python Virtual Machine](https://leanpub.com/insidethepythonvirtualmachine)
- [Python Developer's Guide](https://devguide.python.org/)
- [Your Guide to the CPython Source Code (Real Python)](https://realpython.com/cpython-source-code-guide/)

---

[👈 第 1 章：The Zen of Python](../01-zen-of-python/) | [👉 第 3 章：内存管理与垃圾回收](../03-memory-gc/)

[⬆️ 返回 Stage 5 目录](../README.md)
