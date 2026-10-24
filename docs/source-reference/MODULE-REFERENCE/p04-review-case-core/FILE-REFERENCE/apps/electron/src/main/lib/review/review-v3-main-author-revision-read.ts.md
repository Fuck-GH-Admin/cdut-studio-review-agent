---
path: apps/electron/src/main/lib/review/review-v3-main-author-revision-read.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ba80feb8d29844376c22e7422cde5ff33792b94f
sha256: 67b39cb407c07a7501edca75e84c20ec6b214483a95a3dea0e8388766c722ace
lines: 147
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-author-revision-read.ts

## 1. 结论与边界

Main 侧“可重入信任”的 B1 作者最新修订**只读**适配器（C-BCR002-A）：在两次 B1 全历史读取之间反复核验 Main 身份（Principal/Owner/frame/authorityEpoch），并对返回记录做形状与摘要校验；返回快照仅 `displayOnly`，不是保存/冻结授权。纯类 + 类型文件，无 IPC、无磁盘、无网络。

边界（文件头 `apps/electron/src/main/lib/review/review-v3-main-author-revision-read.ts:1-11`）：

- 不接受渲染层身份/`authorId`/发布声明；依赖全部由 Main 注入（`CMainAuthorReadDependencies`）。
- 不做自动冲突合并：两次读到的修订不一致即拒绝并要求重开。
- 不是 B1 存储本身：B1 读取实现为注入回调（生产为 `review-template-author-store-v3-b1.ts` 的 `readB1AuthorRevision:120`）。

## 2. 导出与关键符号

