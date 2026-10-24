---
path: apps/electron/src/main/lib/mcp-validator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f31907b00e960fa9387b63806110adcd1b76fe94
sha256: f7aec4b797bb0d5b1aa49f55662fe8b25b45d68c5367534b45ee8746b90c5527
lines: 140
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/mcp-validator.ts

## 1. 结论与边界

MCP 服务器配置可用性验证器（140 行，头注释 `:1-9`）：在配置交给 Agent SDK 前，stdio 型查命令是否存在、http/sse 型查 URL 格式，避免坏配置拖垮整个 SDK 启动。

**边界**：http/sse **不发网络请求**（注释 `:82-84` 明示"暂时跳过网络验证"）；不做 MCP 协议握手/连通性验证；不改配置；stdio 只查命令存在性，不查启动兼容性。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `McpValidationResult` | 接口（导出） | 18-25 | `{name: string; valid: boolean; reason?: string}` | 结果形状 |
| `validateMcpServer` | 函数（导出） | 34-94 | `(name: string, entry: McpServerEntry) => Promise<McpValidationResult>` | 单个验证 |
| `validateMcpServers` | 函数（导出） | 126-140 | `(servers: Record<string, McpServerEntry>) => Promise<McpValidationResult[]>` | 批量验证 |
| `isCommandAvailable` | 函数（内部） | 103-118 | `(command: string) => Promise<boolean>` | which/where 或 existsSync |

导出合计 3；内部 1。

## 3. 内部逻辑与关键流程

1. **stdio 分支**（`:39-59`）：`!entry.command` → `{valid:false, reason:'缺少 command 字段'}`（`:40-46`）；`isCommandAvailable` 为假 → `reason` 带命令原文（`:50-56`）；通过 → `{name, valid:true}`（`:58`）。
2. **http/sse 分支**（`:62-87`）：`!entry.url` → `reason:'缺少 url 字段'`（`:63-69`）；`new URL(entry.url)` 仅格式校验，catch → `reason:'无效的 URL 格式: …'`（`:72-80`）；然后直接返回 `{valid:true}`（`:86`）——**不 ping、不发请求**（`:82-84` 注释：避免启动延迟）。
3. **未知类型**（`:89-93`）：`reason: '未知的传输类型: …'`。
4. **isCommandAvailable**（`:103-118`）：绝对路径判定（`/`、`\` 或 `/^[A-Z]:/i` 盘符，`:105`）→ `existsSync(command)`（`:106`）；否则 shell 查找：`whichCommand = win32 ? 'where' : 'which'`（`:112`），`execSync(\`${whichCommand} ${command}\`, {stdio:'ignore'})`（`:113`，命令名**未转义直接拼接**），异常 catch → `false`（`:115-116`）。
5. **validateMcpServers**（`:126-140`）：`Object.entries` 串行 `await validateMcpServer`（`:131-136`）；`!entry.enabled` 跳过不入结果（`:133`）。

## 4. 调用者与调用链

- 入向（全冻结树检索 `mcp-validator`/`validateMcpServer`）：
  - `apps/electron/src/main/ipc.ts:3611`（`TEST_MCP_SERVER` handler 内动态 `await import('./lib/mcp-validator')`）→ `ipc.ts:3612` `validateMcpServer(name, entry)`，结果映射 `{success: result.valid, message: result.valid ? '连接成功' : (result.reason || '连接失败')}`（handler 范围 `ipc.ts:3606-3617`）。
  - `validateMcpServers`（批量）**冻结树内零外部调用者**：全树检索 `validateMcpServers` 命中仅 `:126` 定义与 `:135` 循环内自调用；无 IPC/测试引用（检索范围=baseline/source 全树）。
- 出向：`node:fs` `existsSync`（`:11`）、`node:child_process` `execSync`（`:12`）、类型 `McpServerEntry`（`@profer/shared` `:13`）。

## 5. 数据 I/O、读写与副作用

- 只读文件系统探测：`existsSync`（`:106`）。
- 外部进程执行：`execSync` 同步跑 `which`/`where`（`:113`）；stdio:'ignore' 吞掉输出；失败抛错被 catch。**安全面事实**：`command` 未转义拼接进 shell 字符串（`:113`），恶意 command 名可注入——照实记录（本批仅记录，修复不在文档范围）。
- 无网络（`http/sse` 分支不发请求，`:82-84`）；无写盘；无全局状态。
- 同步阻塞：`execSync` 阻塞主进程事件循环（验证路径在 IPC handler 中被 await）。

## 6. 分支、失败、取消与恢复

- 分支：stdio/http/sse/未知三类（`:39`/`:62`/`:89`）；缺字段两个 early-return；URL try/catch（`:72-80`）。
- `isCommandAvailable`：绝对路径短路（`:105-107`）；execSync 异常 → `false`（`:115-116`）。
- 无取消机制（同步短任务）；无重试；失败即返回 `valid:false` + reason，不抛异常（全文件无 throw，〔证实〕）。
- 用户可见文案：reason 中文（`:44`/`:54`/`:67`/`:78`/`:92`），经 `ipc.ts:3614` 映射为 message。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。IPC 入口守卫在调用方（`ipc.ts` 的 TEST_MCP_SERVER handler）——按 FACT-CHECKING-NOTES 口径，不得借 handler 的守卫暗示本文件验证权限。验证权威=本机命令存在性/URL 语法，非服务端权威。

## 8. 修改影响面

- 影响 `ipc.ts` TEST_MCP_SERVER 的 UI 反馈（"连接成功/连接失败"文案，`ipc.ts:3614`）与设置页 MCP 测试交互。
- `McpValidationResult.reason` 是用户可见文案；改动影响 renderer 显示与测试期望。
- `isCommandAvailable` 的 shell 拼接（`:113`）如加转义需同步评估 `where/which` 行为差异（win32 vs 其他）。
- `validateMcpServers` 无调用者，签名改动无现存运行影响，但它是批量入口预留（删除前需确认产品意图，未知）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `mcp-validator`/`validateMcpServer`/`validateMcpServers` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：无。

`NOT_RUN`：本轮未运行 bun test；未真实执行 which/where 路径。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三类分支/缺字段/URL 校验/跳过网络验证 | 已证实 | `:1-140` 全文逐行 |
| isCommandAvailable 绝对路径/which 分支、异常→false | 已证实 | `:103-118` |
| command 未转义拼接的安全面 | 已证实 | `:113` |
| 入向=ipc.ts:3611-3612（TEST_MCP_SERVER）；validateMcpServers 零外部调用 | 已证实 | 全树检索（§4） |
| "避免 SDK 无法启动"的实际效果 | 推断 | 头注释 `:8` 声明，未核 SDK 启动路径 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `McpValidationResult` | §2 | 18-25 | covered |
| `validateMcpServer`（stdio/http/sse/未知） | §3.1-3.3 | 34-94 | covered |
| `isCommandAvailable` | §3.4/§5 | 103-118 | covered |
| `validateMcpServers` | §3.5/§4 | 126-140 | covered |
| 调用者与零调用否定 | §4/§9 | - | covered |
