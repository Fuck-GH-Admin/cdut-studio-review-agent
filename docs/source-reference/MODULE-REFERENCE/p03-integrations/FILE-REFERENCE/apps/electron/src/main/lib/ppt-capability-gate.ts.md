---
path: apps/electron/src/main/lib/ppt-capability-gate.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 528b9b575b137aa34c34f4dae2faa81e880e1c79
sha256: 86311dfef70721f373da1369e655bf3ccfd59383d9c776f688157822cb783de5
lines: 45
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-capability-gate.ts

## 1. 结论与边界

PPT 能力门（`:20-24` 注释）：判定当前会话是否暴露 PPT 专用能力。**刻意做成纯、保守的门**——激活只暴露工具；Deck Brief 确认仍是独立的编译期写入门。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 2 个接口 + 1 个函数 = 4 个导出（类/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PptCapabilityDecision` | type（导出） | 1 | `'activate'\|'stay_active'\|'deactivate'\|'inactive'` | |
| `EvaluatePptCapabilityInput` | 接口（导出） | 3-7 | `{userMessage,active,hasActiveDeckProject}` | |
| `EvaluatePptCapabilityResult` | 接口（导出） | 9-13 | `{decision,active,reason}`（5 种 reason） | |
| `evaluatePptCapability` | 函数（导出） | 25-45 | 纯判定 | |
| 四个正则 | 内部 | 15-18 | `PPT_ARTIFACT_PATTERN`/`PPT_ACTION_PATTERN`/`DECK_CONTINUATION_PATTERN`/`EXIT_PATTERN` | |

## 3. 内部逻辑与关键流程

`evaluatePptCapability`（`:25-45`）按序：①EXIT（`退出/关闭/停止/不要继续…+PPT 类词`）→ `deactivate`；②已激活 → `stay_active`；③**显式意图=工件词∩动作词**（`PPT_ARTIFACT_PATTERN && PPT_ACTION_PATTERN`，`:35`）→ `activate`；④有活跃 deck 项目且续做语句（`第 N 页/这份 PPT/继续做/刷新预览` 等）→ `activate('deck_continuation')`；⑤→`inactive`。

## 4. 调用者与调用链

入向：会话能力编排（消息预判）；测试：`ppt-capability-gate.test.ts`（44 行，本批）。出向：无 import（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态。

## 6. 分支、失败、取消与恢复

四分支决策矩阵（§3）；无抛错/取消概念。

## 7. 权限与权威状态

保守门（`:22-23`）：暴露工具≠允许写——Deck Brief 确认独立把关。

## 8. 修改影响面

改正则影响 PPT 能力触发率；影响 `ppt-capability-gate.test.ts`。

## 9. 测试证据

直接测试：`ppt-capability-gate.test.ts`（44 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯保守门/写门分离 | 已证实 | `:20-24` |
| 四分支+双正则意图 | 已证实 | `:25-45` |
| 触发率实测 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 判定四分支 | §3 | 25-45 | covered |
| 正则族 | §2 | 15-18 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
