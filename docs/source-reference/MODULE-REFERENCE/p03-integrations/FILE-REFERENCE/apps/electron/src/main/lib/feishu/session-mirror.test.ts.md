---
path: apps/electron/src/main/lib/feishu/session-mirror.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da801a6171d8a4d42ad2681ebc567202b0695211
sha256: e5cd24d8cd38d6c6f5ee6536b80fdb1025a8fd4ffe186d842f92d96dc6e94e36
lines: 61
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/session-mirror.test.ts

## 1. 测试目标

飞书 Session 镜像设置（`apps/electron/src/main/lib/feishu/session-mirror.test.ts:25`）：设置归一化、Bot 解析、群名构造。被测 `session-mirror.ts` 3 函数。夹具：`enabledBot/disabledBot` 两个 FeishuBotConfig（`:8-22`）。

## 2. 用例清单

共 **5 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 26-28 | 未配置 → 默认关闭 | toEqual `{mode:'off'}` | 独立 |
| 2 | 30-36 | 旧版通知配置归一化关闭 | 'completion' 归 'off' | 独立 |
| 3 | 38-45 | 多 Bot 指定一个 → 只选该 | `bot?.id` toBe enabledBot.id | 独立 |
| 4 | 47-54 | 指定 Bot 未启用 → null | toBeNull | 独立 |
| 5 | 56-61 | '新 Agent 会话' → 短 ID 群名 | toBe `'Profer - 新会话 12345678'` | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:27` toEqual；`:35` toEqual；`:44` toBe；`:53` toBeNull；`:58-60` toBe（id 前 8 位）。

## 4. 未覆盖与脆弱点

- botId 缺失/群名截断 60 上限无用例。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test、BDD 命名 | 已证实 | 全文 |
| 归一化/解析/命名三面锚 | 已证实 | `:27-60` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| normalize | §2 | 1-2 | covered |
| resolveSessionMirrorBot | §2 | 3-4 | covered |
| buildSessionMirrorGroupName | §2 | 5 | covered |
| 截断/无 botId | §4 | — | unknown |
