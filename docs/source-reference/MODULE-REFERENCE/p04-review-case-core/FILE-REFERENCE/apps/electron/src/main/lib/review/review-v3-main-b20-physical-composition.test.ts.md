---
path: apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a929b36e6b64313eaf2bdec63179aa93e502f74d
sha256: 5807907191250fe3bd3720220a64979f3f8b965ab1bd7b768832fc931ce4b93b
lines: 367
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

用**真实**组件（手写 ZIP 字节 + CRC、B2 保险库/台账、B1 保存/冻结、真实注册的 Electron IPC handler）验证 C-R10 物理组合：原生 OS 归档重选、两次 Main 读取、来源 provenance、epoch/撤销/漂移拒绝、私钥绑定、以及 `CMainB20CurrentRegistry` 作为唯一 B20 运行源；不 mock B20 数据、不含学校发布者。

## 2. 用例清单

共 8 个 `test(`（`review-v3-main-b20-physical-composition.test.ts:204-367`，单一 `describe`）。

夹具（`:38-202`）：`mkdtempSync(tmpdir,'c-r10-real-physical-b20-')` + `PROFER_CONFIG_DIR`；手写 `zip()`（`:44-67`，含 CRC32 与中心目录）；fake 主窗口/`sender{id:91}`/`frame{processId:777,routingId:3}`（`:69-77`）；`setup()`（`:88-202`）：写真实 `original<N>.zip`（两个 txt）、`ReviewB2StagingService`+`ReviewB2SourceVersionAdapter`+`ReviewB2ArchiveVault`+`ReviewB2InputLedger`、`vault.saveAndStage` 物理导入（`physicalKey='c-main-real-private-original-<N>'`）、台账 `decide` 把 `needs-user-confirmation` 条目批为 `accepted/supporting/subject-one`、`parser.parse` 逐候选、`saveB1AuthorRevision`+`freezeB1Candidate` 生成 `pinned`、构造 B19 `selections`、`CMainNativeArchiveRegistry`（`pickZipPath` 注入当前路径）、`entry:CMainB20PhysicalSources` 全套回调。

| # | 用例（行） | 设置/动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | real saved and frozen B1, actual ZIP CRC + accepted ledger, native physical repick, two C Main reads（`:205`） | 安装 → repick → invoke 读取 | repick `toMatchObject({status:'picked-for-candidate-only',publicationAllowed:false,businessWriteAllowed:false})`；读取 `toMatchObject({templateId,caseCandidateId,state:'candidate-held',displayOnly:true,publicationAllowed:false,schoolPolicyVerified:false,businessWriteAllowed:false})`；`reads()===3`；`candidateProvenance.bindings` 长度 2 且全 `linked-candidate`；JSON 字符串不含私钥/`schoolIssuer`/`principalId`/`senderId`/`frameId`；无 `physicalArchiveKey`/`schoolIssuer` 属性 |
| 2 | cold Main has no native picked key and cannot inherit B Vault even with valid author（`:230`） | 不 repick 直接读 | `CURRENT_NATIVE_REPICK_REQUIRED` |
| 3 | same filename and SHA but different physical original inode is not current provenance（`:237`） | 读一次后用同内容副本 rename 覆盖 | `PHYSICAL_ORIGINAL_REPLACED` |
| 4 | epoch rotation, current principal revoke and actual saved author version drift deny（`:249`） | `rotate()` 换 authorityEpoch；另一组改作者修订后读；`expire()` | `/MAIN_CONTEXT_REVOKED|CURRENT_NATIVE_REPICK_REQUIRED/`；`B_R20_AUTHOR_REVISION_CONFLICT`；`/MAIN_IDENTITY_NOT_INSTALLED|C_REAL_MAIN_IDENTITY_REVOKED/` |
| 5 | private B original digest mismatch rejects OS key association（`:271`） | `pickForBVault` 用假 key；未 pick 时 `resolveNativeArchiveKey` | `B_VAULT_PHYSICAL_ORIGIN_KEY_INVALID`；`CURRENT_NATIVE_REPICK_REQUIRED` |
| 6 | OS picker refuses Renderer physical paths/unknown archive and never opens arbitrary file（`:279`） | repick 带 `path:'/tmp/attacker.zip'`；未知 archiveId | `B20_REPICK_RENDERER_CREDENTIAL_OR_PATH_CLAIM`；`ARCHIVE_NOT_IN_CURRENT_C_MAIN_SELECTIONS`；随后读取 `CURRENT_NATIVE_REPICK_REQUIRED` |
| 7 | real Main-local current candidate registration+native repick is the single B20 runtime source（`:292`） | 构造 `host` + `new CMainB20CurrentRegistry(host,f.entry.bSources)`；伪造 selection 注册；正式注册；重复注册；`install()` 后 repick+读取；`revoke` | 伪造 selection → `B19_SELECTION_NOT_IN_FROZEN_AUTHOR`；重复注册 → `REGISTRATION_EXISTS_REVOKE_FIRST`；repick `status:'picked-for-candidate-only'`；`bindings` 全 `linked-candidate`；`registry.revoke` 后读取 `MAIN_IDENTITY_NOT_INSTALLED` |
| 8 | monotonic local numeric epoch is independent of string C epoch and revocation closed（`:346`） | `new CMainB20NumericEpoch()` 直接驱动 | `create` 返回 `{senderId:91,frameId:3,authorityEpoch:1,ownerGeneration:9}`；同 scope 复用 epoch 1；换字符串 epoch → 2；`invalidate()` 后 → 3；`close()` 后 `NUMERIC_EPOCH_CLOSED` |

