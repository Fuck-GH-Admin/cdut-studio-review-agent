---
path: apps/electron/src/main/lib/automation-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ade0b5840d0feded69c21af7f5e0b4d4f982951d
sha256: d7016284a1189debbf65422ca4375d75a94107e59df5cc3d914a7411884d8522
lines: 557
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/automation-manager.ts

## 1. 结论与边界

**定时任务管理器**（557 行）：CRUD+运行历史持久化；索引 `~/.proma/automations.json`（原子写 safe-file 模式照搬 agent-session-manager）；"调度逻辑见 automation-scheduler.ts，**本文件只管数据**"（`:1-9`）。

## 2. 导出与关键符号（10 个 export）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `computeNextRunAt` | `:166-224` | 下次触发时间：once 固定 scheduledAt 不随 from 前进（过去值保留补跑 `:176-185`）/interval/daily/weekly/monthly→`computeNextRunAtMulti`；非法一律回退 from+10min |
| `listAutomations`/`getAutomation` | `:294`/`:299` | 查询（createdAt 升序） |
| `applyMaxRunsUpdate` | `:321-329` | maxRuns 变更重置 runCount/completedAt（**孤儿导出** 照实 §10） |
| `createAutomation` | `:347-395` | 草稿强制 inactive（`:350-352`）；permissionMode 缺省 'bypassPermissions' |
| `updateAutomation` | `:400-477` | patch+调度参数变更重算+启用校验（throw '启用定时任务前必须配置模型与工作区' `:460`）+重新跑配额（`:463-471`） |
| `deleteAutomation` | `:485-493` | filter 删除（无变化不写盘） |
| `appendRun` | `:505-537` | runHistory 截留 20 条；**skipped 不推进调度**（`:500-501` 防 N×interval 拉长）；失败计数/自动完成 |
| `setNextRunAt`/`setLastSessionId` | `:542`/`:551` | 调度器恢复/会话记录 |

内部：`INDEX_VERSION=3:36`、`migrateLegacyFields:52-95`（v1 'new'→'daily'/'auto'→'bypassPermissions'/单值→数组）、`readIndex:105-143`（缓存+缺 version 警告丢弃+高版本只读回滚 `:118-131`）、`writeIndex:145-154`（原子写失败 throw）、`computeNextRunAtMulti:232-291`（月度 setDate(1) 防溢出 `:268-287`）、`isAutomationRunnable:304`、`normalizeMaxRuns:312`、`shouldAutoComplete:339-344`。

## 3. 内部逻辑与关键流程

写穿缓存（`:97-103` 同步 IO 无竞态注释）→读迁移→CRUD→appendRun 推进调度+失败退避计数+自动完成（runCount 含成功失败不含 skipped `:337`）。

## 4. 调用者与调用链

`automation-scheduler.ts`（7 导出接线）；出向 safe-file/config-paths/agent-preset-manager（lazy require 破环）/shared 常量。

## 5. 数据 I/O、读写与副作用

JSON 原子写/读、缓存。

## 6. 分支、失败、取消与恢复

版本回滚只读；写失败 throw；启用校验 throw；配置清空自动停用（`:475-477`）。

## 7. 权限与权威状态

- **数据/调度分离契约**（`:5`）。
- **skipped 不推进**（`:500-501`）：防重入跳过拉长周期。
- permissionMode 缺省 bypassPermissions（无人值守前提，与 scheduler 联动）。

## 8. 修改影响面

改迁移/推进语义影响存量任务；调度器 7 导出契约联动。

## 9. 测试证据

`automation-manager.test.ts`（同批，13 个 `test(`）：仅测 computeNextRunAt（月度溢出/多值组合），CRUD/迁移无测试（缺口照实）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/迁移/推进/缓存 | 已证实 | 557 行全读 |
| **①** applyMaxRunsUpdate 孤儿导出（全仓仅 `:428` 自用）+undefined 分支生产不可达；**②** `:460` 文案"模型与工作区"vs 实校验 channelId+workspaceId（渠道非模型） | 已证实 | grep+`:304-306` |
| **③** 与 agent-preset-manager 顶层 import/lazy require 循环依赖（混杂风格）；**⑥** 存空数组算默认 vs 计算回退 DEFAULT_*（设计照实） | 已证实 | `:28`/`:39`、`:355-357`/`:196-210` |
| safe-file/preset-manager 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 10 导出/迁移/推进 | §2/§3 | covered |
| 3 红线 | §7 | covered |
| 8 矛盾 | §10 | covered |
