---
path: apps/electron/src/renderer/components/settings/BotDefaultSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be25c57d10927f6ddc4a140f4922ff10ba863995
sha256: e6b295fb3225dd2a470a0aedc6acd2a81d28b76530430bf3769613876ad404ef
lines: 115
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/BotDefaultSettings.tsx

## 1. 结论与边界

机器人**默认配置 + 命令说明**（跨平台共享，`:1-5`）：默认工作区选择（`agentWorkspaceId`）与 8 条命令速查表。写路径=`updateSettings`。

## 2. 导出与关键符号

1 导出：`BotDefaultSettings`（`:17`）。状态：`defaultWorkspaceId`/`loading`（`:21-22`）；工作区列表经 `getVisibleAgentWorkspaces` 过滤（`:19`）。

## 3. 内部逻辑与关键流程

- 加载（`:25-31`）：`getSettings`→保存值仅在可见工作区内保留，否则回空串（`:28`）。
- 保存（`:38-47`）：`updateSettings({agentWorkspaceId: defaultWorkspaceId || undefined})`，成功/失败 toast。
- 渲染（`:51-113`）：工作区下拉（空列表→引导文案 `:67-71`）+保存按钮；分隔线后命令表 `/help /new /list /stop /switch /workspace /model /now`（含简写，`:89-106`）。

## 4. 调用者与调用链

- 入向：`BotHubSettings.tsx:18`（"用法" 面板，本批）。
- 出向：jotai `agentWorkspacesAtom`、`product-feature-flags`、settings primitives、`window.electronAPI`。

## 5. 数据 I/O、读写与副作用

读 `getSettings`；写 `updateSettings.agentWorkspaceId`（内存 atom 先行无——直接 API）。

## 6. 分支、失败、取消与恢复

加载失败→loading 复位（`:30`）；保存失败→toast；无取消。

## 7. 权限与权威状态

无权限分支，依据：设置读写经主进程 API。

## 8. 修改影响面

机器人默认工作区语义（跨飞书/钉钉/微信）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 加载校正/保存/命令表 | 已证实 | `:1-115` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 17-113 | covered |