## 3. 真实断言（抽样）

- 用例 1：`expect(value).toMatchObject({...})`（`:215-219`）；`expect(f.reads()).toBe(3)`（`:220`）；`expect(source.bindings).toHaveLength(2)`、`expect(source.bindings.every(x=>x.state==='linked-candidate')).toBe(true)`（`:221-223`）；密钥脱敏循环 `expect(JSON.stringify(value)).not.toContain('c-main-real-private-original-'+...)`（`:224-227`）；`expect(value).not.toHaveProperty('physicalArchiveKey')`、`not.toHaveProperty('schoolIssuer')`（`:228-229`）。
- 用例 2/5/6：`rejects.toThrow('CURRENT_NATIVE_REPICK_REQUIRED')`（`:233,277,289`）；`toThrow('B_VAULT_PHYSICAL_ORIGIN_KEY_INVALID')`（`:274-275`）；`rejects.toThrow('B20_REPICK_RENDERER_CREDENTIAL_OR_PATH_CLAIM')`（`:283-284`）。
- 用例 3：`rejects.toThrow('PHYSICAL_ORIGINAL_REPLACED')`（`:245`）。
- 用例 4：`rejects.toThrow(/MAIN_CONTEXT_REVOKED|CURRENT_NATIVE_REPICK_REQUIRED/)`（`:254-255`）；`rejects.toThrow('B_R20_AUTHOR_REVISION_CONFLICT')`（`:265`）；`rejects.toThrow(/MAIN_IDENTITY_NOT_INSTALLED|C_REAL_MAIN_IDENTITY_REVOKED/)`（`:268`）。
- 用例 7：`expect(()=>registry.registerFromTrustedMain({...forged-source...})).toThrow('B19_SELECTION_NOT_IN_FROZEN_AUTHOR')`（`:322-327`）；`toThrow('REGISTRATION_EXISTS_REVOKE_FIRST')`（`:333-335`）；`rejects.toThrow('MAIN_IDENTITY_NOT_INSTALLED')`（`:341-342`）。
- 用例 8：`expect(first).toMatchObject({senderId:91,frameId:3,authorityEpoch:1,ownerGeneration:9})`（`:357-358`）；`expect(next.authorityEpoch).toBe(2)`（`:361`）；`expect(...).toBe(3)`（`:363`）；`expect(()=>epoch.create(...)).toThrow('NUMERIC_EPOCH_CLOSED')`（`:365-366`）。

夹具/mock 边界：Electron `ipcMain` 用测试钩子 Map（`:69-77`），主窗口 fake；B2/B1/ZIP/台账均为**真实实现**（磁盘 IO 在临时目录）；`pickZipPath` 注入返回路径（不是真实对话框）。

## 4. 未覆盖与脆弱点

- 未覆盖：`EPOCH_EXHAUSTED`、`MAIN_SCOPE_CHANGED_DURING_OS_PICKER`、`NUMERIC_SCOPE_ROTATED`、`FOREIGN_OWNER_OR_AUTHOR_SOURCE`、`C_SOURCE_REGISTRY_NOT_INSTALLED`、`NATIVE_PICKER_SCOPE_DRIFT`、`MAIN_SCOPE_CHANGED_AFTER_PHYSICAL_READ`、`REAL_B1_B2_AND_C_MAIN_AUTHORITY_REQUIRED` 形状分支。
- 脆弱点：手写 ZIP 构造器（`:44-67`）是自实现字节格式，依赖 `ReviewB2ArchiveVault` 的解析容忍度；`renameSync` 覆盖 inode 的语义依赖文件系统行为；`reads()===3` 依赖实现调用次数（脆弱于重构）；`Date.now()`/serial 夹具依赖执行顺序。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个用例、真实组件组合 | 已证实 | `:204-367`；setup 用真实 vault/ledger/B1 store |
| 密钥/学校字段不外泄被断言 | 已证实 | `:224-229` |
| 同 SHA 换 inode 被拒 | 已证实 | `:237-248` |
| epoch 单调/关闭语义 | 已证实 | `:346-367` |
| 注册表为唯一 B20 源 | 已证实（断言层） | `:292-344` |
| 真实 OS 对话框行为 | 未知 | `pickZipPath` 被注入 |
| 读中漂移分支 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| repick+双读+脱敏 | 1 | 205-229 | covered |
| 冷启动无 key | 2 | 230-236 | covered |
| inode 替换 | 3 | 237-248 | covered |
| epoch/撤销/作者漂移 | 4 | 249-270 | covered |
| 私钥绑定 | 5 | 271-278 | covered |
| OS 选择器拒路径 | 6 | 279-291 | covered |
| 注册表单一源 | 7 | 292-344 | covered |
| 数字 epoch | 8 | 346-367 | covered |
| 读中漂移/形状分支 | 无 | — | unknown |
