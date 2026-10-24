---
path: apps/electron/src/main/lib/review/review-anchor-validation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6f8765413b88752a7aab041882f2f10ff63a1bef
sha256: c6a55a9e68ec427e0f82c8e59d0ab04396050d23a0858d3f492c411199536505
lines: 61
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-anchor-validation.test.ts

## 1. 测试目标

M0/H07 锚点存在性核验（K07 回归的 M0 部分，`apps/electron/src/main/lib/review/review-anchor-validation.test.ts:2`）：被测对象是 `ai-review-service.ts` 的 `sanitizeFindingSources`（**无同名源模块**，本文件是独立测试入口）。验证 AI 发现的 subjectAnchor/ruleAnchors 指向不存在文档/块时的降级语义（无猜测落点）。

夹具：`buildDemoCase()`（`./demo-fixtures/demo-case-fixture`）+ `makeFinding()` 工厂（`:13-20`，默认 finding 带合法 subjectAnchor）。

## 2. 用例清单

共 **4 个 `test(`**（1 个 `describe`，Given/When/Then）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 23-29 | 指向不存在文档的 subjectAnchor → 锚点删除（无猜测落点） | `subjectAnchor:{documentId:'doc-fake',blockId:'blk-fake'}` | `sanitizeFindingSources(finding, base)` | 独立 |
| 2 | 31-41 | 真实文档但不存在的 blockId → 降级文件级定位 | 假 blockId + 合法 ruleAnchors | 同上 | 独立 |
| 3 | 43-52 | 全部出处均不存在 → 降级待确认并保留原引用 | subjectAnchor/ruleAnchors 均指向假文档 | 同上 | 独立 |
| 4 | 54-60 | 全部出处真实有效 → 原样通过（不误伤） | 默认 finding | 同上 | 独立 |

## 3. 真实断言

- `:26-28` `severity` toBe `'yellow'`、`suggestion` toBe `'manual-review'`、`detail` toContain `'无法在案卷中核验'`。
- `:37-40` `subjectAnchor?.precision` toBe `'document'`、`blockId` toBeUndefined、`severity` toBe `'red'`（有合法出处不降级）、`ruleAnchors[0].blockId` toBe 真块 ID。
- `:49-51` `'yellow'`、`'manual-review'`、`subjectAnchor?.documentId` toBe `'doc-x'`（原引用保留供排查）。
- `:57-59` `'red'`、`subjectAnchor?.documentId` toBe 真实 ID、`detail` not.toContain `'[系统]'`。

## 4. 未覆盖与脆弱点

- `makeFinding` 用 `as unknown as` 强转（`:19`），形状漂移无编译期保护。
- 用例 1 未断言 ruleAnchors 同时假时的行为（与 subjectAnchor 假的组合面）。
- `sanitizeFindingSources` 的其它分支（如仅 ruleAnchors 假）未锚。
- 被测实现（`ai-review-service.ts`）不在本批。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 test/1 describe、fixture 结构 | 已证实 | `:8-60` |
| 假锚点降级三态断言 | 已证实 | `:26-51` |
| 真锚点不误伤 | 已证实 | `:57-59` |
| 测试通过与否 | 未知 | NOT_RUN |
| ai-review-service 实现细节 | 未知 | 批外 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 假 subjectAnchor | §2/§3 | 1 | covered |
| 假 blockId 降级 | §2/§3 | 2 | covered |
| 全假出处 | §2/§3 | 3 | covered |
| 全真出处 | §2/§3 | 4 | covered |
| 仅 ruleAnchors 假 | §4 | — | unknown |
