---
path: apps/electron/src/main/lib/channel-plan-quota-parsers.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a322eeb42aae5b94c4d41bcc2105f9141260a2b8
sha256: b05a2edc10bd22326890b4737d9ed8550cfc3350f26b8b22a92f602232367761
lines: 40
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-plan-quota-parsers.ts

## 1. 结论与边界

MiniMax Token Plan 通用额度响应 → `ChannelPlanQuotaWindow[]` 的映射器（40 行，1 导出）。关键语义（`:22` 注释）："**0 是有效 weekly total，只有 null/undefined 表示该窗口缺失**"。

不做的事：不发请求（channel-manager `queryMiniMaxPlanQuota` 调本函数）；不处理其他供应商。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `parseMiniMaxGeneralQuotaWindows` | `:23-40` | `(items: MiniMaxGeneralRemain[]) => ChannelPlanQuotaWindow[]`：每项必产 `type:'5h'` 窗口（剩余 = `current_interval_remaining_percent ?? 100`）；`current_weekly_total_count != null` 才产 `type:'weekly'` 窗口（`:31`，**truthiness 不用于判缺失**——0 合法） |

内部：`MiniMaxGeneralRemain:3-9`（5 个可选字段）；`clampPercent:11-14`（非有限→0，clamp 0..100 取整）；`resetAt:16-20`（秒/毫秒启发式：`<10_000_000_000` 视为秒×1000 `:18`，非正不输出）。

## 3. 内部逻辑与关键流程

循环逐项：5h 窗口恒产（remainingPercent/usedPercent=100-remaining + `resetAt(end_time)` 展开）；weekly 窗口条件产（`resetAt(weekly_end_time)`）。纯函数无副作用。

## 4. 调用者与调用链

`channel-manager.ts`（`:30` import；唯一调用点 `apps/electron/src/main/lib/channel-manager.ts:1192` `queryMiniMaxPlanQuota` 内，输入为 `model_remains` 过滤 `model_name==='general'` 后的项，配套语义注释 `apps/electron/src/main/lib/channel-manager.ts:1191`）；被自身测试直调。出向：`@profer/shared`（`ChannelPlanQuotaWindow`）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

不适用。边界分支：`current_weekly_remaining_percent ?? 100` 缺省满额（`:32`）；`resetAt` 非有限/非正→不输出该字段（`:17-19`）。

## 7. 权限与权威状态

`0 是有效值`的判缺失权威（`:22`、`:31`）——与 truthiness 直觉相反，是本文件的核心契约。

## 8. 修改影响面

改映射影响 MiniMax 额度 hover 显示；与 channel-manager 的 `clampPercent`/时间戳归一是**重复实现**（`apps/electron/src/main/lib/channel-manager.ts:1034-1037`/`apps/electron/src/main/lib/channel-manager.ts:1039-1049` 平行存在，照实记录，见 channel-manager 手册矛盾表）。

## 9. 测试证据

直接测试 `channel-plan-quota-parsers.test.ts`（2 个 `test(`）：weekly total=0 仍保留窗口（remainingPercent 0/usedPercent 100）、weekly 缺失不虚构窗口。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 3 内部、0-is-valid 契约 | 已证实 | 文件全读（40 行） |
| 秒/毫秒启发式阈值 1e10 | 已证实 | `:18` |
| `ChannelPlanQuotaWindow` 完整字段 | 未知 | shared 定义不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全文件 | §2/§3 | covered |
| 0-is-valid 契约 | §7 | covered |
| 测试/未知 | §9/§10 | covered |
