---
path: apps/electron/src/main/lib/workspace-mcp-config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8150e33b2b593017a3166d219063bb8934345c30
sha256: 67027f22399065c13bab93ffd6ed91dda15931fdf7a1f4e8ac6e8ae48d9fbe3b
lines: 7
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/workspace-mcp-config.ts

## 1. 结论与边界

Workspace MCP 配置的窄依赖入口（头注释 :1-6）：让 Prompt 构建器只读 MCP 配置而不把整个 workspace-manager 当 mock 边界；避免 Bun 同批测试 mock 污染。**本文件不适用**（无逻辑分支）——仅一行再导出（:7），依据：全文 7 行。

## 2. 导出与关键符号

导出 1 条（:7）：`export { getWorkspaceMcpConfig } from './agent-workspace-manager'`（真实现在 workspace-manager:417）。

## 3-7. 不适用

不适用（纯再导出）：无内部逻辑/无 I/O/无分支/无权限状态。依据：7 行全文核对。

## 4. 调用者与调用链

入向（已知交叉核）：`agent-prompt-builder.ts:20`（经本窄入口间接消费）。出向：`./agent-workspace-manager`。

## 8. 修改影响面

- 消费面：prompt-builder 动态上下文 MCP 摘要（buildDynamicContext）。
- 依赖面：agent-workspace-manager.getWorkspaceMcpConfig（:417）。
- 需同步测试：无专属（mock 边界语义由消费方测试覆盖）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单行再导出+窄边界动机 | 已证实 | :1-7 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 再导出 | §2 | :7 | covered |
