---
path: apps/electron/src/main/lib/skill-master-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1eccb9150734c1dea303b402f1a09065cc89236
sha256: f1ddd47ad66b7debe1909d8f4637f6f0d6c61f43ec6fad7555e347a70dafc58c
lines: 621
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-master-manager.ts

## 1. 结论与边界

Skill 主副本管理器（621 行）：全局 master skill 的读写/版本历史/回滚/同步到工作区/冲突检测——skill 分发的数据权威层。

## 2. 导出与关键符号（17 条，按组）

- **测试缝**（:32/:37）：`__setSkillMasterRoots`/`__resetSkillMasterRoots`（@internal 语义）。
- **内容读写**（:109-:185）：listMasterSkillSlugs/readMasterSkillContent/saveMasterSkill（写入产生版本快照 :129）/renameMasterSkillMeta/listMasterSkillHistory/getMasterSkillCurrentVersion/readMasterSkillVersionContent/**rollbackMasterSkill**（:199，快照回滚）。
- **元数据/判定**（:224-:286）：listMasterSkills/isMasterSkill/countMasterSyncedAll/countMasterSyncedWorkspaces。
- **同步/冲突**（:337-:397）：syncMasterSkillToWorkspace/batchSyncMasterSkill/**detectSkillConflict**（:397，`SkillConflict` 检出）。

## 3. 内部逻辑与关键流程

（导出图谱级，621 行）：版本快照=保存即留历史；同步带冲突检测（工作区副本 vs master 差异）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `ipc.ts:400-407`（**仅 4 只读符号** listMasterSkills/readMasterSkillContent/listMasterSkillHistory/detectSkillConflict）→ `ipcMain.handle(SKILL_MASTER_IPC_CHANNELS.*)` :3810-3838 → preload:4058-4070 → MasterSkillsTab 渲染端；**SAVE/RENAME_META/ROLLBACK/SYNC 四写通道已 throw 停用**（:3816-3828）。测试 `skill-master-manager.test.ts:5-18`（12 符号）。**13 export 仅测试使用**（全树符号级检索无生产命中）。出向：`node:fs`/`node:crypto`、`./config-paths`（:21）、`./default-skill-slugs`（:22）。

## 5. 数据 I/O、读写与副作用

读写 skill 文件+快照历史；工作区复制。

## 6. 分支、失败、取消与恢复

rollback=历史恢复；不适用取消。

## 7. 权限与权威状态

master 为分发权威；路径经 skill-path-security 边界。

## 8. 修改影响面

skill 分发/同步链。需同步测试（skill-master-manager.test 178 行）。

## 9. 测试证据

`skill-master-manager.test.ts`（批内，178 行，断言细节见姊妹手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 导出按组清单+行号 | 已证实 | 导出 grep |
| 同步/冲突/快照实现逐行 | 推断（导出签名级） | 全文件结构 |
| 13 export 仅测试使用+写通道已停用 | 已证实（否定） | 全树符号检索（§4） |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 17 导出（4 组） | §2 | :32-397 | covered（图谱级） |
| 同步/冲突实现 | §3/§10 | :286-621 | 推断 |
