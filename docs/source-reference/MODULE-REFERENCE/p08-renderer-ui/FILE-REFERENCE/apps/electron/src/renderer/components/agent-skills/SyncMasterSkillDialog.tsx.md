---
path: apps/electron/src/renderer/components/agent-skills/SyncMasterSkillDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68acc39c288d5d0ba8bdbf1b0a870dd24c30aaa3
sha256: bd45ee93fb4090531c78e67ce2b5dde8131815af8cfb85c6a44e141ccc54a210
lines: 208
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/SyncMasterSkillDialog.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

同步全局元 Skill 到选定工作区对话框（208 行，头注 :1-7）：目标工作区（个人）逐一**预检冲突**；冲突工作区显示警告，用户可选「覆盖（强制）」或默认跳过；批量同步反馈结果。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SyncMasterSkillDialog` | 组件 | 31-208 | 同步对话框 |

内部：`TargetGuard`（:12-20）、`Props`（:22-30）。

## 3. 内部逻辑与关键流程

1. **预检**（:36-61）：`workspaces.filter(w.type!=='team')` 只留个人工作区；逐 target `skillMaster.detectConflict` 并行（失败保留原态）。
2. **覆盖标记**（:71-75）：`forceMark` 切换 enabled 并清 conflict（用户显式选覆盖）。
3. **`doSync`**（:77-97）：空选提示；`syncToWorkspaces(skill.slug, selected, { forceSlugs: conflictSlugs })`——**forceSlugs 只含用户标记覆盖的冲突项**；结果表渲染成功/失败+错误。
4. UI：冲突条目琥珀警告「检测到本地修改（N 文件），同步会强制覆盖」+「覆盖」按钮；结果区逐条 ✓/✕。

## 4. 调用者与调用链

入向：全局元 Skill 管理页。出向：`window.electronAPI.skillMaster.*`（detectConflict/syncToWorkspaces）、sonner、`@profer/shared`。

## 5. 数据 I/O、读写与副作用

经 IPC 写工作区技能；toast。

## 6. 分支、失败、取消与恢复

detectConflict 失败→该条无冲突标记（保守）；sync 失败→toast；syncing 期间锁关闭。

## 7. 权限与权威状态

- 强制覆盖知情权威：覆盖必须逐条显式标记（forceSlugs 只收显式项，:78-90）；默认跳过冲突。
- 范围边界：team 工作区不入目标列表（:38）。

## 8. 修改影响面

- 受影响消费者：元 Skill 分发链（个人工作区技能文件）。
- 回归关注：forceSlugs 只含显式覆盖、team 过滤、预检失败保守降级。
- 无专属测试文件（全树检索确认）；回归靠同步流程人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| forceSlugs 语义 | 已证实 | :78-90 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 预检/覆盖/同步全链 | §3 | 31-208 | covered（未测） |
