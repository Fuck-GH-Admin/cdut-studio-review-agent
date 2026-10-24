---
path: apps/electron/src/renderer/components/content-review/ReviewV3T07JudgePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b7b13dc69ccaa95290cb451a98b58a5a200f1fb3
sha256: d939e259719e741d5689b6046db9f79474e99edb228c42839b6345fc8e693da8
lines: 364
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T07JudgePanel.tsx

## 1. 结论与边界

**T07 独立评委评分面板（受控组件）**（Props `:5-12`）：**可信 Main 投影当前 actor 数据后才供给 view**；**L/Main 附真实 actor/revision/幂等键，提交后调用方刷新**；`onOpenDocument` 只接受**已授权该评委的不透明文档引用**。盲评红线：本人任务与已授权匿名资料外不可见（其他评委分数/身份/名次 `:37`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T07JudgePanel` | function（export） | `:21-48` | judge/organizer 分派（`:41-43`） |

内部：`T07JudgeTasks`（评委侧 `:50-179`）、`T07OrganizerDesk`（组织者侧 `:181-337`）、`T07TieResolver`（同分裁定 `:339-364`）。

## 3. 内部逻辑与关键流程

### 3.1 评委侧（`:50-179`）

- 任务导航（blindLabel+状态徽标 `:84-89`）；可编辑条件=assigned 且未定稿（`:64`）。
- 提交门（`:65-72`）：每维度有值且在 [min,max]；**N/A 仅限 naEligibleDimensionIds**（条件已由业务规则确认 `:147`）。
- 三态展示：已提交（**提交后发现利益关联仍可主动回避，撤销票保留审计** `:116-125`）/回避或缺评（需组织者重分配 `:127-128`）/待评（评分表+对外评语+内部备注（**对申请人及其他评委隐藏** `:161`）+回避声明（**回避不计零分** `:167`））。

### 3.2 组织者侧（`:181-337`）

- 头部：批次/轮次/最低有效人数/名额/冻结态（`:213-219`）。
- 分配/替补（`:220-237`）：assignmentId 生成（`:232`）；替补须先处理原任务（`:235`）。
- 指派状态（`:238-268`）：回避/标缺评（assigned）、退回改分（submitted，`request-revision`）均**原因必填**。
- 更正历史（`:269-279`）：revisionHistory 全留痕。
- 汇总表（`:280-317`）：有效评委/缺口、**各维度分母**（票数 `:290-295`）、均分/折算/排名/名额（待裁定/入选/未入选 `:298`）、blockers（**「N/A 不按 0 分；缺评不参与均分。分歧、最低人数和跨名额同分需处理后才能冻结」** `:316`）；分歧复核（`resolve-divergence` `:302-310`）。
- 同分（`:318-321`）：`owner-decides` 时 `T07TieResolver`（上移/下移→`set-tie-order` `:339-364`）。
- 定稿（`:322-334`）：冻结需 **allReady（零 blockers 且全部裁定）+确认勾选**（`:330-332`）；已冻结→重开下一轮（**保留历史与原定稿快照** `:325`，原因必填）。

## 4. 调用者与调用链

入向：`ReviewV3T07Workbench`（同批）。出向：`review-v3-t07-rating-workflow`（类型 `:3`）、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

无直接 I/O；动作经 onAction（Main CAS）。

## 6. 分支、失败、取消与恢复

提交失败→error；状态机（assigned/submitted/recused/missing/finalized）分支。不适用取消/恢复。

## 7. 权限与权威状态

红线：view=Main 投影（`:6`）、actor 归 L/Main（`:8`）、盲评隔离（`:37`）、N/A 受业务规则（`:147`）、冻结门槛（`:316/:330`）。

## 8. 修改影响面

改面板 → 评分/回避/定稿全链与盲评合规。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T07JudgePanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+双侧全链 | 已证实 | 逐行读 `:1-364` |
| Main T07 状态机 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+双侧 | §2/§3 | `:21-364` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
