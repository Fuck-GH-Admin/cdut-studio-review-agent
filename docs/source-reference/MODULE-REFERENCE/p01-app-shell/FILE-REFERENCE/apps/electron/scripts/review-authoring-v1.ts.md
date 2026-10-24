---
path: apps/electron/scripts/review-authoring-v1.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2716cda3c81b6c7221b72eeb71634492614b014a
sha256: bb91d128fa46c0b96d7fa484eefe42e319cc8158056ce2158972fb67f36df825
lines: 82
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/review-authoring-v1.ts

## 1. 结论与边界

D1 作者态工作区的本地 JSON 操作 CLI（bun 直跑脚本），6 个子命令：`validate`/`candidate`/`diff`（纯读/纯编译）与 `candidate-save`/`save`/`read`（落盘/读盘）（`scripts/review-authoring-v1.ts:4-9`）。文件头自述边界：不发布审核模板、候选输出不能直接用作校规、`actor` 仅为审计标签而非身份认证（`scripts/review-authoring-v1.ts:2-11`）。

边界：不实现 GUI、不发布模板、不授予发布资格；候选资格（candidate-held）由 `template-store` 服务端控制记录强制（`src/main/lib/review/template-store.ts:368-374`），本脚本不提供任何解锁入口。

## 2. 导出与关键符号

导出 0：CLI 脚本无 `export` 声明（逐条核对全文 `scripts/review-authoring-v1.ts:13-82`）。关键内部符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `load` | 常量（内部） | 24 | `(path: string): ReviewAuthoringWorkspaceV1` | `readFileSync(resolve(path),'utf8')` + `JSON.parse` 后类型断言 |
| `print` | 常量（内部） | 25 | `(value: unknown): void` | `JSON.stringify(value, null, 2)` 打 stdout |
| `main` | 函数（内部） | 27-76 | `(): void` | argv 解析与六命令分派 |

## 3. 内部逻辑与关键流程

按 `main` 真实执行顺序（`scripts/review-authoring-v1.ts:27-76`）：

1. 取 `process.argv.slice(2)` 为 `[operation, first, second, third]`；`first` 缺失即抛「缺少作者态工作区或标识」（`:28-29`）。
2. `read`（`:30-36`）：必须显式 `PROFER_CONFIG_DIR`（`:31`）否则抛错；`getReviewAuthoringRevisionV1(first, second ? Number(second) : undefined)`（`:32`）；无记录抛「作者态修订不存在」（`:33`）；成功 print 后 return（`:34-35`）。
3. 其余命令先 `load(first)` 读工作区 JSON（`:37`）。
4. `validate`（`:38-43`）：`validateReviewAuthoringV1(workspace)` 得 issues；输出 `{ok: issues.length === 0, workspaceId, revision, issues}`；有 issue 时 `process.exitCode = 1`（`:41`）。
5. `candidate`（`:44-48`）：必须给 `templateId` 与版本（`:45`）；`compileReviewAuthoringCandidateV1(workspace, second, Number(third))`（`:46`），输出 `{template, manifest, preview}`。
6. `diff`（`:49-53`）：`diffReviewAuthoringRevisionsV1(workspace, load(second))`（`:51`），输出 `changedModules/changedTemplates/changedSources/changedBindings/changedSharedModuleLocks`。
7. `candidate-save`（`:54-66`）：必须 `PROFER_CONFIG_DIR`（`:55`）与 templateId/版本（`:56`）；先编译（`:57`），再 `verifyReviewAuthoringManifestV1(candidate.template, candidate.manifest, workspace)`，有 issue 抛「候选映射不一致：…」（`:58-59`）；`getTemplate(candidate.template.templateId, candidate.template.version)` 已存在则抛「候选目标版本已存在，不能覆盖或改变发布资格」（`:60-62`）；`saveAuthoringCandidateDraft(candidate.template)`（`:63`）；输出 `{saved: true, templateId, version, publicationEligible: false}`（`:64`）。
8. `save`（`:68-74`）：必须 `PROFER_CONFIG_DIR`（`:69`）；`second` 须匹配 `/^\d+$/` 且 `third` 非空（`:70`）；`saveReviewAuthoringRevisionV1(workspace, Number(second), third)`（`:71`）；输出 `{saved, workspaceId, revision, digest, parentDigest ?? null}`（`:72`）。
9. 其它命令抛「不支持的 D1 作者态命令：…」（`:75`）。

## 4. 调用者与调用链

