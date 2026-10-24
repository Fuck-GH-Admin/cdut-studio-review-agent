---
path: apps/electron/src/main/lib/review/review-v3-main-author-revision-read.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 788223c45822d3c9e0e40d110060c1d419e8a664
sha256: 07a9deaf7c9a2c1f7bc374266ae0023a04a1e271f6bc9c676e6247d9cac9a2d6
lines: 119
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-author-revision-read.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `CMainTrustedAuthorRevisionRead` 的非 IPC 信任边界：只返回真实 B1 最新修订的只读候选快照；模板/授权/frame/Owner 任一不满足即拒绝；异步期间身份轮换或作者修订变化必须拒绝而不是合并；`authorId` 不得升级为 Main 权限；依赖缺失与 digest 不一致必须拒绝。

## 2. 用例清单

共 7 个 `test(`（`review-v3-main-author-revision-read.test.ts:53-118`，单一 `describe`）。

夹具（`:20-52`）：`fixture()` 内部维护可变 `identity`/`allowed`/`currentDoc`/`revision`/`observe` 计数/`nextRead` 钩子；`latest()` 返回带 `digest:digest(document)` 的 `CMainB1AuthorRevision`；端口用 `currentIdentity/canRead/readLatestAuthorRevision` 三个注入回调构造。控制柄：`rotate()`（`ownerGeneration:8`）、`closeFrame()`（identity=undefined）、`revoke()`（`allowed=false`）、`makeEdit()`（换 `fields` 并 `revision++`）、`onRead(cb)`。文档 `Draft` = `CMainB1CandidateDocument` + `fields/sources`（`:9-14`）；身份 `id` 七字段固定（`:15-19`）。

| # | 用例（行） | 设置/动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | reads only the real latest source with fresh Main auth and display-only candidate status（`:54`） | 正常读取（expectedRevision=1）；改返回对象再读 | `result` 全字段 `toEqual` `{schemaVersion:'review-v3-author-current-read/1',templateId:'author-template-51',revision:1,sourceDigest:digest(document()),document:document(),state:'candidate-held',displayOnly:true}`；`observations()===2`（双读）；改 `fields.push('client-only')` 后再读 `again.document.fields` 仍 `['f1']`（克隆隔离） |
| 2 | a different template, unauthorized Main actor or missing physical senderFrame refuses（`:68`） | `readLatestAuthorRevision('../traversal')`、`'other-template'`、`revoke()`、`closeFrame()` | 分别 `TEMPLATE_SCOPE_INVALID`、`NOT_AUTHORIZED`、`NOT_AUTHORIZED`、`IDENTITY_UNTRUSTED` |
| 3 | owner generation rotates after awaited B read, preventing late stale frame result（`:78`） | `onRead(()=>rotate())` | `MAIN_CONTEXT_REVOKED`；`observations()===1`（第一次读取后即拒绝） |
| 4 | Main owner/frame lost after second read denies returned snapshot（`:84`） | 第二次读取时 `closeFrame()` | `IDENTITY_UNTRUSTED` |
| 5 | author revision changes during async double latest read, require explicit conflict reopen（`:90`） | 第一次读取后 `makeEdit()`；另 `expectedRevision:5`；`expectedRevision:-1` | `AUTHOR_REVISION_CONFLICT_REOPEN_REQUIRED` ×2、`EXPECTED_REVISION_INVALID` |
| 6 | author recordedBy is never used as Main Principal or publication authority（`:99`） | 正常读取 | `document.status==='candidate-held'`；`not.toHaveProperty('principalId')`、`not.toHaveProperty('publicationAllowed')` |
| 7 | rejects missing privileged Main observer/authorizer and inconsistent B1 digest（`:106`） | `new CMainTrustedAuthorRevisionRead({} as never)`；伪造 `digest:'0'.repeat(64)` | `PRIVILEGED_DEPENDENCIES_REQUIRED`；`AUTHOR_SOURCE_DIGEST_CHANGED` |

## 3. 真实断言

- 用例 1：`expect(result).toEqual({...})`（`:57-62`）；`expect(f.observations()).toBe(2)`（`:63`）；`expect(again.document.fields).toEqual(['f1'])`（`:66`）。
- 用例 2：`rejects.toThrow('TEMPLATE_SCOPE_INVALID')`（`:70`）、`NOT_AUTHORIZED`（`:71,73`）、`IDENTITY_UNTRUSTED`（`:76`）。
- 用例 3：`rejects.toThrow('MAIN_CONTEXT_REVOKED')`（`:81`）；`expect(f.observations()).toBe(1)`（`:82`）。
- 用例 4：`rejects.toThrow('IDENTITY_UNTRUSTED')`（`:88`）。
- 用例 5：`AUTHOR_REVISION_CONFLICT_REOPEN_REQUIRED`（`:94,96`）；`EXPECTED_REVISION_INVALID`（`:97`）。
- 用例 6：`expect(result.document.status).toBe('candidate-held')`（`:102`）；`expect(result).not.toHaveProperty('principalId')`（`:103`）；`not.toHaveProperty('publicationAllowed')`（`:104`）。
- 用例 7：`expect(()=>new CMainTrustedAuthorRevisionRead({} as never)).toThrow('PRIVILEGED_DEPENDENCIES_REQUIRED')`（`:107`）；`rejects.toThrow('AUTHOR_SOURCE_DIGEST_CHANGED')`（`:117`）。

夹具/mock 边界：无 Electron、无磁盘、无 IPC；B1 读取用内存回调（`latest()`），身份/授权全部 mock 注入；这是对适配器本身的单元测试，不含真实 B1 存储。

## 4. 未覆盖与脆弱点

- 未覆盖：`parentDigest` 字段、2MB 上限、`readLatestAuthorRevision` 回调返回 `undefined`、抛出异常/拒绝的 promise、`revision<1`/`savedAt` 空等 `verified` 细分分支、`templateId` 边界（如 80 字符长度）。
- 脆弱点：`expect(result).toEqual(...)` 要求字段顺序无关但形状完全一致；`digest()` 夹具算法若与 B1 真实摘要算法不一致（当前同为 `JSON.stringify` 后 sha256）会全组失配；`observations()` 断言依赖“恰好双读”的实现细节。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例 | 已证实 | `grep test(`；`:54,68,78,84,90,99,106` |
| 双读被断言（observations===2） | 已证实 | `:63` |
| 克隆隔离被断言 | 已证实 | `:64-66` |
| 拒绝路径逐错误码断言 | 已证实 | `:70-97,107,117` |
| 测试无磁盘/无 Electron | 已证实 | 全文仅 `node:crypto`/`bun:test`/被测模块 import |
| 2MB/parentDigest/回调异常 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 正常读取 + 克隆隔离 | 1 | 54-67 | covered |
| 模板/授权/frame 拒绝 | 2 | 68-77 | covered |
| 轮换 grant 拒绝 | 3 | 78-83 | covered |
| 第二读后丢帧拒绝 | 4 | 84-89 | covered |
| 双读冲突/expectedRevision | 5 | 90-98 | covered |
| authorId 无权限语义 | 6 | 99-105 | covered |
| 依赖缺失/digest 不符 | 7 | 106-118 | covered |
| 2MB 上限/parentDigest/回调异常 | 无 | — | unknown |
