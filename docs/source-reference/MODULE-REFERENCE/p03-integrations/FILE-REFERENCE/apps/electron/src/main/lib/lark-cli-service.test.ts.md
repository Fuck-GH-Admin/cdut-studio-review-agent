---
path: apps/electron/src/main/lib/lark-cli-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d2feb8408d933ef11b038e9d2fff8f393e0dc1fa
sha256: ea2407da33f944e43dbd3c533f4220180abd70ccd10ada16bfcc9069e0beb339
lines: 89
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/lark-cli-service.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Lark CLI 服务：`parseLarkAuthStatus` 不保留密钥/授权失败识别/官方 identities 形状；`installLarkCli` 走 npm global（装后可发现）；`detectLarkCli` 从注入命令汇总版本与登录态。

## 2. 用例清单

共 5 个 `test(`（`apps/electron/src/main/lib/lark-cli-service.test.ts:15,25,29,40,58`；describe `:14` 3 个、`:39` 1 个、`:57` 1 个）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | JSON 不留密钥（`:15`） | 输入含 `token:'must-not-be-returned'`；`toEqual({state:'logged_in',userLabel:'user@example.com',scopeCount:2,checkedAt:expect.any(Number)})`（无 token 字段） |
| 2 | 授权失败识别（`:25`） | `'login required: token expired'` → `state` `toBe('reauthorization_required')` |
| 3 | identities 形状（`:29`） | `tokenStatus:'expired'`+`available:false` → `reauthorization_required`、`userLabel:'Feishu User'`、`scopeCount` 2 |
| 4 | npm global 安装（`:40`） | `installLarkCli()` `resolves.toEqual({success:true,message:'Official Lark CLI installed'})`；calls 含 `['install','--global','@larksuite/cli@latest']`（win32 `npm.cmd`/posix `npm` 路径） |
| 5 | 检测汇总（`:58`） | `detectLarkCli()`：`cli.available` true、`cli.version` `'1.0.0'`、`auth.state` `'logged_in'`、`auth.userLabel` `'test-user'`、`getLarkDiagnostics(result).authState` `'logged_in'` |

## 3. 真实断言

逐条见上表（`:22,26,33-35,52-53,83-87`）。mock 边界：`__setLarkCliCommandRunner` 注入 exec（按命令名应答/意外命令抛错 `:77`）；spawn 不用即抛（`:48,79`）；`afterEach __resetLarkCliTestState`（`:12`）。

## 4. 未覆盖与脆弱点

未覆盖：`startLarkLogin` 流/超时/取消、`installLarkCli` 失败路径、mac fallback 查找、`redactLarkOutput` 单测。用例 4 断言依赖平台分支常量。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个 test 声明 | 已证实 | `grep test(`；`:15-88` |
| 密钥不外泄断言 | 已证实 | `:16-22` |
| npm global 契约 | 已证实 | `:40-53` |
| 登录流/失败路径 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 状态解析 | 1-3 | 15-37 | covered |
| 安装 | 4 | 40-54 | covered |
| 检测 | 5 | 58-88 | covered |
| 登录流/失败 | 无 | — | unknown |
