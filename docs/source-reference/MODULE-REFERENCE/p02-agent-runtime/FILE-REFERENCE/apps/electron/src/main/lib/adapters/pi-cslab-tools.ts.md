---
path: apps/electron/src/main/lib/adapters/pi-cslab-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d1e8cbdce80383a4b0bec34b340236c54522537
sha256: 6bcfd2210cccbdbc47103df29abb2adf29c88ad5bd85252955629e8efa9885b8
lines: 221
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-cslab-tools.ts

## 1. 结论与边界

Pi Agent × CSLab 自定义科研工具桥接。隔离红线（文件头 `apps/electron/src/main/lib/adapters/pi-cslab-tools.ts:1-8`）：①绝不使用进程级 activeLabId；②只读当前会话 `AgentSessionMeta.cslabLabId`，未绑定返回空工具集；③工具清单来自实验室 `runtime/tools/.cslab-tools.json`，由用户在工具面板显式绑定。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 1 个函数 = 3 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiCsLabToolsContext` | 接口（导出） | 31-35 | `{sessionId,getPermissionMode?}` | 权限模式仅审计记账（`:33`） |
| `CsLabToolBridgeDeps` | 接口（导出） | 37-42 | `getSessionMeta?/readManifest?/runTool?/scanTools?` | 可注入依赖 |
| `buildPiCsLabTools` | 函数（导出） | 103-221 | `(sdk,ctx,deps?)=>ToolDefinition[]` | 工具集构建 |
| `textToolResult`/`jsonTypeToSchema`/`buildParameters`/`toolNameFor`/`formatSignature` | 内部 | 44-97 | 结果包装；JSON 类型→TypeBox；参数 schema（参数名非 `[A-Za-z_]\w*` 跳过）；命名去重（≤60/64 字符）；签名格式化 | |

## 3. 内部逻辑与关键流程

`buildPiCsLabTools`（`:103-221`）：

1. 依赖缺省注入真实实现（`getAgentSessionMeta`/`readLabToolManifestSync`/`runLabTool`/`scanLabTools`，`:108-111`）；`auditContext()` = `{source:'agent',sessionId,permissionMode}`（`:113-117`）。
2. `getSessionMeta(ctx.sessionId).cslabLabId` 无 → 返回 `[]`（红线②，`:119-121`）；`assertLabId` 失败 → `[]`（`:123-128`）。
3. 预留内置名 `cslab_list_lab_tools`/`cslab_run_lab_tool` 防同名重复注册（`:132-133`）。
4. 逐 manifest 工具（跳过 `unsupportedReason`，`:136`）：`toolNameFor` 命名（`cslab_<name 规范化>` + 计数去重）；`defineTool` 注册（label/description 含 Python 签名、`promptSnippet`、`buildParameters` TypeBox schema `additionalProperties:false`、`execute`→`runLabTool` 并返回 JSON 或 `执行失败：…`，`:138-157`）。
5. 内置两工具（`:160-218`）：`cslab_list_lab_tools`（`scanLabTools` 重扫+列出签名）；`cslab_run_lab_tool`（`name` 必填、`argsJson` 可选 JSON 对象字符串——非法 JSON 抛 `argsJson 不是合法 JSON`、数组/非对象抛 `argsJson 必须是 JSON 对象`，`:194-216`）。

## 4. 调用者与调用链

入向：Pi Agent 会话工具装配（`pi-agent-adapter.ts` 按会话绑定实验室）；测试：本批 `pi-agent-adapter.test.ts`/`pi-builtin-tools.test.ts` 间接（scope 无专属 `.test.ts`）。出向：`typebox`、`@earendil-works/pi-coding-agent`/`pi-agent-core`（类型）、`@profer/shared`（类型）、`../agent-session-manager.ts:21`、`../cslab/cslab-paths.ts:22`（`assertLabId`）、`../cslab/cslab-tool-registry.ts:23-27`（三函数）。

## 5. 数据 I/O、读写与副作用

- 读：会话 meta、实验室工具 manifest（`runtime/tools/.cslab-tools.json`）。
- 执行：经 `runLabTool` 运行实验室 Python 工具（真实副作用在该注册表/子进程层）。
- 审计：每次执行带 `{source:'agent',sessionId,permissionMode}`（`:113-117`）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 未绑定 labId / `assertLabId` 失败 | 空工具集（不影响通用 Pi 工具） | 121,126-128 |
| `unsupportedReason` | 跳过该工具 | 136 |
| 工具执行失败 | 文本 `执行失败：<error>`，不抛 | 151-154,212-214 |
| `name` 空 | 抛 `name 必填` | 197 |
| `argsJson` 非法/非对象 | 抛 `argsJson 不是合法 JSON`/`必须是 JSON 对象` | 204,207 |
| 参数名非法 | 该参数不进 schema | 73 |

无取消/恢复概念（执行层由 `runLabTool` 语义决定）。

## 7. 权限与权威状态

- 实验室绑定权威=会话 meta（红线①②）；工具清单权威=用户显式绑定的 manifest（红线③）。
- 权限模式只进审计上下文，不参与授权判定（`:33`）。

## 8. 修改影响面

- 改工具命名/参数 schema 影响 Pi 工具调用与实验室函数匹配。
- 改依赖注入面影响测试与 `cslab-tool-registry` 契约。

## 9. 测试证据

本批**无专属测试**（scope 未含）；间接：`pi-agent-adapter.test.ts`/`pi-builtin-tools.test.ts`（各自手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（静态判断）：`jsonTypeToSchema` 各类型、命名去重、`argsJson` 分支无专属断言证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无进程级 labId、未绑定空集 | 已证实 | `:119-128` |
| 预留名防重复 | 已证实 | `:132-133` |
| 执行失败转文本不抛 | 已证实 | `:151-154` |
| `argsJson` 校验三分支 | 已证实 | `:199-210` |
| 审计上下文含 permissionMode | 已证实 | `:113-117` |
| 生产接线/测试 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildPiCsLabTools` 主链 | §3 | 103-221 | covered |
| 内部构造族 | §2 | 44-97 | covered |
| 失败分支 | §6 | 121-210 | covered |
| 接线/断言 | §9,§10 | — | unknown |