入向（全冻结树检索 `scripts/review-authoring-v1`，命中仅测试 spawn 与文档示例）：
- `src/main/lib/review/review-authoring-v1.test.ts:45-53`：`Bun.spawnSync([process.execPath, cli, ...])` 跑 `validate`+`candidate`；`:63-71` 跑 `candidate-save`（`:77-80` 二次保存拒绝用例）。
- `docs/design/review-agent/18-d1-authoring-contract-and-runtime-mapping-v1.md:52-66`（六命令用法示例）、`:97`（candidate-save 语义）——文档示例，不是执行调用者。

出向（`scripts/review-authoring-v1.ts:13-22` 导入）：
- `@profer/shared`：类型 `ReviewAuthoringWorkspaceV1`（`:15`）。
- `src/main/lib/review/review-authoring-v1.ts:56`（`validateReviewAuthoringV1`）、`:204-285`（`compileReviewAuthoringCandidateV1`）、`:294`（`verifyReviewAuthoringManifestV1`）。
- `src/main/lib/review/template-store.ts:253`（`getTemplate`）、`:372-374`（`saveAuthoringCandidateDraft`）。
- `src/main/lib/review/review-authoring-store-v1.ts:41-65`（`getReviewAuthoringRevisionV1`）、`:71-101`（`saveReviewAuthoringRevisionV1`）、`:104-128`（`diffReviewAuthoringRevisionsV1`）。

## 5. 数据 I/O、读写与副作用

- 输入：`first`/`second` 指向的 JSON 文件，`readFileSync(resolve(path), 'utf8')` 读入后类型断言（`scripts/review-authoring-v1.ts:24`；运行时形状校验由 `validateReviewAuthoringV1` 承担）。
- 输出：stdout 纯 JSON（`:25`）；错误经 `console.error` 输出（`:80`）。
- 磁盘写：`candidate-save` 经 `saveAuthoringCandidateDraft` 写模板草稿与 `candidate-held` 资格记录（`src/main/lib/review/template-store.ts:365-374`）；`save` 经 `saveReviewAuthoringRevisionV1` 追加写 `{configDir}/review-authoring-v1/<workspaceId>/revisions/<n>.json`（`src/main/lib/review/review-authoring-store-v1.ts:23-27`；`wx` 不覆盖 + `edit.lock`，`:71-101`）。
- 无网络、无遥测。写入根由 `PROFER_CONFIG_DIR` 决定（`src/main/lib/config-paths.ts:58`）。

## 6. 分支、失败、取消与恢复

- 顶层 `try { main() } catch`（`:78-82`）：打印 `[D1 作者态] <message>` 并置 `process.exitCode = 1`，不吞错误。
- 本文件抛错分支：`:29`（缺参）、`:31`/`:55`/`:69`（缺 `PROFER_CONFIG_DIR`）、`:33`（修订不存在）、`:45`/`:56`/`:70`（参数不全或 `expectedRevision` 非纯数字）、`:61`（目标版本已存在）、`:75`（未知命令）。
- 下游 fail-closed 抛错（经顶层捕获）：`AUTHORING_INVALID`/`UNMAPPABLE_ADVANCED`/`D1_UNMAPPABLE_EXECUTION_GATE`/`D3_FROZEN_LOCK_INVALID`/`UNVERIFIED_AUTHORITY`/`RULE_TRUTH_MISMATCH`/`TEMPLATE_INVALID`（`src/main/lib/review/review-authoring-v1.ts:210-249`）；`AUTHORING_REVISION_CONFLICT`/`AUTHORING_HISTORY_BROKEN`（`src/main/lib/review/review-authoring-store-v1.ts:51-60`、`:86`）。
- 失败后状态：`candidate-save` 先 compile+verify 后保存，失败不落盘（`:57-63`）；`save` 以 `wx` 原子追加修订、锁在 `finally` 释放，冲突/崩溃不产生半条修订（`src/main/lib/review/review-authoring-store-v1.ts:94-100`）。一次性 CLI，无取消/重试机制；重跑依赖命令级幂等（重复 `candidate-save` 被 `:60-62` 拒绝）。

## 7. 权限与权威状态

- 无身份认证：`actor` 仅审计标签（`scripts/review-authoring-v1.ts:11`；`:70` 只要求非空），存储侧记为 `authorId`（`src/main/lib/review/review-authoring-store-v1.ts:77`）。
- 写/读盘命令强制隔离根：`read`/`candidate-save`/`save` 必须显式 `PROFER_CONFIG_DIR`（`:31`、`:55`、`:69`）——沙箱边界，不是权限校验。
- 权威状态：候选永不可发布，输出硬编码 `publicationEligible: false`（`:64`）；发布资格由服务层控制记录决定，普通 `saveDraft` 无权把 `candidate-held` 转为可发布（`src/main/lib/review/template-store.ts:364-367`）。