`export` 逐条核对：5 个接口 + 1 个类 = 6 个导出（函数 0、常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainAuthorReadIdentity` | 接口（导出） | 14-23 | `{principalId,sessionId,ownerId,ownerGeneration,windowId,frameId,authorityEpoch}` | 只能来自真实 Main；`authorityEpoch` 在撤销/轮换时更新 |
| `CMainB1AuthorRevision<TDocument>` | 接口（导出） | 25-34 | `{schemaVersion:'review-b1-draft/1',templateId,revision,authorId,savedAt,document,digest,parentDigest?}` | B1 修订记录形状 |
| `CMainB1CandidateDocument` | 接口（导出） | 35-39 | `{schemaVersion:'review-b1/1',templateId,status:'candidate-held'}` | 文档最小约束 |
| `CMainAuthorReadDependencies<T>` | 接口（导出） | 40-48 | `currentIdentity()/canRead(identity,templateId)/readLatestAuthorRevision(templateId)` | 注入依赖；`readLatestAuthorRevision` 可同步或异步 |
| `CMainAuthorReadResult<T>` | 接口（导出） | 50-59 | `{schemaVersion:'review-v3-author-current-read/1',templateId,revision,sourceDigest,document,state:'candidate-held',displayOnly:true}` | 返回投影；`displayOnly` 非写能力 |
| `CMainTrustedAuthorRevisionRead<T>` | 类（导出） | 97-147 | `readLatestAuthorRevision(templateId, expectedRevision?)` | 双读 + 双边界身份复核 |
| `nameRe`/`shaRe` | 内部 | 61-62 | `/^[A-Za-z][A-Za-z0-9._-]{0,79}$/`；`/^[a-f0-9]{64}$/` | 模板名/摘要形状 |
| `deny` | 内部 | 63 | 抛 `C_MAIN_AUTHOR_READ_<code>` | 拒绝原语 |
| `valid` | 内部 | 64 | 非空串判定 | |
| `assertIdentity` | 内部 | 65-71 | 七字段校验 + `structuredClone` | 否则 `IDENTITY_UNTRUSTED` |
| `sameIdentity` | 内部 | 72-77 | 七字段逐项相等 | 边界比较 |
| `verified` | 内部 | 78-94 | 记录形状 + 摘要复算校验 | 否则 `LATEST_REVISION_MISSING_OR_INVALID`/`AUTHOR_SOURCE_DIGEST_CHANGED` |

## 3. 内部逻辑与关键流程

### 3.1 记录校验（`verified`，`:78-94`）

要求：`schemaVersion==='review-b1-draft/1'`、`record.templateId` 与请求一致、`document.schemaVersion==='review-b1/1'`、`document.templateId` 一致、`document.status==='candidate-held'`、`revision` 为 ≥1 的安全整数、`authorId`/`savedAt` 非空、`digest` 为 64 位小写 hex（`:81-86`），否则 `LATEST_REVISION_MISSING_OR_INVALID`。随后 `JSON.stringify(document)` 长度 ≤2MB 且 sha256 等于 `record.digest`，否则 `AUTHOR_SOURCE_DIGEST_CHANGED`（`:88-92`）。返回 `structuredClone`。

注意：`digest` 覆盖的是 `document` 的 JSON（`:88-90`），不是整条记录；`revision`/`savedAt`/`authorId` 不入摘要（已证实于 `:88-90` 与测试 `review-v3-main-author-revision-read.test.ts:106-118` 用伪造 digest 触发拒绝）。

### 3.2 双读流程（`readLatestAuthorRevision`，`:112-146`）

1. `templateId` 须匹配 `nameRe` 且不是 `.`/`..`，否则 `TEMPLATE_SCOPE_INVALID`（`:116-118`）。
2. `expectedRevision` 若给须为 ≥0 安全整数，否则 `EXPECTED_REVISION_INVALID`（`:119-122`）。
3. `atStart=this.current(templateId)`（`:124`）：`current` = `assertIdentity(currentIdentity())` + `canRead`，失败分别为 `IDENTITY_UNTRUSTED`/`NOT_AUTHORIZED`（`:106-110`）。
4. `first = verified(await readLatestAuthorRevision(templateId))`（`:125`）。
5. `afterFirst = current(templateId)`；与 `atStart` 不同 → `MAIN_CONTEXT_REVOKED`（`:126-127`）。
6. `latest = verified(await ...)` 第二次读取（`:130`），`atEnd = current(...)`；不同 → `MAIN_CONTEXT_REVOKED`（`:131-132`）。
7. `first` 与 `latest` 的 `revision`/`digest`/`JSON(document)` 任一不同 → `AUTHOR_REVISION_CONFLICT_REOPEN_REQUIRED`（`:133-136`）。
8. `expectedRevision` 与 `latest.revision` 不等 → 同上（`:137-139`）。
9. 返回结果（`:140-145`）：`document` 克隆、`state:'candidate-held'`、`displayOnly:true`。

注释明确：两次读取是为了覆盖“异步作者差异/读取期间候选变化”，不是缓存 DTO（`:128-129`）。

### 3.3 构造校验

构造器要求 `deps` 三个方法都存在，否则 `PRIVILEGED_DEPENDENCIES_REQUIRED`（`:98-104`）。

## 4. 调用者与调用链

入向（冻结树 `apps/`+`packages/` grep）：

- 生产：`apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts:20-24` 导入类并在 `:282` 实例化（`handleCMainAuthorLatestRead` 内）；`review-v3-main-b20-trusted-candidate-read.ts:14` 导入类型 `CMainAuthorReadIdentity`。
- 测试：`review-v3-main-author-plan-ipc.test.ts:19-21`（类型）；`review-v3-main-author-revision-read.test.ts:4-7`（直接实例化）。

出向：仅 `node:crypto` `createHash`（`:12`）；无其它本地模块 import、无 `ipcMain`。B1 数据由注入回调提供（生产链：`review-v3-main-local-author-workbench.ts:59` 注入 `readB1AuthorRevision` → `review-template-author-store-v3-b1.ts:120`）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/全局状态；纯内存计算 + `structuredClone`。
- 副作用：无日志、无通知；失败抛 `Error('C_MAIN_AUTHOR_READ_'+code)`。
- 幂等/并发：类无状态（除注入 deps）；两次读取之间的一致性靠身份与内容比较保证，不加锁。并发写 B1 的结果就是 `AUTHOR_REVISION_CONFLICT_REOPEN_REQUIRED`。
- 原子性：不适用（只读）；返回快照不构成写授权（`:9-10`）。

## 6. 分支、失败、取消与恢复

| 错误（前缀 `C_MAIN_AUTHOR_READ_`） | 触发 | 行 |
| --- | --- | --- |
| `PRIVILEGED_DEPENDENCIES_REQUIRED` | deps 缺方法 | 102 |
| `IDENTITY_UNTRUSTED` | 身份缺失/字段非法 | 65-70 |
| `NOT_AUTHORIZED` | `canRead` 拒绝 | 108 |
| `TEMPLATE_SCOPE_INVALID` | 模板名非法/为 `.`/`..` | 116-118 |
| `EXPECTED_REVISION_INVALID` | 非安全非负整数 | 119-122 |
| `LATEST_REVISION_MISSING_OR_INVALID` | 记录形状/摘要格式非法 | 81-86 |
| `AUTHOR_SOURCE_DIGEST_CHANGED` | 文档 JSON 与 digest 不符/超 2MB | 88-92 |
| `MAIN_CONTEXT_REVOKED` | 两次读取间身份变化 | 127,132 |
| `AUTHOR_REVISION_CONFLICT_REOPEN_REQUIRED` | 两次读取内容不同 / expectedRevision 不符 | 133-139 |

- 失败后状态：只读，无写入可回滚；调用方（IPC 层）把异常透传给渲染层。
- 取消/恢复：无取消；恢复方式是调用方重新发起读取（冲突时“reopen”由调用方决定）。

## 7. 权限与权威状态

- 权限判定来自注入的 `canRead` 与 `currentIdentity`（`:42-45`）；本文件不看 sender——sender 证明在 IPC 层（`review-v3-main-author-plan-ipc.ts:221-236` 的 `liveFrame`）完成后再传入。
- 权威状态：返回 `state:'candidate-held'`、`displayOnly:true`（`:56-58,143-144`）；文件注释强调“不是持久保存/冻结权限；每次未来变更必须在自己的 CAS 锁内重复授权”（`:9-10`）。
- `authorId` 明确不是 Main Principal（注释 `:5-7`；测试 `review-v3-main-author-revision-read.test.ts:99-105` 断言返回对象不含 `principalId`/`publicationAllowed`）。

## 8. 修改影响面

- 改 `CMainB1AuthorRevision`/摘要校验会影响 B1 存储（`review-template-author-store-v3-b1.ts`）与 `review-v3-main-author-plan-ipc.ts:277-296` 的构造。
- 改双读/冲突语义会影响测试 `review-v3-main-author-revision-read.test.ts` 全部 7 例与 `review-v3-main-author-plan-ipc.test.ts:216-223`。
- `CMainAuthorReadIdentity` 被 `review-v3-main-b20-trusted-candidate-read.ts` 复用（`CMainB20ReadIdentity` 扩展），改字段影响 B20 全链。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-main-author-revision-read.test.ts`（119 行，7 个 `test(`，详见该文件手册）。静态断言要点：返回形状/`displayOnly`/克隆隔离（`:57-66`）、越权与非法模板拒绝（`:68-77`）、轮换/关帧拒绝（`:78-89`）、双读冲突与 `expectedRevision`/`-1`（`:90-98`）、`authorId` 不升级为权限（`:99-105`）、构造与 digest 校验（`:106-118`）。

