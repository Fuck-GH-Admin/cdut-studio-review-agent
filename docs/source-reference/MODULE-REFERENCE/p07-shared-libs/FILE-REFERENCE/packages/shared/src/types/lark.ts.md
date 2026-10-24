---
path: packages/shared/src/types/lark.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f88d0213007510c65642c65923b64a8079d06ecc
sha256: ccebda3cf25da31aff3bd4de8e945bccb9e18b1f0101c59f38c9b303c480942c
lines: 84
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/lark.ts

## 1. 结论与边界

Lark/飞书用户云端能力（CLI + MCP）的共享状态契约（`:1`："仅包含可安全展示的状态，不包含 token/secret"）。8 个类型 + 1 个 IPC 通道常量（14 键）。

不做的事：不持有凭证（`appSecret` 只在 `LarkMcpCredentialsInput` 输入侧出现，`:49` 注释："The app secret never leaves the main process"）；不做 CLI 安装/登录流程。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `LarkAuthState` | type | `:3` | `'unknown'\|'logged_out'\|'logged_in'\|'reauthorization_required'` |
| `LarkCliStatus` | interface | `:5-18` | node/npm/npx/cli 各 `{available; version; path}` + `auth{state; userLabel; scopeCount; checkedAt}` + `checkedAt` + `error` |
| `LarkLoginStartResult` | interface | `:20-24` | `{started; authorizationUrl; message}` |
| `LarkCliOperationResult` | interface | `:26-29` | `{success; message}` |
| `LarkDiagnostics` | interface | `:31-42` | 扁平化诊断快照（版本/路径/auth/时间/错误） |
| `LarkMcpCredentialsInput` | interface | `:44-47` | `{appId; appSecret}`（输入侧明文） |
| `LarkMcpStatus` | interface | `:50-55` | `{configured; appId; configuredAt; enabledWorkspaces[]}`（`:49` 注释：safe summary，secret 不出主进程） |
| `LarkMcpSetupResult` | interface | `:57-61` | `{success; message; workspaceSlug?}` |
| `LarkLoginEvent` | interface | `:80-84` | `{type:'url'\|'completed'\|'failed'; authorizationUrl?; message}` |
| `LARK_IPC_CHANNELS` | const `as const` | `:63-78` | 14 键 `lark:*`（键值全符 `<kebab>` 规则，无例外） |

## 3. 内部逻辑与关键流程

纯声明。登录流事件语义（`LarkLoginEvent :80-84`）：`url` 发授权链接 → `completed`/`failed` 收尾；MCP 状态安全投影（`LarkMcpStatus`）刻意不含 secret。

## 4. 调用者与调用链

preload Lark 段（`preload/index.ts:3531-3552`：getLarkCliStatus/refreshLarkCliStatus/installLarkCli/startLarkLogin/cancelLarkLogin/onLarkLoginEvent/getLarkMcpStatus/saveLarkMcpCredentials/enableLarkMcpForWorkspace/disableLarkMcpForWorkspace/startLarkMcpLogin/cancelLarkMcpLogin/testLarkMcpConnection/onLarkMcpLoginEvent）；主进程 `lark-cli-service`/`lark-mcp-service`（`main/index.ts:205-206` dispose 链）；设置页 Lark 面板。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。

## 6. 分支、失败、取消与恢复

不适用（无控制流）。失败/取消语义由事件与结果承载：`LarkLoginEvent.type:'failed'`、`CANCEL_LOGIN`/`CANCEL_MCP_LOGIN` 通道、`LarkCliOperationResult.success`。

## 7. 权限与权威状态

**凭证安全边界**：`LarkMcpCredentialsInput.appSecret` 是唯一明文入口（`:44-47`），`LarkMcpStatus`（`:49-55`）刻意不含 secret；`LarkCliStatus.auth` 只有 `userLabel`/`scopeCount` 可展示状态（`:1`）。凭证权威在主进程（safeStorage）。

## 8. 修改影响面

增删状态值影响 Lark 面板分支；把 token/secret 加进状态接口会破坏 `:1` 红线；通道改名需同步 preload `:3531-3552` 与 main 注册（`lark:<kebab>` 无例外）。

## 9. 测试证据

无直接测试（检索 `LarkCliStatus`/`LARK_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出、14 通道键值无例外 | 已证实 | 文件全读 |
| secret 不出主进程的投影边界 | 已证实 | `:1`、`:49` 注释 + `LarkMcpStatus` 字段 |
| 登录事件三态流 | 已证实 | `:80-84` |
| 主进程实际凭证存储加密 | 未知 | 服务实现不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 10 导出全量 | §2 | covered |
| 事件流/失败语义 | §3/§6 | covered |
| 凭证边界 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |
