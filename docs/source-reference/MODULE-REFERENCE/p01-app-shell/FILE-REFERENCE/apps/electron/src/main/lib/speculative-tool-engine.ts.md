---
path: apps/electron/src/main/lib/speculative-tool-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d015e664fb78610512427596986f5e8715abf576
sha256: fe01c53c5f558ef2454f1921dd38a6cd8b4338719975503964b8970194169c09
lines: 115
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/speculative-tool-engine.ts

## 1. 结论与边界

**推测式只读工具预热引擎**（115 行，全局单例）：监听模型思考流增量，正则预测即将读取的文件路径，后台 `fs.promises.readFile` 预热进内存缓存；真实工具调用命中时一次性返回内容，把「思考→读文件」串行折叠为「思考期间已完成 I/O」（模块注释 `:1-11`）。

边界：只预读**常规文件 ≤3MB**（`:72-73`）；不做写、不做目录；消费语义为一次性；**全冻结树 0 生产消费者（孤立模块）**——见 §4/§10。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SpeculativeToolEngine` | 导出类 | 26-112 | 见下 | 单例引擎 |
| `speculativeToolEngine` | 导出常量 | 115 | `SpeculativeToolEngine.getInstance()` | 全局单例 |
| `feedThinkingChunk` | 公开方法 | 49-63 | `(sessionId, cwd, chunk): void` | 思考流增量→预测预读 |
| `consumePrewarmed` | 公开方法 | 94-103 | `(absPath) => string \| null` | 命中一次性返回 |
| `speculativePreload` | 私有方法 | 66-87 | `(absPath): Promise<void>` | 后台预读 |
| `evictStale` | 私有方法 | 106-111 | TTL 清理 | |
| `PrewarmedItem` | 内部接口 | 17-21 | `{content, timestamp, byteLength}` | |
| 常量 | 内部 | 33-35 | `MAX_CACHE_BYTES=50MB`（**未用于驱逐**）、`CACHE_TTL_MS=20s` | |

导出计数：`export` 2 条（`:26`、`:115`），与源码一致。

## 3. 内部逻辑与关键流程

- **feedThinkingChunk**（`:49-63`）：chunk <5 字符忽略（`:50`）；正则 `(?:read|view|check|inspect|open|examine)\s+(?:file\s+)?["'`]?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]{1,8})["'`]?`（gi，`:53`）逐命中：路径不含 `*` 时按 `cwd` 解析绝对路径（`isAbsolute ? 原样 : resolve`，`:59`）→ `speculativePreload`。
- **speculativePreload**（`:66-87`）：缓存已有或在读中即返回（`:67`）；`inflightReads` 防并发重复读（`:68`）；`fs.stat` 后**仅 `isFile()` 且 `size ≤ 3MB`** 才读（`:71-73`）；写入 `prewarmCache`（content/timestamp/byteLength）；失败静默；finally 删 inflight + `evictStale()`（`:83-86`）。
- **consumePrewarmed**（`:94-103`）：未命中 → null；超 20s TTL → 删 + null（`:97-99`）；命中 → **删除后返回**（一次性消费，`:101-102`）。
- **evictStale**（`:106-111`）：全表扫过期删除（每次预读后触发）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep speculative-tool-engine|SpeculativeToolEngine|speculativeToolEngine|feedThinkingChunk|consumePrewarmed`，apps+packages 全类型）：
  - **0 生产消费者**（孤立模块）——除本文件与 `speculative-tool-engine.test.ts`（同批专属测试，3 用例）外无引用（检索范围同上，含动态 import/字符串拼接检查）。
- 出向：`node:fs.promises`（stat/readFile）、`node:path`（`:13-14`）。

## 5. 数据 I/O、读写与副作用

- 磁盘读：预测命中的文件（≤3MB 常规文件）；不写。
- 缓存：`prewarmCache`（Map，20s TTL、一次性消费）；`inflightReads` 集合。
- 副作用：预读 I/O（PageCache 预热效果即设计目标）；无日志。

## 6. 分支、失败、取消与恢复

- 预读失败/非文件/超 3MB：静默跳过（`:81-82`、`:73`）。
- TTL 过期：consume 删 + null（`:97-99`）；预读后顺带全表清理（`:85`）。
- 取消：无（fire-and-forget async）；`inflightReads` finally 必清。
- 恢复：无持久状态；模块重载即清缓存。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无 root 内约束（预测路径即读，注释语义为「只读预热」，边界见 §10）。
- 权威状态：缓存内容以磁盘文件为准（20s 内可能过期——一次性消费语义限制暴露窗口）。

## 8. 修改影响面

- 设计消费面（思考流接入/工具读取命中）**尚未接线**（§4）；若接线需在思考流回调与读文件工具两侧调用。
- 测试：`speculative-tool-engine.test.ts`（3 用例）覆盖命中/一次性/TTL，改动需同步。
- `MAX_CACHE_BYTES` 声明未实现驱逐（`:32-33` 注释「以 TTL 为主，字节上限用于未来扩展」）。

## 9. 测试证据

- 直接测试：`speculative-tool-engine.test.ts`（93 行，bun:test，**3 test**，NOT_RUN）。mock 边界：真实 fs 临时目录（`mkdtempSync`）+ `setSystemTime` 推进 TTL（`:41`、`:89`）；`waitFor` 轮询等待后台预读（`:31-38`）；类型断言窥探内部 `prewarmCache` 仅用于断言（`:17-20`）。
- 断言摘要：①`feedThinkingChunk('Let me read sample.txt first.')` 预读后 `consumePrewarmed` 命中内容、第二次 `toBeNull()`（`:57-62`）；②未预热路径 `toBeNull()`（`:67`）；③`setSystemTime(base+25s)` 后 consume `toBeNull()` 且缓存删除（`:90-91`）。
- 未覆盖：3MB 上限/非文件过滤、`inflightReads` 并发去重、`evictStale`、正则边界（通配符过滤）、`speculativeToolEngine` 单例。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与方法签名 | 已证实 | `:26-115` |
| 预测正则与 cwd 解析 | 已证实 | `:53-60` |
| ≤3MB 常规文件守卫 | 已证实 | `:71-73` |
| 一次性消费+20s TTL | 已证实 | `:94-103` |
| `MAX_CACHE_BYTES` 未实现驱逐 | 已证实 | `:32-33` |
| **全树 0 生产消费者（孤立模块）** | 已证实 | 全冻结树检索（§4 范围） |
| 3 用例断言 | 已证实 | `speculative-tool-engine.test.ts:46-91` |
| 无 root 约束的预测读面 | 已证实 | 全文无路径授权（§7） |
| 预热实际性能收益 | 未知 | NOT_RUN |
| 测试通过与否/运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `feedThinkingChunk` | §3/§9 | 49-63 | covered |
| `speculativePreload` | §3 | 66-87 | covered |
| `consumePrewarmed` | §3/§9 | 94-103 | covered |
| `evictStale`/TTL | §3/§9 | 106-111 | covered |
| 并发去重/3MB 守卫 | §9 | 67-73 | partial（无用例） |
| 孤立模块状态 | §4/§10 | — | covered |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