间接证据：`review-v3-main-author-plan-ipc.test.ts:198-223` 经 IPC 层覆盖本类的注入路径。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`parentDigest` 语义无断言；2MB 上限边界无用例；异步 deps 返回 rejected promise 的行为无用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯只读、无 IPC/磁盘 | 已证实 | 全文仅 import `node:crypto`；无 `ipcMain`/`fs` |
| 双读 + 双边界身份复核 | 已证实 | `:124-132` |
| 摘要只覆盖 `document` JSON | 已证实 | `:88-90` |
| 冲突/expectedRevision 语义 | 已证实 | `:133-139`；测试 `:90-98` |
| 返回 `displayOnly`、无权限字段 | 已证实 | `:140-145`；测试 `:99-105` |
| 生产实例化点唯一（author-plan-ipc:282） | 已证实（检索） | 全树 `new CMainTrustedAuthorRevisionRead` 命中 2（生产 1、测试 1） |
| `parentDigest` 行为 | 未知 | 无代码分支使用、无断言 |
| 2MB 上限在真实 B1 文档下的表现 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `verified` 形状/摘要 | §3.1 | 78-94 | covered |
| 双读/身份边界 | §3.2 | 124-132 | covered |
| 冲突/expectedRevision | §3.2 | 133-139 | covered |
| 返回投影 | §3.2 | 140-145 | covered |
| 构造校验 | §3.3 | 98-104 | covered |
| `assertIdentity`/`sameIdentity` | §3.2 | 65-77 | covered |
| 模板/修订入参分支 | §3.2 | 116-122 | covered |
| `parentDigest`/2MB 上限 | §10 | 33,89 | unknown |
