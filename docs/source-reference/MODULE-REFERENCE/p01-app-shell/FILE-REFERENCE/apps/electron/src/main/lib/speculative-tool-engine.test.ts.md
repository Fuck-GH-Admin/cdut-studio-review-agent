---
path: apps/electron/src/main/lib/speculative-tool-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37c9e8eaa7fffd6b7f38dbee3a3ba64da4c3803d
sha256: 7d4032cb928504d1eaf8e0f9bbc30066e28dad64ee5f244f1d338aff2b70ddea
lines: 93
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/speculative-tool-engine.test.ts

## 1. 测试目标

`speculative-tool-engine`（同批深读）的预热命中语义：思考流预测→预读→`consumePrewarmed` 命中、一次性消费（第二次 null）、20s TTL 过期。框架 `bun:test`；mock 边界=真实 fs 临时目录 + `setSystemTime` 推进 TTL + 类型断言窥探内部缓存（注释 `:17-20`：仅断言不改行为）。

## 2. 用例清单

用例计数：`test(` **3**（`:46,65,72`），`it(` 0——与源码计数一致。2 describe：预热命中（2）、TTL 过期（1）。

装置：`makeRoot`（mkdtemp，`:24-28`）；`waitFor` 轮询后台异步预读（2s 超时，`:31-38`）；`afterEach` `setSystemTime()` 复位+清目录（`:40-43`）。

| # | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 思考流预测→预读→命中（`:46-63`） | 写 `sample.txt`='推测式预读命中内容' | `feedThinkingChunk('s1', root, 'Let me read sample.txt first.')`→轮询缓存→consume 两次 | 独立 |
| 2 | 未预热路径返回 null（`:65-68`） | — | `consumePrewarmed(never-warmed.ts)` | 独立 |
| 3 | 超 20s 未消费→null 且缓存删除（`:72-92`） | 写 `stale.ts`；`setSystemTime(base)` | feed 'I need to inspect stale.ts'→轮询→`setSystemTime(base+25_000)`→consume | 独立 |

## 3. 真实断言

（逐条引用 expect 行）

1. `expect(cached).toBe(true)`（轮询预读完成）；`expect(engine.consumePrewarmed(absPath)).toBe(content)`；`expect(engine.consumePrewarmed(absPath)).toBeNull()`（一次性，`:58-62`）。
2. `expect(engine.consumePrewarmed(resolve(makeRoot(),'never-warmed.ts'))).toBeNull()`（`:67`）。
3. `expect(cached).toBe(true)`；`setSystemTime(base+25_000)` 后 `expect(engine.consumePrewarmed(absPath)).toBeNull()`；`expect(internals.prewarmCache.has(absPath)).toBe(false)`（`:86-91`）。

## 4. 未覆盖与脆弱点

- 未覆盖（对照被测源码）：3MB/非文件守卫、`inflightReads` 并发去重、`evictStale` 全表清理、`*` 通配过滤、正则边界（多候选/引号形态）、`speculativeToolEngine` 单例形态。
- 脆弱点：`waitFor` 轮询掩盖后台异步时序（预读慢机器下 2s 可能超时，属环境敏感）；`setSystemTime` 影响 `Date.now`（`afterEach` 复位防泄漏）；类型断言窥探 `prewarmCache` 依赖内部字段名。
- 引擎当前**无生产消费者**（同批手册 §4），本测试是唯一行为锚。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `speculative-tool-engine.test.ts:58-91` |
| mock 边界=真实 fs+setSystemTime+窥探 | 已证实 | `:17-43` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 守卫/并发/驱逐路径 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 预测→预读→命中 | §2/§3 | 46-63 | covered |
| 一次性消费 | §2/§3 | 60-62 | covered |
| 未预热 null | §2/§3 | 65-68 | covered |
| TTL 过期 | §2/§3 | 72-92 | covered |
| 3MB/并发/驱逐 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
