---
path: apps/electron/src/main/lib/pi-model-runtime-options.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 337bde342d99f05bc7742391b388510b299e8ab3
sha256: 872e0cef4f645b43d538e7cddae5ee9af785a308452a488b1be9a99e58293eca
lines: 63
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-model-runtime-options.ts

## 1. 结论与边界

Pi ModelRuntime 的隔离配置（主进程运行时）：提供不读写全局 `~/.pi` 的凭据存储与运行时选项，凭据/模型缓存只存在于当前进程内存（文件头 `apps/electron/src/main/lib/pi-model-runtime-options.ts:4-8,51-54`）。背景：Pi 0.84 包只提供 ESM export，Electron main bundle 是 CJS，不能顶层导入其 `InMemoryCredentialStore`，故本地复刻同一契约（`:4-8`）。

边界：不管理渠道凭据来源（调用方传入）；不做网络；不含 Pi SDK 调用（在 `pi-model-registry`）。

## 2. 导出与关键符号

`export` 逐条核对：1 类 + 1 函数 = 2 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `IsolatedInMemoryCredentialStore` | 类（导出） | 9-49 | `implements CredentialStore` | 内存凭据存储 |
| `createIsolatedModelRuntimeOptions` | 函数（导出） | 55-63 | `(credentials: CredentialStore = new IsolatedInMemoryCredentialStore()) => CreateModelRuntimeOptions` | 隔离配置 |

类成员（内部）：`credentials` Map（`:10`）、`chains` per-provider Promise 链（`:11`）、`read`（`:13-15`）、`list`（`:17-19`）、`enqueue`（`:21-30`，私有串行化）、`modify`（`:32-42`）、`delete`（`:44-48`）。

## 3. 内部逻辑与关键流程

1. `enqueue`（`:21-30`）：per-providerId 串行链——`previous.catch(()=>{}).then(task)`（`:22-23`），尾节点入 Map 并在完成后自清（`:24-28`）；返回 operation 本体（含错误传播）。
2. `modify`（`:32-42`）：入队后取当前值→`fn(current)`→`next!==undefined` 才写入（`:37-39`）→返回 `next ?? current`（`:40`，fn 返回 undefined 时保持旧值）。
3. `delete`（`:44-48`）：入队后删键。
4. `createIsolatedModelRuntimeOptions`（`:55-63`）：固定 `{credentials, modelsPath: null, allowModelNetwork: false}`——禁全局模型缓存与模型网络。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：`adapters/pi-model-registry.ts:29`（import）；`:590,:653,:852`（无参默认内存存储）、`:759`（Codex OAuth 自定义存储 `createCodexRuntimeCredentialStore`）、`:892`（xAI OAuth 自定义存储）。`IsolatedInMemoryCredentialStore` 类名本身在生产代码无显式实例化（仅经默认参数与测试构造；全树检索证实）。

出向：`@earendil-works/pi-ai` 类型（`Credential`/`CredentialStore`，`:1`）、`@earendil-works/pi-coding-agent` 类型（`CreateModelRuntimeOptions`，`:2`）。无 fs/IPC/网络。

## 5. 数据 I/O、读写与副作用

- 写：仅内存 Map。不写盘/网络（依据：全文读无 fs/fetch/IPC）。
- 副作用：无日志、无全局状态。并发：`modify`/`delete` 经 Promise 链 per-provider 串行；`read`/`list` 直接读（不入队）。
- 幂等：`modify` fn 返回 undefined 不改存储（`:39-40`）；重复 delete 无害。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 链错误吞掉续跑 | 前序任务 reject | 23（`previous.catch(() => {})`） |
| 保持旧值 | fn 返回 undefined | 39-40 |
| 链自清 | 队尾完成且未被新任务替换 | 26-28 |

fn 抛错时 `modify` 的 Promise reject（经 `operation`），存储不变（推断：set 在 await 之后，`:38-39`）。无取消/恢复概念，依据：纯内存、无持久状态。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；凭据权威=调用方注入的存储内容；“隔离”目标是不触碰 `~/.pi` 全局（`:6-7` 注释），由 `modelsPath:null`+`allowModelNetwork:false` 落实。

## 8. 修改影响面

- `pi-model-registry.ts` 5 处调用（§4）：改返回形状影响 Pi SDK `ModelRuntime.create` 契约。
- `CredentialStore` 接口来自 pi-ai：SDK 升级改契约需同步 `read/list/modify/delete`。
- 需同步的测试：`pi-model-runtime-options.test.ts`（3 用例，§9）；`adapters/pi-model-registry.test.ts`（间接引用）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/pi-model-runtime-options.test.ts`（本批，3 用例，逐条见该手册）。核心断言：默认构造 `credentials instanceof IsolatedInMemoryCredentialStore`、`modelsPath` null、`allowModelNetwork` false（测试 `:8-10`）；同 provider 并发 modify 按提交顺序序列化（`:31-33`）。

未覆盖：`delete`/`list`、fn 抛错路径、链自清。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

间接证据：`adapters/pi-model-registry.test.ts` 引用本文件（非本批，未逐条读，标间接）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 成员行号 | 已证实 | `:9-63` 逐行读 |
| per-provider 串行化 | 已证实 | `:21-30` + 测试 `:23-33` |
| modify undefined 保持旧值 | 已证实 | `:39-40` |
| 隔离三字段 | 已证实 | `:58-62` |
| 类无显式生产实例化 | 已证实 | 全树检索（§4 范围） |
| fn 抛错时存储不变 | 推断 | `:37-39` 顺序 |
| SDK 端 CredentialStore 实际约束 | 未知 | 第三方包不在冻结树 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `IsolatedInMemoryCredentialStore` | §2-3 | 9-49 | covered |
| `createIsolatedModelRuntimeOptions` | §2-3 | 55-63 | covered |
| enqueue/modify/delete | §3, §6 | 21-48 | covered |
| 调用链 | §4 | - | covered |
| SDK 契约细节 | §10 | - | unknown（第三方） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
