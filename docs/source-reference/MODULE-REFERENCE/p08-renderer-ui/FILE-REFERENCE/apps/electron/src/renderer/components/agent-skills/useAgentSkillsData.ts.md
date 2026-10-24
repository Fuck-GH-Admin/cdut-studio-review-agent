---
path: apps/electron/src/renderer/components/agent-skills/useAgentSkillsData.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3ef114565ead8ce6d6447c8a43f45be6505eb19
sha256: 0d43c2da25270cabe6b3bb3dc114f6f7b1869ab0c5dc06e48cb956dabce9d7f8
lines: 184
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/useAgentSkillsData.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Agent 技能视图数据层（184 行，头注 :1-7）：封装工作区 Skills/MCP 加载与增删改（IPC）；**所有写操作后 bump `workspaceCapabilitiesVersionAtom`** 通知侧边栏等订阅方刷新。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentSkillsData` | interface | 15-38 | 状态+5 操作 |
| `useAgentSkillsData` | hook | 40-184 | 数据层实现 |

## 3. 内部逻辑与关键流程

1. **`loadData`**（:55-78）：无 slug 清空早退；四 IPC 并行（getWorkspaceMcpConfig/getWorkspaceSkills/getWorkspaceSkillsDir/getDefaultSkillSlugs）；`isCurrent()` 防过期 setState。
2. **刷新**（:81-87）：slug/`capabilitiesVersion` 变化重拉；注释 :79「保留现有列表避免白屏闪烁」。
3. **`toggleSkill`**（:90-105）：启用时**重复副本检测**——工作区副本与全局/元 Skill 并存时 `window.confirm` 警告「能力重复或行为冲突」可取消；带 `sourceSkillId` 区分同 slug 不同源条目。
4. **`deleteSkill`/`updateSkill`**（:108-136）：删除过滤列表；`updateSkillFromSource` 同步更新（busy 防重入）。
5. **`toggleMcp`/`deleteMcp`**（:139-175）：写 `saveWorkspaceMcpConfig`；**`isBuiltin` 条目删除直接 return**（:157）。
6. 全部写操作：成功 bump 版本+toast；失败 console.error+toast.error。

## 4. 调用者与调用链

入向：「Agent 技能」全屏视图。出向：`window.electronAPI`（8 IPC）、jotai（agent-atoms）、sonner。

## 5. 数据 I/O、读写与副作用

经 IPC 读写技能/MCP 配置；写 jotai；toast。

## 6. 分支、失败、取消与恢复

加载失败 console.error 不清既有列表；写失败回退本地状态（updateSkill busy finally 复位）；confirm 取消即中止。

## 7. 权限与权威状态

- 冲突告知权威：同 Skill 双源并启必须显式确认（:91-93，防能力重复/行为冲突）。
- 内置保护：`isBuiltin` MCP 不可删（:157）。
- 刷新一致性：写后 bump 版本通知全端订阅方。

## 8. 修改影响面

- 受影响消费者：Agent 技能视图、侧边栏能力订阅方（版本 bump 链）。
- 回归关注：双源确认弹窗、isBuiltin 保护、过期 setState 防护。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/行号 | 已证实 | 逐行核对 |
| 双源确认/isBuiltin/版本 bump 语义 | 已证实 | :91-93/:157/:102 等 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useAgentSkillsData` 全链 | §3 | 40-184 | covered（未测） |
