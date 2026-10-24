---
path: apps/electron/src/main/lib/preview-path-policy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 91e57f2bfba4441561c27b1f89d0a269d5b5a388
sha256: 18d51ed743c901dc5230c938baed6093dce69320f2d173355dbf1c2305bf7572
lines: 83
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/preview-path-policy.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

只读预览路径策略：工作区外普通文件/日志/目录放行（皮肤场景）；系统敏感/凭据/软链逃逸/不存在拒绝；`isCredentialSensitivePath` 默认边界覆盖私钥/钥匙串/Profer 凭据但不放宽到整个配置目录。

## 2. 用例清单

共 9 个 `test(`（两个 describe：`:22` 主判定 7 个、`:71` 凭据边界 2 个）。夹具 `createFixtureFile`（`:14-20`，mkdtemp 真实临时文件）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 皮肤目录文件放行（`:23`） | `.cdutai-dev/skins/.../preview.png` → `true` |
| 2 | /tmp 日志放行（`:28`） | `logs/…log` → `true` |
| 3 | 目录本身放行（`:33`） | 皮肤目录 → `true` |
| 4 | 系统敏感拒绝（`:38`） | win32：`System32/drivers/etc/hosts` → `false`、`isSystemSensitivePath(winDir)` `true`；POSIX：`/etc/hosts` → `false`、`/etc` → `true` |
| 5 | 凭据目录拒绝（`:49`） | 覆盖 `credentialSensitiveRoots` → `false` |
| 6 | 软链逃逸拒绝（`:55`） | `symlinkSync(secret,link)` → `false`（按真实路径） |
| 7 | 不存在/空拒绝（`:65`） | 缺失路径/`''` → `false` |
| 8 | 默认凭据边界（`:72`） | `.ssh/id_ed25519`/`Library/Keychains/login.keychain-db`/`auth-tokens.enc`/`channels.json`/`sdk-config/x.json` 均 `true` |
| 9 | 不放宽到整个配置目录（`:80`） | `skins/demo-skin/skin.css` → `false`（非凭据） |

## 3. 真实断言

逐条见上表（`:25-81`）。mock 边界：无 mock；真实临时目录/软链/本机路径（win32/POSIX 分支）。

## 4. 未覆盖与脆弱点

未覆盖：`isSystemSensitivePath` 各根逐个断言（只抽 /etc 与 winDir）、macOS `/private` 别名场景。用例 8 依赖真实 `homedir()`/`getConfigDir()` 布局。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个用例 | 已证实 | `grep test(` |
| 放行三场景 | 已证实 | `:23-36` |
| 三类拒绝 | 已证实 | `:38-68` |
| 默认边界精确（不放宽） | 已证实 | `:72-82` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 放行 | 1-3 | 23-36 | covered |
| 拒绝（系统/凭据/软链/缺失） | 4-7 | 38-68 | covered |
| 默认边界 | 8,9 | 71-83 | covered |
| 其余根 | 无 | — | unknown |
