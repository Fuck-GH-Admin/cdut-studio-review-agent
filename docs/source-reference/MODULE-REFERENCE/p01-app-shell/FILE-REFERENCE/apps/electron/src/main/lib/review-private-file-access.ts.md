---
path: apps/electron/src/main/lib/review-private-file-access.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7fe329464490e88a14e02d272f620ba011905a4e
sha256: 618a2a4130143499422176dd901b3eed1e2f5f183fda8c39d83a6f2288bac0e0
lines: 65
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/review-private-file-access.ts

## 1. 结论与边界

审核私有路径的 Main 侧 DENY-only 围栏（主进程）：审核案例 Agent 会话的私有目录/文件拒绝普通访问，叠加在普通 desktop/preview 根授权之下；原始路径与 canonical 路径都检查以封堵符号链接别名（文件头 `apps/electron/src/main/lib/review-private-file-access.ts:1-5`）。

边界：不授予任何访问权（只拒绝）；普通根/会话授权仍由 IPC 调用方执行（`:55-58` 注释）；判定实现在 `remote-file-access.isReviewPrivateConfigPath`（跨文件）。

## 2. 导出与关键符号

`export` 逐条核对：4 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isReviewPrivateDesktopPath` | 函数（导出） | 11-38 | `(path: string) => boolean` | 私有路径判定（含 symlink 解析） |
| `isUnsafeAgentWorkspaceMutationPath` | 函数（导出） | 41-48 | `(path: string) => boolean` | 变异路径不安全判定 |
| `filterOrdinaryDesktopFileEntries` | 函数（导出） | 51-53 | `<T extends {path}>(entries) => T[]` | 目录列举过滤私有子项 |
| `renameOrdinaryAgentFileEntry` | 函数（导出） | 60-65 | `(sourcePath, targetPath) => void` | 双端检查后 renameSync |

无内部函数；内部回调 `deny`（`:17-22`）。

## 3. 内部逻辑与关键流程

1. `isReviewPrivateDesktopPath`（`:11-38`）：空/非字符串→false（`:12`）；`deny(target)` = `isReviewPrivateConfigPath(target, getConfigDir(), lazy require agent-session-manager 的 isReviewOwnedOrDeletedAgentSessionId)`（`:17-22`，**延迟 require** 保持本模块可在 Bun/渲染无关工具加载，`:14-16` 注释）；候选路径直接命中即 true（`:23`）；否则从候选向上找最近存在的父目录 `realpathSync` 后拼 suffix 再判——封堵“目标不存在但经 symlink 父目录重命名走私”（`:24-37`）。
2. `isUnsafeAgentWorkspaceMutationPath`（`:41-48`）：私有路径→true；`rel===''`（agent-workspaces 根本身）→true（`:45`）；路径在 agent-workspaces 之外→false（`:46`，普通授权层管）；直接子级（一层）→true（禁删整个工作区容器，`:47`）。
3. `filterOrdinaryDesktopFileEntries`（`:51-53`）：过滤掉 `isReviewPrivateDesktopPath` 命中项（隐藏私有子名）。
4. `renameOrdinaryAgentFileEntry`（`:60-65`）：源/目标任一 `isUnsafeAgentWorkspaceMutationPath` → 抛 `Error('审核内部或共享容器路径不可操作')`，否则 `renameSync`。

## 4. 调用者与调用链

入向（全树检索，证实）：`ipc.ts:141`（import 全部 4 个）；调用点：`isReviewPrivateDesktopPath` `:761,:796,:4696,:4770,:4781` 等（读/列举过滤）；`isUnsafeAgentWorkspaceMutationPath` `:590,:5382,:5400,:5420,:5440`（写/删守卫）；`renameOrdinaryAgentFileEntry` `:5220,:5241,:5388,:5407`（重命名）；`filterOrdinaryDesktopFileEntries` **生产代码 0 调用**（`ipc.ts` 仅 import `:141`；批外测试 `review/review-desktop-private-path.p04.test.ts:84` 直接调用）。

出向：`./config-paths`（`getConfigDir`/`getAgentWorkspacesDir`，`:8`）、`./remote-file-access` `isReviewPrivateConfigPath`（`:9`）、`./agent-session-manager`（延迟 require，`:19`）、`node:fs` `realpathSync`/`renameSync`（`:6`）。

## 5. 数据 I/O、读写与副作用

- 读：`realpathSync`（`:30`）、`existsSync`（隐含于 realpath 失败循环）。
- 写：`renameSync`（`:64`，唯一写点，经双端守卫）。
- 副作用：无日志。并发/幂等：纯判定+单次 rename；TOCTOU 窗口存在（判定与 renameSync 之间，推断——调用方需自行串行化）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 空路径 false | 非字符串/空 | 12 |
| 直接命中私有 | deny(candidate) | 23 |
| 父目录 symlink 解析 | 目标不存在 | 24-37 |
| 工作区根/一层子级拒 | rel 计算 | 45-47 |
| rename 双端拒绝 | 任一端不安全 | 61-63 |

向上 realpath 循环到文件系统根后返回 false（`:32-33`）；`realpathSync` 抛错（不存在）即继续向上（`:31-36` catch）。无取消/恢复概念，依据：判定+单次系统调用。

## 7. 权限与权威状态

- **DENY-only**（`:2-3`）：不替代普通 desktop/preview root 授权；IPC 调用方必须先做常规授权再调本守卫（`:55-58`）。
- 私有判定权威=`remote-file-access.isReviewPrivateConfigPath` + agent-session-manager 的 owner/deleted 身份（延迟加载，`:17-22`）。
- 审核会话身份权威的恢复韧性见 `review-owner-index-recovery.p06-fix01.test.ts`（本批测试，索引损坏时 fail-closed）。

## 8. 修改影响面

- `ipc.ts` 全部文件读写 IPC（§4 的十余处）：改判定影响审核隔离红线（安全敏感）。
- `isReviewPrivateConfigPath` 契约（remote-file-access，非本批）。
- rename 守卫与 `agent-workspaces` 目录结构耦合（`:43-47`）。
- 需同步的测试：`review-owner-index-recovery.p06-fix01.test.ts`（本批，8+1 用例）、`review/review-desktop-private-path.p04.test.ts`（批外直接调用测试）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts`（本批，9 用例，逐条见该手册）——其断言大量经 `isReviewPrivateDesktopPath` 验证索引损坏时仍 fail-closed（如测试 `:43,:48,:71,:83,:110-111`）。另有 `review/review-desktop-private-path.p04.test.ts`（批外直接调用测试 `:84`，未逐条读）。

