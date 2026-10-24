---
path: apps/electron/src/renderer/components/cdut-zone/AiClassTeachingModeBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7eaf4a38ffb8ff791d6ced6510bc02d2bfae43f
sha256: 7cbf3baacb4fe44c4d326d2c5338498917f6ab783807ff7fa199a78d08a072d9
lines: 89
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassTeachingModeBar.tsx

## 1. 结论与边界

AI 速课堂**带教模式三档切换胶囊**（89 行）：挂 AgentView composer-stack 顶部（仅 variant="ai-class"，`:4`）。状态策略（`:5-7`）：atom 只存"本次运行内显式覆盖"，有效模式=`override ?? sessionMeta?.studyTeachingMode ?? 'balanced'` 派生，**不做 meta→atom 回填**（杜绝快速切换会话竞态）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassTeachingModeBar` | `:40` | 唯一 export：`({sessionId, sessionMeta?})`：三档胶囊（role=radiogroup/radio、aria-checked、title）；点击→覆盖 atom+`updateSessionStudyTeachingMode` IPC（下一轮 buildSystemPrompt 生效 `:48`） |

内部：`TEACHING_MODE_OPTIONS:17-27`（fast'⚡轻快'/balanced'🎯精讲'/strict'🏆硬核'）、`TEACHING_MODE_LABELS:29-33`（toast 文案）、props `:35-38`；`handleSelect:46-55`（同档短路→setOverride→IPC→toast.info 无条件）。

## 3. 内部逻辑与关键流程

派生有效模式→选项 map 高亮→点击链（atom 覆盖即时+IPC 异步持久化+toast）。

## 4. 调用者与调用链

`AgentView:3465`（`isAiClass &&` 条件挂载，子agent 对拍）；出向 `@/atoms/agent-atoms`（studyTeachingModeAtomFamily per-session）、`window.electronAPI.updateSessionStudyTeachingMode`、sonner。

## 5. 数据 I/O、读写与副作用

IPC 持久化+atom 写+toast。

## 6. 分支、失败、取消与恢复

IPC 失败→console.error+toast.error 但**override 不回滚**（UI 与 meta 分叉，矛盾①）；toast.info 无条件弹（失败时双 toast 并存，矛盾②）。

## 7. 权限与权威状态

- **派生态权威**（`:5-7`）：覆盖仅本次运行有效；meta 为持久权威（`?? 'balanced'` 兜底）。
- 无 reset 途径（atom 只写不清，覆盖后不回跟随 meta，矛盾④——照实）。

## 8. 修改影响面

改三档影响带教行为；atomFamily 契约联动 agent-atoms；文案双表（按钮 label vs toast LABELS 不一致，矛盾③）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件状态策略/IPC/可访问性 | 已证实 | 89 行全读（字节核对） |
| **①** 失败不回滚与 AiClassView toggle 回滚策略不一致；**②** 双 toast 并存；**③** 双标签文案表不一；**④** 无 reset 途径 | 已证实 | `:49-54`/`:24-32` |
| atomFamily 持久化语义/buildSystemPrompt 链路 | 未知 | 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/状态策略 | §2/§3 | covered |
| 4 矛盾 | §10 | covered |
