---
path: apps/electron/src/renderer/components/agent/ContentBlock.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 458b4768ee0299d06424d28fa2e76fda1818cfea
sha256: 8cfb3b4eb1c2583cd566113a8b1522eb43c9b3f80f528fa202f2e66d51109440
lines: 831
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ContentBlock.tsx

## 1. 结论与边界

单个 SDKAssistantMessage 内容块渲染（文件头 `:1-7`）：三种块——①text→`MessageResponse` 渲染 Markdown；②tool_use→语义化短语行（如“读取 foo.ts 第 10-60 行”）+展开结构化结果；③thinking→Claude 等可读 thinking 展示（**Pi/GPT 内部概览由上层过滤不渲染思考框**）。纯展示组件族（数据经 props/查询 hooks）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ContentBlockProps` | interface | `:208-229` | `{block, allMessages, basePath/basePaths, animate, index, dimmed, childBlocks, isStreaming, showThinking=true}` |
| `ContentBlock` | React.memo 组件 | `:763-831` | 自定义比较器（`:821`） |

内部：`useToolResult`（`:57-91`，allMessages 中按 toolUseId 找工具结果）、`useSubAgentMeta`（`:102-119`，task_notification 系统消息提取用量）、`parseAgentResultText`（`:131-155`，分离 agentId 行+`<usage>` 标签与正文）、`SubAgentFooter`（`:159`）、`PromptRow`（`:233`，提示词折叠行）、`TaskGetCollapsedSummary`/`TaskListCollapsedSummary`（`:279/:313`，工具短语 diff 着色）、`ToolUseBlock`（`:360-668`，工具调用块主实现）、`ThinkingBlock`（`:680-760`，默认展开、Thinking 标签+虚线边框、折叠阈值 `THINKING_COLLAPSE_LINE_THRESHOLD=4` 行）。

常量：`COMMAND_COPY_FEEDBACK_MS=1500`（右键复制命令的行内反馈时长，`:341`）、`CommandCopyState`（idle/copied/failed，`:344`）。

## 3. 内部逻辑与关键流程

### 3.1 结果回填（`:48-155`）

`useToolResult` 按 toolUseId 在消息列表找匹配 tool_result；`useSubAgentMeta` 从 task_notification 提取 SubAgent 用量；`parseAgentResultText` 从 Agent tool_result 文本剥离 agentId/`<usage>` 元数据（`SubAgentFooter` 展示）。

### 3.2 `ToolUseBlock`（`:360-668`）

按工具类型生成语义短语（task get/list 等有专属折叠摘要+diff 着色）；展开显示结构化结果；右键复制命令（1500ms 行内反馈，失败态）；`dimmed/animate/isStreaming/childBlocks/basePath(s)` 多态适配。

### 3.3 `ThinkingBlock`/主组件

thinking 默认展开、超 4 行折叠；`ContentBlockView` 按 block.type 分发三类（showThinking=false 时跳过思考块）；`React.memo` 自定义比较器（`:821-831`）。

### 3.4 机器协议块与本地图片标记（NB91-SEM-02 补录）

- **`<goal_result>` 剥离**（`:770`）：Goal 迭代的机器协议块（预算/契约/goal_result）**只用于主进程解析，不做展示**（`:770` 注释口径；Goal 迭代分隔条语义见 SDKMessageRenderer）。
- **本地图片标记兼容**（`:769`）：历史消息中的本地图片标记保留兼容路径；新工具结果使用结构化附件。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`AgentMessages` 消息渲染（逐块分发）。出向：`MessageResponse`（Markdown）、`@profer/shared`（SDK 消息类型）、`react-markdown`/remark-gfm、`lucide-react`。

## 5. 数据 I/O、读写与副作用

无 I/O（展示）；剪贴板写（右键复制命令）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 未知块类型 | `:763` 族 | null |
| toolUseId 无结果 | `:57-91` | null（流式中常见） |
| thinking 超 4 行 | `:678` | 折叠 |
| 复制失败 | `:344` | failed 态 1500ms |

## 7. 权限与权威状态

诚实边界：Pi/GPT 思考概览不冒充 thinking（上层过滤口径，`:7`）；语义短语=可读转述、展开才是结构化原始结果。

## 8. 修改影响面

改块渲染 → 影响消息流全部展示；`SDKMessage`/工具短语映射联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三类块分发+thinking 过滤口径 | 已证实 | 文件头、`:763` 族 |
| 结果回填三 hook/解析 | 已证实 | `:48-155` |
| 折叠阈值/复制反馈 | 已证实 | `:678/:341` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| hooks/解析族 | 3.1 | `:48-155` | covered |
| `ToolUseBlock` | 3.2 | `:360-668` | covered |
| `ThinkingBlock`/主组件/memo | 3.3 | `:669-831` | covered |