未覆盖：`isUnsafeAgentWorkspaceMutationPath` 单独分支、`renameOrdinaryAgentFileEntry` 双端拒绝、`filterOrdinaryDesktopFileEntries`（生产代码无调用；批外 p04.test 直测）。

NOT_RUN：本轮未运行任何测试/typecheck/构建。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + 流程行号 | 已证实 | `:11-65` 逐行读 |
| 延迟 require 设计 | 已证实 | `:14-22` |
| symlink 父目录封堵 | 已证实 | `:24-37` |
| rename 双端守卫 | 已证实 | `:60-65` |
| filterOrdinaryDesktopFileEntries ipc.ts 导入未使用（生产 0 调用；批外 p04.test 直测） | 已证实 | `ipc.ts` 全文检索仅 `:141`；p04.test `:15,:84` |
| 判定与 rename 间 TOCTOU | 推断 | 无锁 |
| isReviewPrivateConfigPath 判定细节 | 未知 | 非本批文件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isReviewPrivateDesktopPath` | §3.1, §7 | 11-38 | covered |
| `isUnsafeAgentWorkspaceMutationPath` | §3.2 | 41-48 | covered |
| `filterOrdinaryDesktopFileEntries` | §3.3, §4 | 51-53 | covered |
| `renameOrdinaryAgentFileEntry` | §3.4, §6 | 60-65 | covered |
| 调用链 | §4 | - | covered |
| remote-file-access 判定 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
