---
path: apps/electron/src/main/lib/agent-delegation-preset-schema.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 112befd649b0a9e2e850b7c7387c096ca6470771
sha256: 0b7d1df9d4a3b0309843ca14870e28a9fea149186ad81d4f58a4e93eab3886bd
lines: 35
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-delegation-preset-schema.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-delegation-preset-schema.ts` 两端（Zod/TypeBox）presetReference schema 的字段 parity：Zod 版接受全部稳定引用字段、拒绝空 ID 与未知 scope；TypeBox 版暴露同字段集。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 3（`test(` 计数：:10/:20/:26），1 个 describe（:9）。逐条：

| # | 用例（行） | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | Zod 接受全字段（:10） | `buildZodDelegationPresetReferenceSchema(z)` | `safeParse({presetId:'review', presetScope:'workspace', workspaceSlug:'workspace-a', presetVersion:'v3'})` | `.success === true`（:12-17） |
| 2 | Zod 拒绝空 ID/未知 scope（:20） | 同上 | `safeParse({presetId:' ', presetScope:'workspace'})`、`safeParse({presetId:'review', presetScope:'unknown'})` | 均 `.success === false`（:22-23） |
| 3 | TypeBox 字段 parity（:26） | `buildTypeBoxDelegationPresetReferenceSchema(Type)` 断言 cast 为 `{properties}` | 读 `schema.properties` | `toHaveProperty` presetId/presetScope/workspaceSlug/presetVersion 四项（:30-33） |

依赖顺序：独立（每用例新建 schema）。

## 3. 真实断言

- `:12-17`：`expect(schema.safeParse({...}).success).toBe(true)`。
- `:22-23`：`expect(schema.safeParse({ presetId: ' ', presetScope: 'workspace' }).success).toBe(false)`、`expect(schema.safeParse({ presetId: 'review', presetScope: 'unknown' }).success).toBe(false)`。
- `:30-33`：`expect(schema.properties).toHaveProperty('presetId')` 等 4 行。

## 4. 未覆盖与脆弱点

- 未覆盖：TypeBox 版校验行为（`minLength:1` 不 trim，`" "` 可通过——与 Zod 版不对称）、TypeBox 枚举值内容（测试只查属性名存在，:30-33 未查 `presetScope` 的 Literal 集）、`presetVersion`/`workspaceSlug` 的 trim+min 语义、`.optional()` 整体可选语义。
- 脆弱点：用例 3 把 TypeBox schema cast 成 `{properties}` 只查形状存在，两端 parity 断言较弱；Zod 版当前在生产路径不可达（见被测文件手册 §4），本测试是其唯一覆盖。
- mock/真实边界：真实 `zod`/`typebox` 库，无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例计数与 `test(` 一致 | 已证实 | :10/:20/:26 |
| 断言行如 §3 | 已证实 | 逐行读 :12-33 |
| Zod 拒绝空白 ID（trim 后 min 1）被断言 | 已证实 | :22 |
| TypeBox 校验强度 | 未知 | 测试未断言，SDK 强制语义未读 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| Zod 接受全字段 | #1 | covered |
| Zod 拒绝空白/未知 scope | #2 | covered |
| TypeBox 字段存在 | #3 | partial |
| TypeBox 校验/枚举内容 | — | unknown |
