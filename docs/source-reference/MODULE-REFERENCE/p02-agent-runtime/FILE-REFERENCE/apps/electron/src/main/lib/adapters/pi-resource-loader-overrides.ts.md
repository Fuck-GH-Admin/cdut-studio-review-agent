---
path: apps/electron/src/main/lib/adapters/pi-resource-loader-overrides.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43c45639f84f17f9996f1e124aedd3a3a52d059b
sha256: 446143f838416725e47c066a968e9c96bdb14e968d53add9b67730fa5bb68717
lines: 47
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-resource-loader-overrides.ts

## 1. 结论与边界

Profer-managed Pi 模式的**资源加载覆盖**（运行时纯函数工厂）：显式关闭 Pi 的 ambient 本地资源加载，仅在验证显式工作区/项目路径后提供 override（`apps/electron/src/main/lib/adapters/pi-resource-loader-overrides.ts:15/:26-29`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `ProferProjectInstructionFile` | 导出接口 | 10-13 | `{path, content}` | 已验证指令文件 |
| `createProferManagedResourceLoaderOptions` | 导出函数 | 16-24 | `(): {noContextFiles, noExtensions, noSkills, appendSystemPrompt: []}` | 关闭 ambient 加载 |
| `createProferProjectInstructionFilesOverride` | 导出函数 | 30-33 | `(files) => () => ({agentsFiles})` | 显式 agentsFiles override |
| `combineProferInstructionFiles` | 导出函数 | 36-41 | `(workspaceFile?, projectFiles) => ProferProjectInstructionFile[]` | 工作区规则排前 |
| `createProferAgentsFilesOverride` | 导出函数 | 43-47 | `(base) => ({agentsFiles})` | 过滤遗留 CLAUDE.md |

内部：`LEGACY_AGENT_CONTEXT_FILE_NAMES`（`:7`，`CLAUDE.md`/`CLAUDE.MD`）、`AgentsFilesResult`（`:3-5`）。

## 3. 内部逻辑与关键流程

- `createProferManagedResourceLoaderOptions`（`:16-24`）：`noContextFiles/noExtensions/noSkills: true` + `appendSystemPrompt: []`（`:21-22` 注释：显式空源防止 Pi 发现 APPEND_SYSTEM.md）。
- `createProferProjectInstructionFilesOverride`（`:30-33`）：把 `{path,content}` 列表包成返回 `{agentsFiles}` 的函数；Pi 仍负责最终 `<project_context>` 格式化（`:27-28`）。
- `combineProferInstructionFiles`（`:36-41`）：workspaceFile 存在则置首（受管工作区规则优先于用户项目规则，`:35`）。
- `createProferAgentsFilesOverride`（`:43-47`）：按 basename 过滤 `CLAUDE.md`/`CLAUDE.MD`（防止 Pi 自动读取遗留上下文文件）。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`、`apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.ts`（import 检索）。出向：`node:path`（basename）。

## 5. 数据 I/O 与副作用

无（纯函数；无磁盘/网络）。

## 6. 分支、失败与恢复

无 throw；`workspaceFile` 可空分支（`:40`）。

## 7. 权限与权威状态

指令文件权威=Profer 显式验证的路径（`:9` 注释「禁止 Pi 磁盘自动发现」）；本文件只做组合/过滤，验证在调用方（pi-agent-adapter/项目指令解析层）。

## 8. 修改影响面

改 override 影响 Pi 会话的 `<project_context>` 组成与遗留 CLAUDE.md 读取行为；被 pi-agent-adapter 与 review 的 session factory 消费。

## 9. 测试证据

无专属测试（冻结树 glob `**/pi-resource-loader-overrides*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+过滤/排序语义 | 已证实 | `:7-47` |
| 消费者 2 文件 | 已证实 | import 检索（§4） |
| Pi 端 override 机制行为 | 未知 | SDK 未读、NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 5 导出 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
