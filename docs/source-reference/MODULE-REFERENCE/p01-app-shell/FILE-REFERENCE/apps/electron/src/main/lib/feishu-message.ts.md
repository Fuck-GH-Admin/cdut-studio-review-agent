---
path: apps/electron/src/main/lib/feishu-message.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d1a12f1229529686a50799947d247a529c0a5c2f
sha256: 926a2c3d1ac58d330bade17d8371e03a1f4fd21e5b29d55727ad4737a3d6fcbc
lines: 416
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu-message.ts

## 1. 结论与边界

**飞书消息格式化纯函数库**（416 行，**零 import**）：Agent 结果→飞书交互卡片；卡片壳统一 `wide_screen_mode`；splitLongContent 分片。

## 2. 导出与关键符号（13 个 export）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ToolSummary`/`FormattedAgentResult` | `:10`/`:17` | 工具摘要/结果形状 |
| `buildAgentReplyCard` | `:26-46` | 回复卡（'CDUT Studio Agent' 蓝 `:33-35`；text 走 truncateForFeishu `:28`） |
| `buildErrorCard` | `:53-61` | 'Profer 错误' 红卡（**不截断** `:61`） |
| `WorkspaceListItem`/`buildSessionListCard` | `:67`/`:78-130` | /list 卡（▶ 活跃标记 `:95`） |
| `buildWorkspaceSwitchedCard`/`buildWorkspaceListCard` | `:138`/`:184` | 工作区切换/列表卡 |
| `buildHelpCard` | `:216` | 'Profer Bot 命令'（`:220`） |
| `buildChannelListCard`/`buildModelListCard`/`buildModelSwitchedCard` | `:247`/`:279`/`:315` | 渠道/模型卡片族 |
| `splitLongContent` | `:369-394` | 段落边界→行边界→硬拆三级（25000 默认） |
| `accumulateToolStart` | `:402-414` | 工具计数（hasError 恒 false 照实） |

内部：`formatToolSummaryLine:339-353`（**hasError 从不参与输出**）、`truncateForFeishu:361-363`（截断+固定后缀）。

## 3. 内部逻辑与关键流程

纯卡片构造+两级文本处理（truncate 仅 reply text；split 三级边界防死循环）。

## 4. 调用者与调用链

`feishu-bridge.ts`（11 个卡片函数+splitLongContent+accumulateToolStart）；零出向依赖。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

空数组兜底文案族；split maxLength>0 保证收敛。

## 7. 权限与权威状态

卡片模板（蓝/绿/红语义）+命令帮助文案即 Bot 交互契约。

## 8. 修改影响面

改文案/结构影响飞书 UX；25000 上限与飞书 30KB 限制口径（照实 §10）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出/卡片族/分片 | 已证实 | 416 行全读（零 import 字节核实） |
| **①** `:7` "保留 import"失实（零 import）；**②** 头注释"Agent 事件转换"过时；**③** 品牌混用（CDUT Studio Agent/Profer） | 已证实 | 字节核对 |
| **④** `:359` 30KB 按字节 vs 25000 按字符（中文最坏 ~75KB）"保守"不成立；**⑤** ToolSummary.hasError 孤儿（只写 false 从不读）；**⑥** help `/workspace <名称>` vs note `<序号或名称>` | 已证实 | `:359`/`:13`/`:234`/`:207` |
| 调用方链路（truncate+split 是否同链） | 未知 | 调用方在外 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 13 导出/卡片族 | §2/§3 | covered |
| 9 矛盾 | §10 | covered |