## 8. 修改影响面

- 调用方：`src/main/lib/review/review-authoring-v1.test.ts:43-85`（断言输出字段 `ok`/`manifest.mapping`/`template.status`/`manifest.publicationAllowed`/`saved`/`publicationEligible` 与控制记录 `classification`）；文档 `docs/design/review-agent/18-d1-authoring-contract-and-runtime-mapping-v1.md:52-66`、`:97` 的用法示例需同步。
- stdout JSON 字段是对外契约（测试解析 `result.stdout`，`src/main/lib/review/review-authoring-v1.test.ts:52`、`:72`）；`compileReviewAuthoringCandidateV1` 返回形状 `{template, manifest, preview}`（`src/main/lib/review/review-authoring-v1.ts:284`）变化会破坏本脚本输出。
- 候选保存幂等语义变化需同步二次保存拒绝断言（`src/main/lib/review/review-authoring-v1.test.ts:77-81`）。

## 9. 测试证据

针对本 CLI 的直接测试（`src/main/lib/review/review-authoring-v1.test.ts`，`Bun.spawnSync` 真实起进程并隔离 `PROFER_CONFIG_DIR`）：
- `:43-59`：`validate` 断言 `ok === true`（`:54`）；`candidate` 断言 `manifest.mapping` 长度 1（`:56`）、`template.status === 'draft'`（`:57`）、`manifest.publicationAllowed === false`（`:58`）。
- `:61-85`：`candidate-save` 断言 `exitCode === 0`（`:70`）、`saved === true` 且 `publicationEligible === false`（`:73-74`）、控制记录 `review-template-controls/text-review/1.json` 的 `classification === 'candidate-held'`（`:75-76`）；同 ID/版本二次保存 `exitCode !== 0`（`:77-81`）。

未覆盖：`save`/`read`/`diff` 无 CLI 级 spawn 断言（检索范围：全冻结树 `scripts/review-authoring-v1` 命中仅 `src/main/lib/review/review-authoring-v1.test.ts:45`、`:63` 与 `docs/design/review-agent/18-d1-authoring-contract-and-runtime-mapping-v1.md`）；`src/main/lib/review/` 无 `review-authoring-store-v1.test.ts`（目录检索确认）。间接证据：同测试文件另有多例直接调用库函数（如 `:87-94`），覆盖库而非本 CLI。`NOT_RUN`：本轮未执行任何测试/typecheck/运行，全部为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 六命令分派、参数校验与错误文案 | 已证实 | `scripts/review-authoring-v1.ts:27-76` |
| `candidate-save` 先 verify 后保存、拒绝覆盖已存在版本 | 已证实 | `scripts/review-authoring-v1.ts:57-64` |
| 修订存储为追加式不可变链（wx+lock、parentDigest） | 已证实 | `src/main/lib/review/review-authoring-store-v1.ts:71-101` |
| CLI spawn 测试断言（validate/candidate/candidate-save） | 已证实 | `src/main/lib/review/review-authoring-v1.test.ts:54-81` |
| 非法 JSON 由 `load` 抛 `SyntaxError` 走顶层捕获输出 | 推断 | `scripts/review-authoring-v1.ts:24`、`:78-82`（该路径无断言） |
| `read` 的典型消费场景（d1-text-preview 修订 1） | 推断 | `docs/design/review-agent/18-d1-authoring-contract-and-runtime-mapping-v1.md:63` |
| `save`/`read`/`diff` 的实际 CLI 行为 | 未知 | 无 CLI 级测试，见 §9 检索范围 |
| bun 之外运行时（node 等）行为 | 未知 | 测试仅经 `process.execPath`（bun）spawn（`src/main/lib/review/review-authoring-v1.test.ts:48`） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `load`/`print` | §2、§5 | 24-25 | covered |
| argv 解析/缺参 | §3.1 | 28-29 | covered |
| `read`（env 门/无记录抛错） | §3.2 | 30-36 | covered |
| `validate`（issues→exitCode） | §3.3 | 38-43 | covered |
| `candidate` | §3.4 | 44-48 | covered |
| `diff` | §3.5 | 49-53 | covered |
| `candidate-save`（verify/拒覆盖/保存） | §3.6、§6 | 54-66 | covered |
| `save`（expectedRevision 正则/CAS） | §3.7、§6 | 68-74 | covered |
| 未知命令/顶层 catch | §3.8、§6 | 75、78-82 | covered |
| 下游错误码族 | §6 | — | covered（引库行号） |
| `save`/`read`/`diff` 运行时行为 | §9、§10 | — | unknown（无 CLI 测试，NOT_RUN） |
