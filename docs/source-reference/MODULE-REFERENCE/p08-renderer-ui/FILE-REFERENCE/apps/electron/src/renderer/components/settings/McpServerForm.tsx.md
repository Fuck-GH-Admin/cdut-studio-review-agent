---
path: apps/electron/src/renderer/components/settings/McpServerForm.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6dcbe51b0c3a4aac62a1f378de69e2fa2cbd47b1
sha256: ec68ac027baaa5b9534d5a5440cdd09292102e186008d0a3132d08fafa540eed
lines: 609
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/McpServerForm.tsx

## 1. 结论与边界

**MCP 服务器创建/编辑表单**（`:1-6`）：stdio/http/sse 三传输；卡片化布局。**启用硬门槛：只有测试成功才能启用**（`:599-603`，开关 `disabled={!testResult?.success}`）——防未验证配置拖垮整个 Agent 运行。

## 2. 导出与关键符号

1 导出：`McpServerForm`（`:123`）。内部：`EditingServer`（`:23`）、`TRANSPORT_OPTIONS` 3 项（`:39-43`）、`parseKeyValueText`（`:52`，`=`/`:` 双分隔）、`serializeKeyValueText`（`:69`）、`McpFormValues`（`:76`）、`buildEntryFromValues`（`:90`）。

## 3. 内部逻辑与关键流程

- `buildEntryFromValues`（`:90-121`）：**enabled = 开关 AND 测试通过**（`:93`）；stdio→command/args（逗号分隔 `:105-109`）/env/timeout；http/sse→url/headers；`lastTestResult` 可选带 timestamp。
- 表单流程：编辑回填（含序列化 env/headers 文本）→"测试连接"（主进程 MCP 测试 API）→成功后解锁启用开关→保存（`onSaved`）/取消（`onCancel`）。
- 未测试提示条（`:584-590`）："请先点击测试连接按钮验证配置"。
- `onChanged?` 可选变更回调（`:34`）。

## 4. 调用者与调用链

- 入向：`components/agent-skills/McpDetailSheet.tsx`（全树 grep `McpServerForm`（检索范围：`apps/electron/src` 全 `*.tsx`，排除本文件）**唯一命中**；agent-skills 目录、非 settings 同目录）。
- 出向：settings primitives、`window.electronAPI`（MCP 测试/保存）、`@profer/shared`（McpServerEntry/McpTransportType）。

## 5. 数据 I/O、读写与副作用

保存写工作区 MCP 配置（workspaceSlug 定位，`:31`）；测试调主进程 MCP 探测（可能起子进程 stdio server——域外）。

## 6. 分支、失败、取消与恢复

未测试→保存出的 entry enabled=false（`:93`）；测试失败显示错误；取消丢弃。

## 7. 权限与权威状态

启用权威=测试成功（`:593-603` 硬门槛）；isBuiltin 标记透传（`:94`）。

## 8. 修改影响面

工作区 MCP 接入；Agent 会话加载面（文案 `:598`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 测试门槛/entry 构建/双分隔解析 | 已证实 | `:1-609` 全文 |
| MCP 测试实现 | 边界 | 主进程域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+4 内部+表单 | §2/§3 | 23-607 | covered |
