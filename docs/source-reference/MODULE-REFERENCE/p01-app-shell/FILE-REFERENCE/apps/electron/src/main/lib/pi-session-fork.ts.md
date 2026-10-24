---
path: apps/electron/src/main/lib/pi-session-fork.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 002626390a4cc854d37de423b12d57fc42597e75
sha256: 4e12e1f55dcfea3350152d890adcc6441f25c0858cfda8f3d1b46eba29cb9eb5
lines: 40
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-session-fork.ts

## 1. 结论与边界

Pi SDK 分叉调用的可替换边界（主进程运行时）：把 `SessionManager.open → createBranchedSession → forkFrom` 三步封装成 `forkPiSessionArtifact`，供会话管理器在分叉时调用（文件头 `apps/electron/src/main/lib/pi-session-fork.ts:10-16`）。存在理由是测试工程化：Bun `mock.module()` 进程级不可恢复，会话管理器测试只替换本边界，避免污染后续 SDK smoke/model registry 测试（`:12-15`）；生产仍用 Pi 原生分叉。

边界：不管理分叉后会话元数据/检查点迁移（`agent-session-manager`）；不含 SDK 实现（动态 `import('@earendil-works/pi-coding-agent')`）。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 1 函数 = 2 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiForkedSession` | 接口（导出） | 3-8 | `{getSessionFile(), getSessionId(), getEntry(entryId), appendCustomMessageEntry(customType, content, display, details?)}` | 分叉产物最小契约 |
| `forkPiSessionArtifact` | 函数（导出） | 17-40 | `(input{sourceSessionFile, sessionDir, sourceDir, destinationDir, entryId}) => Promise<PiForkedSession>` | 分叉入口 |

无内部函数。

## 3. 内部逻辑与关键流程

1. 沙箱红线（`:24-27`）：`sourceDir` 或 `destinationDir` 为空 → 抛 `Error('Pi 分叉缺少会话沙箱目录，已拒绝执行')`，绝不退回进程启动目录。
2. 动态导入 SDK（`:28`）→ `SessionManager.open(sourceSessionFile, sessionDir, sourceDir)`（`:29`）。
3. `createBranchedSession(entryId)` 生成分支文件；`!branchFile || !existsSync(branchFile)` → 抛 `Error('Pi 未能生成分叉 session artifact')`（`:30-33`）。
4. 返回 `sdk.SessionManager.forkFrom(branchFile, destinationDir, sessionDir)`（`:35-39`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`agent-session-manager.ts:34`（import）、`:1946`（`const forkedManager = await forkPiSessionArtifact({…})`，分叉流程）。测试侧经 mock 替换本模块（`agent-session-manager.pi-fork.test.ts`，非本批，间接）。

出向：`@earendil-works/pi-coding-agent`（动态 import，`:28`）；`node:fs` `existsSync`（`:1`）。类型 `PiForkedSession` 为对 SDK 分叉对象的结构化近似（推断：与 `forkFrom` 返回形状对齐）。

## 5. 数据 I/O、读写与副作用

- 读：`existsSync(branchFile)`（`:31`）。写：SDK 侧创建分支 session 文件（经 `createBranchedSession`/`forkFrom`，具体落盘在第三方）。
- 副作用：调用 SDK 产生新的 session artifact 文件；无日志。
- 并发/幂等：每次调用新建分支文件（entryId 相同会生成多个 artifact，推断）；无锁。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 拒绝执行 | sourceDir/destinationDir 为空 | 25-27 | 抛错 |
| 分叉产物缺失 | branchFile 空/不存在 | 31-33 | 抛错 |
| SDK 异常 | open/createBranched/forkFrom 抛错 | 28-39 | 直接冒泡（无 try/catch） |

无取消/恢复：单次异步编排；失败不产生半成品的清理逻辑（SDK 行为未知，标未知）。

## 7. 权限与权威状态

沙箱红线即权限边界（`:24-27`）：必须显式给定源/目标会话目录；无 sender/role 检查，依据：本文件无 Electron sender 校验，权威在调用方（agent-session-manager）传参。

## 8. 修改影响面

- 唯一生产调用方 `agent-session-manager.ts:1946`；改签名影响分叉流程。
- `PiForkedSession` 接口是测试 mock 的契约面：改动需同步 `agent-session-manager.pi-fork.test.ts`（非本批）。
- SDK 升级（`SessionManager` API）需同步 `:28-39`。
- 需同步的测试：`agent-session-manager.pi-fork.test.ts`（间接，非本批）。

## 9. 测试证据

直接测试：**无**（本文件自身无专属测试；全树 `*.test.*` 检索 `pi-session-fork` 仅命中 `agent-session-manager.pi-fork.test.ts`，其测的是会话管理器分叉流程并对本边界做 mock，属间接）。

真实断言：不适用。未覆盖：两个抛错分支、SDK 异常冒泡、真实 SDK 分叉。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实 SDK 调用。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 流程行号 | 已证实 | `:3-40` 逐行读 |
| 两个抛错分支 | 已证实 | `:25-27, 31-33` |
| 唯一调用方 | 已证实 | `agent-session-manager.ts:34,1946` |
| `PiForkedSession` 与 SDK 形状对齐 | 推断 | 接口注释 + 调用点 |
| SDK forkFrom 实际行为/落盘 | 未知 | 第三方包不在冻结树 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PiForkedSession` | §2 | 3-8 | covered |
| `forkPiSessionArtifact` 主流程 | §3 | 17-40 | covered |
| 沙箱红线分支 | §3, §6-7 | 24-27 | covered |
| 分支产物缺失分支 | §3, §6 | 31-33 | covered |
| 调用链 | §4 | - | covered |
| SDK 内部/运行期 | §9-10 | - | unknown（第三方/NOT_RUN） |
