---
path: apps/electron/src/renderer/components/agent-skills/WorkspaceMemoryTab.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 57ad277ad7fbf9f5b03ea2342930613fa8a3eb86
sha256: 0f2829e85eed1b124b49fb44f8dd486b4f729b42cdbec21c099d1afe5b3e64bc
lines: 939
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/WorkspaceMemoryTab.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

工作区记忆页（939 行）：三源记忆管理（CLAUDE.md 工作区资料 / Auto Memory `MEMORY.md` 索引 / Memory Archive 主题）+正文搜索+wikilink 双链跳转+反链+防抖自动保存+「生成记忆」初始化会话。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WorkspaceMemoryTab` | 组件 | 155-799 | 主页面 |

内部：`AUTO_MEMORY_INDEX='MEMORY.md'`（:26）、`MEMORY_HISTORY_RANGE_OPTIONS`（:30-35，1m/2m/3m/all）、`buildWorkspaceMemoryInitPrompt`（:41-85，10 节初始化指令——含用户画像增量迭代/证据不足不编造/时间标注/主题拆分规则）、`autoMemoryPath`/`joinArchivePath`（:92-127，**分隔符风格沿用主进程 join 防混合路径**）、`dirnameOf`、`filterNodes`、`withVirtualMemoryIndex`（:137-153 虚拟 MEMORY.md 节点）、子组件 `MemorySummaryButton/MemoryStatCard/FileButton/MemoryTreeNode`（:801-939）。

## 3. 内部逻辑与关键流程

1. **加载**（:355-388）：四 IPC 并行（summary/auto files/archive files/CLAUDE.md）；`workspaceSlug` 变化重置。
2. **自动保存**（:174-260/:390-407）：`saveStateRef` 持最新编辑态（注释 :174-177 防依赖数组膨胀）；800ms 防抖；`flushPendingSave` 切文件/刷新/卸载前 flush（`showSaving` 控制 450ms 最短动画）；in-flight promise 去重。
3. **三源读写**（:262-327）：`persistTarget` 按 kind 分派 `writeWorkspaceProfile/writeWorkspaceMemoryArchiveFile/writeWorkspaceAutoMemoryFile`；写后刷新摘要并**仅当用户仍在同一文件**才回写 absolutePath（:287-291 防覆盖已切换 selected）。
4. **wikilink 双链**（:330-345）：`resolveMemoryWikilink`→按 kind 打开；未命中 toast。
5. **反链**（:348-365）：`getMemoryBacklinks`（匹配 stem 去 .md）。
6. **生成记忆**（:489-508）：`createAgent`+`setPendingPrompt(buildWorkspaceMemoryInitPrompt(historyRange))`——授权范围内首批至多 3 会话、证据不足说明缺口不得越权（rangeGuidance :44-46）。
7. **正文搜索**（:184-205）：`searchMemoryArchive` 180ms 防抖 limit 20；注释 :510「文件树始终完整展示，避免双重语义」。
8. **UI**：左树（CLAUDE.md/Auto/Archive 三区+虚拟 MEMORY.md）；右编辑器（preview/edit 切换、`DefaultAppOpenButton` 携 `access:{workspaceSlug}`——注释 :714-717 SYSTEM_OPEN_FILE 默认拒绝必须显式授权）；反链区。

## 4. 调用者与调用链

入向：设置→工作区记忆。出向：`window.electronAPI`（12+ 记忆 IPC）、`useCreateSession`、`@/components/ai-elements/message`（WikilinkClickProvider/remarkWikilinks）、`@/atoms/agent-atoms`、settings primitives。

## 5. 数据 I/O、读写与副作用

经 IPC 读写记忆文件；toast；创建 Agent 会话。

## 6. 分支、失败、取消与恢复

各读写失败 toast+console.error；自动保存失败回置 isDirty（:247-250）；cancelled 防卸载 setState。

## 7. 权限与权威状态

- 打开授权权威：SYSTEM_OPEN_FILE 默认拒绝，记忆文件须显式工作区授权上下文（:714-717）。
- 生成授权边界：历史范围 1m/2m/3m/all 显式授权，「不得自行越过」+证据不足说明缺口（:44-46）。
- 防丢：卸载/切换前强制 flush（:409-414）。

## 8. 修改影响面

- 受影响消费者：工作区记忆读写/初始化生成链。
- 回归关注：分隔符归一、selected 回写防护、flush 时机、授权上下文。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| 防丢/授权/范围语义 | 已证实 | :174-260/:714-717/:44-46 |
| 真实记忆链行为 | 未知 | 无测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 加载/自动保存/flush | §3.1-3.2 | 155-260 | covered（未测） |
| 三源读写/双链/反链 | §3.3-3.5 | 262-365 | covered（未测） |
| 生成记忆/搜索/UI | §3.6-3.8 | 388-799 | covered（未测） |
