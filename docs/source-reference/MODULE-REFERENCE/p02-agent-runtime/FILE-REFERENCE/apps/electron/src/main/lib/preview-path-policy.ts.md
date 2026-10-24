---
path: apps/electron/src/main/lib/preview-path-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1ce9ed35460f1fb9a27ac020e79122624e17fbe5
sha256: 844f3ef11145e2357434458fac631832279c88bfd33b4eb9dafd6d0afe6a09be
lines: 120
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/preview-path-policy.ts

## 1. 结论与边界

只读预览的路径策略（文件头 `apps/electron/src/main/lib/preview-path-policy.ts:1-15`）。背景：Agent 输出的链接常指向会话工作区外（`~/.cdutai[-dev]/skins/...`、`/tmp/*.log` 等），用户已可见，点开预览不应被授权根拦成「文件不存在」误导。因此放宽为「真实存在 + 不在系统敏感 + 不在凭据/隐私位置」即放行；保留两条硬边界：①系统敏感目录（/etc、C:\Windows 等）；②凭据/浏览器隐私目录。**写操作与 `shell:system-open-file` 不受本策略影响**，继续走 ipc.ts 授权根（`:13-14`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个常量 + 1 个接口 + 4 个函数 = 6 个导出（类 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SYSTEM_SENSITIVE_ROOTS` | 常量（导出） | 24-33 | win32=SystemRoot/ProgramFiles/ProgramFiles(x86)/ProgramData（env 兜底）；POSIX=/etc,/sys,/proc,/dev,/boot,/root,/usr/lib,/usr/lib64,/usr/sbin,/sbin,/bin,/usr/bin | |
| `getCredentialSensitiveRoots` | 函数（导出） | 41-67 | `(configDir?,home?)=>string[]` | 私钥/云凭据/密码库/浏览器 Cookie/Profer token（`auth-tokens.enc`/`remote-token.json`/`channels.json`/`sdk-config`） |
| `isSystemSensitivePath` | 函数（导出） | 89-91 | `(path)=>boolean` | 内部归一化 |
| `isCredentialSensitivePath` | 函数（导出） | 94-96 | `(path,roots?)=>boolean` | |
| `PreviewPathPolicy` | 接口（导出） | 98-103 | 两 roots 覆盖（测试用） | |
| `isReadOnlyPreviewPathAllowed` | 函数（导出） | 110-120 | `(filePath,policy?)=>boolean` | 主判定 |
| `realpathOrResolve`/`isInsideAnyRoot` | 内部 | 69-84 | realpath 归一（失败退 resolve）；等值或 `+sep` 前缀（macOS /private、Windows 大小写，`:80-82`） | |

## 3. 内部逻辑与关键流程

`isReadOnlyPreviewPathAllowed`（`:110-120`）：空路径/`isReviewPrivateDesktopPath` → false（审核私有直接拒）；`existsSync` 双检（原路径与 realpath 后，消解软链——指向 `~/.ssh` 的软链被边界拦，`:112-116`）；系统敏感/凭据敏感任一命中 → false；否则 true。

## 4. 调用者与调用链

入向：只读预览判定（`preview-inspection-service.ts` 等）；测试：`preview-path-policy.test.ts`（83 行，本批）。出向：`node:fs/os/path`、`./config-paths.ts:20`（`getConfigDir`）、`./review-private-file-access.ts:21`。

## 5. 数据 I/O、读写与副作用

读：`existsSync/realpathSync`；无状态（roots 常量/函数级参数化，测试可覆盖）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 空/审核私有路径 | false | 111 |
| 不存在 | false | 114,116 |
| 系统敏感命中 | false | 117 |
| 凭据敏感命中 | false | 118 |
| realpath 失败（根缺失） | 退 resolve 仍按前缀拦 | 71-74 |

无取消概念。

## 7. 权限与权威状态

- 不可信任的是渲染层（`:8-9`）；策略刻意**不要求**会话授权根（`:107-108`），以存在性+敏感边界为权威。
- 写/打开走 ipc.ts 授权根（`:13-14` 显式划界）。

## 8. 修改影响面

改 roots/判定影响预览安全与 `preview-path-policy.test.ts`；改 `getCredentialSensitiveRoots` 影响凭据暴露面。

## 9. 测试证据

直接测试：`preview-path-policy.test.ts`（83 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 放宽+两硬边界设计 | 已证实 | `:1-15` |
| 软链消解防绕过 | 已证实 | `:112-116` |
| 审核私有直接拒 | 已证实 | `:111` |
| 双平台敏感根 | 已证实 | `:24-33` |
| 生产接线 | 未知 | 本批未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| roots 族 | §2 | 24-67 | covered |
| 判定族 | §3 | 69-120 | covered |
| 接线 | §10 | — | unknown |
