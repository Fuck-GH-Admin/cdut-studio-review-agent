---
path: apps/electron/src/main/lib/lark-mcp-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10e4d95a74bae744b247eeeca7277341bb3a7e97
sha256: 9661776ce0fd6f37e772fc837960874d2f248cc848ec357694d47f11e528dd4a
lines: 343
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/lark-mcp-service.ts

## 1. 结论与边界

官方 lark-mcp 管理服务：加密存 App 凭据（`lark-mcp.enc.json`）、按工作区启用/禁用受管 MCP 条目（写 workspace mcp.json，**改前备份+失败回滚**）、OAuth 登录流、连接握手测试、运行时 env 注入。安全红线：**凭证走子进程 env 不走命令行参数**（防进程列表/历史/诊断泄漏，`:257-258` 注释）；新凭据禁止 token-crypto 明文回退（`:106-110`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个常量 + 12 个函数 = 14 个导出（类/接口导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `LARK_MCP_SERVER_NAME`/`LARK_MCP_TOOL_PRESETS` | 常量（导出） | 10,16 | `'lark-mcp'`；预设显式含 calendar（注释：日程读写需要且走用户 OAuth 身份，`:14-15`） |
| `getLarkMcpStatus` | 函数（导出） | 92-97 | 状态（enabledWorkspaces 过滤已知工作区） |
| `saveLarkMcpCredentials` | 函数（导出） | 99-124 | App ID 正则 `^cli_…` 校验；**密文==明文即拒存**（加密不可用，`:108-110`）；换凭据保留既有工作区绑定（`:117-119`） |
| `__setLarkMcpLoginEventHandler` | 函数（导出） | 126 | 测试注入 |
| `getLarkMcpRuntimeEnv` | 函数（导出） | 128-136 | 解密→`{APP_ID,APP_SECRET}`（失败 null） |
| `isLarkMcpEntry` | 函数（导出） | 159-164 | 受管条目识别（现行+legacy 预设两形态） |
| `getLarkMcpEntryWithRuntimeEnv` | 函数（导出） | 166-175 | 条目规范化+env 注入（**非本工作区启用→null**；canonical 参数防旧 split 配置，`:172-174`） |
| `enableLarkMcpForWorkspace` | 函数（导出） | 177-202 | 备份→写受管条目（**无关同名条目抛** `An unrelated lark-mcp entry already exists`）→绑定→删备份；失败回滚（`:196-199`） |
| `testLarkMcpConnection` | 函数（导出） | 204-249 | spawn MCP 进程发 JSON-RPC `initialize`，20s 超时；`serverInfo.name` 即握手成功；消息脱敏截 300 |
| `startLarkMcpLogin` | 函数（导出） | 251-302 | 单例+**generation 令牌**（`:275,285,291,297` 防取消后旧回调误报）；`authorization url` 行出现后取最后 URL（CLI 先印回调/控制台 URL，`:271-273`）；90s 超时 |
| `cancelLarkMcpLogin`/`disposeLarkMcpService` | 函数（导出） | 304-313 | 取消先失效 generation 再 kill（Windows close 事件防误报，`:306-307`） |
| `disableLarkMcpForWorkspace` | 函数（导出） | 318-343 | 非受管条目拒删；删条目后绑定写失败→**回滚文件**（防文件/私有状态不一致，`:336-340`） |
| `StoredLarkMcpCredentials`/`readStoredCredentials`/`persistWorkspaceBinding`/`managedEntry`/`managedArgs`/`isManagedLarkMcpEntry`/`backupPath`/`redact` | 内部 | 28-90,138-157 | v1/v2 形状严格校验（`:52-53`）；绑定集管理；受管条目定义（npx/@larksuiteoapi/lark-mcp、`--oauth --token-mode user_access_token`、timeout 45） |

## 3. 内部逻辑与关键流程

- 凭据（`:99-124`）：校验→`encryptToken`（明文回退即拒）→v2 存储（保绑定）。
- 启用（`:177-202`）：workspace 存在+env 可用→`backupPath` 时间戳备份→同名非受管条目抛→写入→`persistWorkspaceBinding`→删备份；catch 回滚（删新/恢复备份）。
- 握手测试（`:204-249`）：spawn npx（win32 `npx.cmd` basename+shell）、合并 env、stdin 写 initialize、stdout 累积找 `"id":1` 行解析 `serverInfo`；close 0 无响应→`stopped before responding`。
- 登录（`:251-302`）：env 传凭据；URL 提取条件 `/authorization url/i`；error/close/timeout 三路事件均校验 generation。
- 禁用（`:318-343`）：非受管拒；删条目+绑定双写，绑定失败回滚文件。

## 4. 调用者与调用链

入向：Lark MCP IPC + workspace MCP 装配（`getLarkMcpEntryWithRuntimeEnv` 注入）；测试：`lark-mcp-service.test.ts`（133 行，本批）。出向：`node:fs/child_process/path`、`./config-paths.ts:4`、`./token-crypto.ts:5`、`./agent-workspace-manager.ts:6`、`@profer/shared`（类型）。

## 5. 数据 I/O、读写与副作用

读写：`lark-mcp.enc.json` + workspace `mcp.json`（备份/回滚）；子进程：npx lark-mcp（登录/测试）；副作用：登录状态单例+generation、事件回调。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| App ID 非法/Secret 空 | 拒存 | 102-103 |
| 加密不可用（明文回退） | 拒存 | 108-110 |
| 同名非受管条目 | 抛（启用拒） | 187-188 |
| 启用失败 | 回滚备份 | 196-199 |
| 握手超时/失败 | 脱敏消息 | 227-233 |
| 登录重入/超时/取消 | 单例拒/事件/generation 失效 | 252,296-301,304-311 |
| 禁用非受管 | 拒 | 328 |
| 绑定写失败 | 回滚文件 | 336-340 |

## 7. 权限与权威状态

- 凭据权威=加密存储+env 注入（不进命令行，`:257-258`）。
- 工作区绑定权威=`enabledWorkspaceSlugs`（**私有不持久到 workspace mcp.json**，`:33`）。
- 预设显式含 calendar 保用户 OAuth 日程能力（`:14-15`）。

## 8. 修改影响面

改条目规范化影响 MCP 启动；改凭据流影响安全；影响 `lark-mcp-service.test.ts`。

## 9. 测试证据

直接测试：`lark-mcp-service.test.ts`（133 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 凭据 env 注入不进命令行 | 已证实 | `:257-258` |
| 明文回退拒存 | 已证实 | `:106-110` |
| 备份/回滚/绑定一致性 | 已证实 | `:181-202,336-340` |
| generation 防误报 | 已证实 | `:275-311` |
| 真实 lark-mcp CLI | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 凭据族 | §3 | 28-136 | covered |
| 条目/工作区族 | §3 | 138-202,318-343 | covered |
| 测试/登录流 | §3 | 204-313 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
