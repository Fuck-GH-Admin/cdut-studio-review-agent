---
path: apps/electron/src/main/lib/review/review-v3-main-native-archive-registry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9513ab4330a2ae2077f5d71da2d5cf8d679fb230
sha256: 21b8ffc9c72be7e58e67faccde4dc37fd92e3a161e22939c2ace8983e41f8c49
lines: 115
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-native-archive-registry.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `CMainNativeArchiveRegistry`（C-MAIN-PICKER-R01）的物理原件见证语义：每次特权读都重哈希；同一 live grant 内私有 key 稳定但 revoke 后必须重选；错字节/同名替换/同 SHA 换 inode/符号链接/硬链接不复用信任；撤权/轮换/丢主窗口 fail-closed；冷注册表不可复用。

## 2. 用例清单

共 5 个 `test(`（`review-v3-main-native-archive-registry.test.ts:47-114`，单一 `describe`）。

夹具（`:16-46`）：`mkdtempSync` 临时目录 + 真实写 `archive-<n>.zip`（'PK\x03\x04…' 字节）；`scope()` 八字段身份（`frameId:'321:4'`、`ownerGeneration:epoch`）；`expected` 为真实字节 SHA/长度；注入 `currentScope`/`assertCurrentArchive`/`pickZipPath`；控制柄 `rotate/revoke/noMain/frameSwap/select/wrongExpected`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | OS-picked bytes are rehashed on every privileged read; same private key only within one live grant（`:48`） | pick→resolve×2→再 pick→revoke→resolve→再 pick→resolve→close→resolve | `one.length>16`；两次 resolve `toBe(one)`；再 pick `toThrow('ARCHIVE_ALREADY_REGISTERED')`；revoke 后 `CURRENT_NATIVE_REPICK_REQUIRED`；重选后 `two` `not.toBe(one)`；close 后 `REGISTRY_CLOSED` |
| 2 | wrong bytes, same-name replacement and same SHA copied into distinct physical inode never reuse trust（`:63`） | 选错字节文件；`renameSync` 同内容副本覆盖 | `PICKED_DIFFERENT_PHYSICAL_ORIGINAL`；`PHYSICAL_ORIGINAL_REPLACED` |
| 3 | symlink and multiply hardlinked physical sources are not accepted as native regular origin（`:76`） | 符号链接/`linkSync` 硬链接 | 两次 `REGULAR_UNLINKED_ZIP_REQUIRED` |
| 4 | revoked Principal/Owner/grant, forged source SHA and lost Main window fail closed（`:87`） | `wrongExpected()`；`rotate()`；`revoke()`；`noMain()` | `B_VAULT_CURRENT_GRANT_OR_ARCHIVE_REVOKED`（伪造 SHA）；`CURRENT_NATIVE_REPICK_REQUIRED`（轮换）；`B_VAULT_CURRENT_GRANT_OR_ARCHIVE_REVOKED`（撤权）；`AUTHENTICATED_MAIN_SCOPE_REQUIRED`（丢窗口） |
| 5 | native repick not possible after cold registry restart without a fresh OS selection（`:100`） | 新建空注册表 + `pickZipPath:()=>undefined` | `CURRENT_NATIVE_REPICK_REQUIRED`；`USER_DID_NOT_SELECT_ORIGINAL` |

## 3. 真实断言

- 用例 1：`expect(one.length).toBeGreaterThan(16)`（`:52`）；`expect(f.registry.resolveNativeArchiveKey(f.expected)).toBe(one)`（`:53`）；`toThrow('ARCHIVE_ALREADY_REGISTERED')`（`:54`）；`toThrow('CURRENT_NATIVE_REPICK_REQUIRED')`（`:56`）；`expect(two).not.toBe(one)`（`:59`）；`toThrow('REGISTRY_CLOSED')`（`:61`）。
- 用例 2：`toThrow('PICKED_DIFFERENT_PHYSICAL_ORIGINAL')`（`:68`）；`toThrow('PHYSICAL_ORIGINAL_REPLACED')`（`:74`）。
- 用例 3：两次 `toThrow('REGULAR_UNLINKED_ZIP_REQUIRED')`（`:81,85`）。
- 用例 4：`toThrow('B_VAULT_CURRENT_GRANT_OR_ARCHIVE_REVOKED')`（`:89,95`）；`toThrow('CURRENT_NATIVE_REPICK_REQUIRED')`（`:92-93`）；`toThrow('AUTHENTICATED_MAIN_SCOPE_REQUIRED')`（`:98`）。
- 用例 5：`toThrow('CURRENT_NATIVE_REPICK_REQUIRED')`（`:112`）；`toThrow('USER_DID_NOT_SELECT_ORIGINAL')`（`:113`）。

夹具/mock 边界：文件系统操作（写/rename/symlink/link）全部**真实**（`node:fs`）；`currentScope`/`assertCurrentArchive`/`pickZipPath` 是内存 mock；无 Electron 对话框。

## 4. 未覆盖与脆弱点

- 未覆盖：`pickForBVault`（本文件只用 `pick()`）、`PICKER_CAPACITY_CLOSED`、`MAIN_OWNER_OR_FRAME_CHANGED_AFTER_PICK/READ`、`VAULT_EXACT_ORIGINAL_REQUIRED`、`OS_PATH_INVALID`、`MAX_BYTES` 边界。
- 脆弱点：`renameSync` 同内容换 inode 依赖文件系统语义；用例 4 的 `B_VAULT_CURRENT_GRANT_OR_ARCHIVE_REVOKED` 来自 mock `assertCurrentArchive` 自定义错误（非被测类错误前缀）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:48,63,76,87,100` |
| 每次读重哈希、key 稳定于 grant 内 | 已证实 | `:48-62` |
| inode/链接替换拒绝 | 已证实 | `:63-86` |
| 冷注册表不复用 | 已证实 | `:100-114` |
| 真实文件系统操作 | 已证实 | `node:fs` 写/rename/symlink/link |
| `pickForBVault` 路径 | 间接 | nb-10 批 `review-v3-main-b20-physical-composition.test.ts` 覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| pick/resolve/revoke/close | 1 | 48-62 | covered |
| 错字节/换 inode | 2 | 63-75 | covered |
| 符号/硬链接 | 3 | 76-86 | covered |
| 撤权/轮换/丢窗口 | 4 | 87-99 | covered |
| 冷重启 | 5 | 100-114 | covered |
| `pickForBVault`/容量/边界 | 无/间接 | — | partial |
