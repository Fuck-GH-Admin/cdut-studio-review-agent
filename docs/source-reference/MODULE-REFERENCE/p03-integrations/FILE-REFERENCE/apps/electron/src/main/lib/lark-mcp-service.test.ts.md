---
path: apps/electron/src/main/lib/lark-mcp-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 41529a77cb5648d84c30c68f108d0b86904938d2
sha256: d91e2a3e409102a3f59310901b9725314251227c663e7342adb7b7e072dfffa0
lines: 133
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/lark-mcp-service.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

lark-mcp 服务：App Secret **不持久到 workspace mcp.json**（仅私有绑定时运行时注入）；split 预设归一化；旧文档条目升级含 calendar；lookalike/禁用后不注入凭证。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/lark-mcp-service.test.ts:40,62,85,106`，describe `:29`）。夹具：mock 三模块（`config-paths`/`token-crypto`（fake 加密注释：生产仍走 token-crypto，`:10-12`）/`agent-workspace-manager` 双工作区，`:13-25`）；beforeEach 临时 configDir（`:30-33`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | Secret 不落 mcp.json（`:40`） | 私有文件 `not.toContain(appSecret)`；mcp.json 条目 stringify `not.toContain(appSecret)` 且 `entry.env` `toBeUndefined()`；args 精确 `toEqual`（含 `preset.calendar.default`）；runtimeEntry `env` `toMatchObject({APP_ID:'cli_demo123',APP_SECRET:appSecret})`；**workspace-b 得 `null`**；status `enabledWorkspaces:['workspace-a']` |
| 2 | split 预设归一化（`:62`） | `isLarkMcpEntry` true；runtimeEntry.args 归一为**逗号单参数**；env 注入 |
| 3 | 旧条目升级含 calendar（`:85`） | 旧 4 预设条目 enable 后 `args.at(-1)` `toContain('preset.calendar.default')` |
| 4 | lookalike/禁用后不注入（`:106`） | lookalike `isLarkMcpEntry` false 且 runtimeEntry `toEqual(lookalike)`（原样）；legacy true+enable 注入；`disableLarkMcpForWorkspace` 后条目 `toBeUndefined()`、status `[]`、`workspace-a.mcp.json` `existsSync===false` |

## 3. 真实断言

逐条见上表（`:42-59,76-82,103,115-131`）。mock 边界：仅三依赖模块+token-crypto fake；**服务逻辑全真实**（校验/加密存/条目规范化/绑定/回滚）。

## 4. 未覆盖与脆弱点

未覆盖：`testLarkMcpConnection`/`startLarkMcpLogin` 流（真实 spawn）、App ID 非法分支、明文回退拒存、同名非受管抛。fake token-crypto 与生产 safeStorage 行为差异由注释声明（`:10-12`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:40-132` |
| Secret 不落盘+按绑定注入 | 已证实 | `:44-59` |
| 预设归一化/升级 | 已证实 | `:76-82,103` |
| lookalike 拒/禁用清理 | 已证实 | `:115-131` |
| 登录/握手流 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 凭据隔离/绑定 | 1 | 40-60 | covered |
| 归一化/升级 | 2,3 | 62-104 | covered |
| lookalike/禁用 | 4 | 106-132 | covered |
| 登录/握手 | 无 | — | unknown |
