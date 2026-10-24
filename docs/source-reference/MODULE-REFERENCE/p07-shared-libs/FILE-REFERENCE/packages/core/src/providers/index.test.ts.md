---
path: packages/core/src/providers/index.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8a134a07dd528a4e5763094e157eef49b9483a33
sha256: 1e495d0939a5751980836fc210742d4d07b31c8dc6def05cdd87888269b801ab
lines: 12
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/providers/index.test.ts

## 1. 测试目标

`getAdapter`（`providers/index.ts:58`）的**实例隔离**契约：每次获取适配器必须是新实例，防止实例内部状态（Anthropic 流式 block 状态、Google 工具计数器）跨请求污染。bun:test；真实工厂，无 mock。

## 2. 用例清单

共 **2 个 `test(`**（计数核对）：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:5` | 每次获取 Anthropic adapter 都是独立实例 | 无 | `getAdapter('anthropic')` 两次 | 独立 |
| `:9` | 每次获取 Google adapter 都是独立实例 | 无 | `getAdapter('google')` 两次 | 独立 |

## 3. 真实断言

- `:6` `expect(getAdapter('anthropic')).not.toBe(getAdapter('anthropic'))`（同一引用判等否定）。
- `:10` `expect(getAdapter('google')).not.toBe(getAdapter('google'))`。

## 4. 未覆盖与脆弱点

- 未覆盖：18 键逐一映射正确性、未注册键抛错分支（`:60-62`）、其余 16 键的实例隔离。
- 脆弱点：若实现改为单例缓存，此测试即失败（这正是其守护目标）。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例与断言 | 已证实 | 全 12 行逐行读 |
| 被测工厂语义（每次 new） | 已证实 | `providers/index.ts:30-49,63` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 用例 | §2/§3 | 5-11 | covered |
| 未覆盖点 | §4 | — | covered（如实） |
