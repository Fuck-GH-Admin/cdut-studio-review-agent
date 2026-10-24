---
path: packages/shared/src/types/chat-tool.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c1a0aedd3218bf7e40ddfb00fda0ff4b50ad2e5
sha256: e58fa9e48104c5b0da42932277c5f6951033d7b1bf8b91210031152382699c7a
lines: 110
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/chat-tool.ts

## 1. 结论与边界

聊天工具（MCP 风格工具调用）**类型模块**（`packages/shared/src/types/chat-tool.ts:1-7`）：入参/出参契约 + 主进程 IPC 通道。注释约定（`:5-6`）：各工具 schema 用**业务语义扁平键**、不用通用 `parameters` JSON Schema 包装，以便 UI 直接渲染。

## 2. 导出与关键符号

`export` 共 **7 个**（`:12`-`:110`）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ChatToolParam` | interface | `:12-25` | 工具参数 |
| `ChatToolHttpConfig` | interface | `:26-39` | HTTP 配置 |
| `ChatToolMeta` | interface | `:40-63` | 工具元数据 |
| `ChatToolState` | interface | `:64-69` | 工具状态 |
| `ChatToolsFileConfig` | interface | `:70-81` | 文件配置 |
| `ChatToolInfo` | interface | `:82-92` | 工具信息 |
| `CHAT_TOOL_IPC_CHANNELS` | const | `:93-110` | **8 键**：GET_ALL_TOOLS/GET_TOOL_CREDENTIALS/UPDATE_TOOL_STATE/UPDATE_TOOL_CREDENTIALS/TEST_TOOL/CREATE_CUSTOM_TOOL/DELETE_CUSTOM_TOOL/CUSTOM_TOOL_CHANGED |

## 3. 内部逻辑与关键流程

无逻辑（纯类型）。参数约定：`ChatToolParam` 扁平键（`:12-25`），`enum` 类型用 `enumValues` 表达。

## 4. 调用者与调用链

- 消费方：聊天工具服务（主进程）、渲染层工具面板、MCP 层；`CHAT_TOOL_IPC_CHANNELS` 是跨进程契约。
- 出向：无。

## 5. 数据 I/O、读写与副作用

无运行时行为。

## 6. 分支、失败、取消与恢复

不适用（纯类型）。执行方状态语义不在本冻结树（相关执行方符号全树检索 0 命中，如实不列）。

## 7. 权限与权威状态

权限判定在执行方（执行上下文/权限等级符号全树检索 0 命中，不在本冻结树，如实不列）。

## 8. 修改影响面

- 8 个 IPC 通道名是契约（`CHAT_TOOL_IPC_CHANNELS :93-110`）；参数扁平约定改动影响 UI 渲染。

## 9. 测试证据

- 纯类型无专属测试（全树检索命中 0）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个导出 | 已证实 | 全文 |
| 扁平参数约定 | 已证实 | `:5-6`、`:12-25` |
| 执行/权限行为 | 未知 | 不在本批 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 个导出 | 2 | — | covered |
| IPC 8 通道 | 2 | `:93-110` | covered |
| 测试证据 | 9 | — | covered |
