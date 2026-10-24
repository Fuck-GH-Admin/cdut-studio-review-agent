---
path: apps/electron/src/renderer/components/content-review/review-v3-t05-stage-actions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c684404c5bf26ec3560eda9b518d8ce1e2054e9f
sha256: 9a19a27b5a0e2b711ac9fab2421c3bcb1b5042fabfe719daf858162f71392cbc
lines: 56
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t05-stage-actions.ts

## 1. 结论与边界

**F11 阶段操作只读展示门禁**（`:1-6` 注释）：**Main 的 allowedActions 是能力投影不是授权令牌**（写入时 Main 仍重核）；**缺失能力投影或动作资格字段时一律不降级调用旧阶段命令**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T05StageAction` | type（export） | `:7-11` | stage-pass/return-for-supplement/return-to-previous-stage/final-reject |
| `T05StageActionCapability` | interface（export） | `:13-20` | mode/actorRole/eligibleTaskIds/hasCurrentRun/allowedActions?/blockers? |
| `T05StageActionState` | interface（export） | `:22-25` | enabled/reasons |
| `getT05StageActionState` | function（export） | `:27-56` | 门禁判定（§3） |

## 3. 内部逻辑与关键流程

按序收集 reasons（`:35-54`）：未接通可信写入（`:36`）；**无能力投影直接禁用并明示停止旧式回退**（`:37-39`）；非 local-business（技术预审禁业务决定 `:41`）；任务不匹配（open+assigneeRole+eligibleTaskIds 三关 `:42-45`）；未结补件计数（`:46`）；**allowedActions 缺失→「不能按旧逻辑推定可通过」**（`:47-48`）；不在 allowedActions→列 blockers 或兜底文案（`:49-50`）；**非补件动作需 hasCurrentRun**（缺材料时可先补件 `:52-53`）。`enabled = reasons 为空`（`:55`）。

## 4. 调用者与调用链

入向：`ReviewV3T05HumanWorkflow`（nb-85 手册 §3.1）。出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

六类 reason 分支（§3）；不适用取消/恢复。

## 7. 权限与权威状态

红线：投影≠令牌（`:4`）、不降级回退（`:5`）、缺投影禁用（`:37-39`）、缺资格不推定（`:47-48`）。

## 8. 修改影响面

- 改 reason 判定链 → 阶段按钮可点性与提示口径（消费方 T05HumanWorkflow）。
- 移除「缺投影即禁用」（`:37-39`）→ 旧式提交回退风险（契约红线）。
- 改 hasCurrentRun 门槛（`:52-53`）→ 无 Run 时可发起动作面变化。
- 改 allowedActions/blockers 透传 → Main 资格投影的展示一致性。
- 无测试锁定（§9）：改动需人工验证四动作×资格组合。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `getT05StageActionState` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+六类门禁 | 已证实 | 逐行读 `:1-56` |
| Main 能力投影实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+判定链 | §2/§3 | `:7-56` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
