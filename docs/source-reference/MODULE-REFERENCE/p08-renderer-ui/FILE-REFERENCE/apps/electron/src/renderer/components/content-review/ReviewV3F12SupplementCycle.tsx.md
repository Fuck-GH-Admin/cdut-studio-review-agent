---
path: apps/electron/src/renderer/components/content-review/ReviewV3F12SupplementCycle.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d487abe7121d93059d51fbc26100eb233b65435
sha256: edf24479fb13f2d284779ca5aebaed9572980c84e74a436da147f6c1725dbeff
lines: 186
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3F12SupplementCycle.tsx

## 1. 结论与边界

**F12 补件工作区**（`:1-4` 注释）：跨请求清单、申请方回件、审核员核验、再审核提示；**仅调用既有 V2 补件命令，状态写入由 Main/CAS 负责**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3F12SupplementCycle` | function（export） | `:156-186` | `({aggregate, onResult})` 汇总+卡片列表 |

内部：`SupplementReplyCard`（`:25-154`）、`submitter/reviewer` Actor（`:16-17`）、`statusName` 5 状态（`:18-21`）、`commandId`（`:22-23`）。

## 3. 内部逻辑与关键流程

1. 卡片状态门（`:33-35`）：canRespond（open/responded/insufficient）、canVerify（responded）、canCancel（open/responded）。
2. 回复（`:101-135`）：note+勾选候选材料（`getF12ReplyDocumentCandidates` `:32`）；**无申请时版本快照→琥珀提示不能确认新补交原件，需人工核对**（`:117-119`）；`respondSupplementV2` CAS（expectedRevision `:127`）；「提交回复不等于通过核验；每条请求单独留回执」（`:133`）。
3. 核验（`:61-73/:136-150`）：三结果 satisfied/insufficient/cancelled，**reason 必填**（`:144-147` disabled）；`resolveSupplementV2` CAS。
4. 提交（`:37-59`）：**无回执→提示刷新核查**（`:42-44`）；失败展示 `code：message`；onResult 上抛。
5. 汇总（`:158-183`）：未结计数、清单要素（未结划线 `:167`）、**readyForReview 明示「补件核结本身不是审核通过」**（`:174-176`）、**阶段卡在等待补件→不擅自解锁审批**（`:177-179`）。

## 4. 调用者与调用链

入向：F12 补件面板挂载处。出向：`./review-v3-f12-supplement-cycle`（2 投影 `:8`）、`window.reviewAPI`（respond/resolveSupplementV2）、`@profer/shared`/`@profer/ui`。

## 5. 数据 I/O、读写与副作用

写：补件回复/核验命令（CAS）；无本地持久化。

## 6. 分支、失败、取消与恢复

无回执/失败均显式提示（`:42-47`）；busy 防重；回件历史保留全部版本（`:89`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：写入归 Main/CAS（`:3`）；回复≠核验（`:133`）；核结≠审核通过（`:175`）；阶段回流不擅改（`:178`）。

## 8. 修改影响面

改工作区 → 补件循环 UX 与状态机提示。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3F12SupplementCycle` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+1 内部+回复/核验全链 | 已证实 | 逐行读 `:1-186` |
| f12 投影/命令实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:25-186` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
