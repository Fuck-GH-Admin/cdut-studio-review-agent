---
path: apps/electron/src/main/lib/shell-snapshot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d9fef7411972f523373343a1ded2628baf067d1
sha256: 3014d6ebb69ddaa76941dcdd1077a162cbc970886a7cffbce59bd1957a74c365
lines: 85
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/shell-snapshot.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Shell 快照：同会话二次捕获复用持久化快照（hash 稳定）；rebuild 在 login 环境变化时换 hash/pathEntries；净化排除凭据类 key；写入失败仍可内存快照继续。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/shell-snapshot.test.ts:12,44,72,79`，单一 `describe`）。夹具：`mkdtempSync` 真实临时根；`getLoginEnv` 注入。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 二次捕获复用（`:12`） | `second.envHash===first.envHash`、`id` 同、`source==='login-shell'`；darwin 下 `commandPaths.bash` 为 `/bin/bash` 或 `/usr/bin/bash`（非 darwin `toBeDefined`）；`second.env.API_KEY` `toBeUndefined()` |
| 2 | rebuild 换 hash/路径（`:44`） | `rebuilt.envHash` `not.toBe(first)`、`pathEntries` `toContain('/opt/homebrew/bin')` |
| 3 | 净化排除凭据（`:72`） | `sanitizeShellEnvironment({PATH,SHELL,ANTHROPIC_API_KEY,MY_PASSWORD,SAFE_FLAG})` `toEqual({PATH:'/bin',SHELL:'/bin/bash',SAFE_FLAG:'1'})` |
| 4 | 写入失败内存继续（`:79`） | `persist:false`+受限根 → `snapshot.envHash` `toHaveLength(64)` |

## 3. 真实断言

逐条见上表（`:22-32,57-58,67,81`）。mock 边界：`getLoginEnv` 注入；磁盘为真实临时目录；被测函数真实实现。

## 4. 未覆盖与脆弱点

未覆盖：`persistShellSnapshot` 真实写失败分支（用例 4 用 `persist:false` 绕过写入）、`isSnapshot` 损坏分支、win32 探测、`inferShell` 分派。用例 1 的 darwin 分支依赖宿主 bash 存在。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(` |
| 复用/hash 稳定 | 已证实 | `:22-24` |
| rebuild 语义 | 已证实 | `:57-58` |
| 净化精确（保留元数据） | 已证实 | `:67` |
| 真实写失败路径 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 复用 | 1 | 12-42 | covered |
| rebuild | 2 | 44-70 | covered |
| 净化 | 3 | 72-77 | covered |
| 内存继续 | 4 | 79-84 | covered |
| 写失败/损坏/win32 | 无 | — | unknown |
