---
path: packages/shared/src/constants/session-storage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d75a7e9323fa93e2bf2abb5534479dec9ae50fca
sha256: 2f593d687a0b20f7a064c3044e47e4e1aca84eac68efc628b9db5478c4319410
lines: 41
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/session-storage.ts

## 1. 结论与边界

会话存储「大载荷外部化」的**字段契约单一源**：消息顶层引用表字段名（`_proferBlobs`）、还原失败记录字段名（`_proferBlobsMissing`）、引用条目形状（`SessionBlobRef`）与安全读取函数（`readSessionBlobRefs`）。落盘时超限大字符串搬到 blob、行内留片段+引用表；渲染层按引用表还原（`packages/shared/src/constants/session-storage.ts:1-10`）。字段名共用同一常量是为了避免「同一规则散在多处、各自漏一处」的历史事故（`:8-9`）。

边界：本文件只有契约与读取，**不含**外部化/还原实现（在 `apps/electron/src/main/lib/agent-session-manager.ts`，见 §4）；不写盘。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SESSION_BLOB_REFS_FIELD` | const | 13 | `'_proferBlobs'` | 消息顶层引用表字段名 |
| `SESSION_BLOB_MISSING_FIELD` | const | 16 | `'_proferBlobsMissing'` | 还原失败时记录缺失引用（渲染层据此提示「原文不可用」） |
| `SessionBlobRef` | interface | 19-28 | `{path: string; hash: string; chars: number; bytes: number}` | `path` 相对消息根（如 `tool_use_result.content[0].text`）；`hash` 形如 `sha256:<hex>` |
| `readSessionBlobRefs` | function | 31-41 | `(message: unknown) => SessionBlobRef[]` | 无引用表/形状不对 → `[]` |

导出计数：const 2 + interface 1 + function 1。

## 3. 内部逻辑与关键流程

`readSessionBlobRefs`（`:31-41`）：`message` 非对象或 null → `[]`（`:32`）；取 `[SESSION_BLOB_REFS_FIELD]`，非数组 → `[]`（`:34`）；`filter` 类型守卫逐条校验 `path`/`hash` 为 string（`:35-40`）——注意 `chars`/`bytes` **不校验**，缺字段的条目仍通过守卫（形状与 `SessionBlobRef` 声明不完全一致，照实记录）。返回新数组。

## 4. 调用者与调用链

出向：无 import。入向（grep 全冻结树）：

- **主进程外部化实现**：`apps/electron/src/main/lib/agent-session-manager.ts:74-76`（三符号导入）、`:796-798`（别名 `BLOB_REFS_FIELD`/`BLOB_REFS_MISSING_FIELD`）、`:913`（收集大字符串时跳过两个字段自身）、`:925`（序列化时附引用表）、`:1016-1024`（`readSerializedBlobRefs` 复用 `readSessionBlobRefs`，注释明示避免两处实现）、`:1030-1039` 起 `resolveMessageBlobs` 还原：blob 缺失/哈希不匹配保留片段并记 `_proferBlobsMissing`、绝不抛。
- **渲染层消费**：`apps/electron/src/renderer/components/agent/SDKMessageRenderer.tsx:76,656`——`ExternalizedContentNotice` 用 `readSessionBlobRefs` 找出带引用的消息供「加载全文」（`:654-658`），经 `window.electronAPI.resolveSessionMessageBlobs` 取回。
- 间接测试（不在本批）：`apps/electron/src/renderer/lib/resolved-blob-messages.test.ts:2,63-95`（`readSessionBlobRefs` 各形状断言）、`apps/electron/src/main/lib/agent-session-payload-externalization.test.ts:26-27`（**以字符串字面量** `'_proferBlobs'`/`'_proferBlobsMissing'` 造夹具，未 import 常量）、`agent-session-manager.oversized-sanitize.test.ts:29`（同样字面量）、`agent-session-compaction.test.ts:124`（断言 `Array.isArray(parsed._proferBlobs)`）。

## 5. 数据 I/O、读写与副作用

无。`readSessionBlobRefs` 纯读入参、返回新数组；写盘（blob 内容寻址存储、JSONL 行）全在 `agent-session-manager.ts`（`writeBlobSync`、tmp+rename 等，非本文件）。

## 6. 分支、失败、取消与恢复

- 失败形态统一为 `[]`（`:32,:34`）与静默过滤（`:35-40`）；不抛异常。
- 「恢复」契约在字段层：`SESSION_BLOB_MISSING_FIELD` 记录缺失引用供 UI 提示（`:15-16`）；实际写入方是 `agent-session-manager.ts:1030` 的 `resolveMessageBlobs`（绝不抛设计）。

## 7. 权限与权威状态

无权限分支（无 sender/role 检查）。权威事实：字段名以本文件常量为准（`:8-9` 契约注释）；但存在**旁路**——外部测试用字面量造数（`agent-session-payload-externalization.test.ts:26-27`、`agent-session-manager.oversized-sanitize.test.ts:29`），改常量不会让这些测试红（照实记录）。

## 8. 修改影响面

- 改字段名字面量：必须同步 `agent-session-manager.ts:796-798`（经常量自动跟随）与所有以字面量造数的测试（§7 旁路），以及存量 JSONL 数据迁移（旧数据内字段名固化）。
- 改 `SessionBlobRef` 形状或 `readSessionBlobRefs` 守卫（如开始校验 `chars`/`bytes`）：影响 `SDKMessageRenderer.tsx:656` 的消息筛选与 `readSerializedBlobRefs`（`agent-session-manager.ts:1018-1024`，类型上以 `StoredBlobRef` 强转复用）。

## 9. 测试证据

本批**无**直接测试文件。间接证据（外部测试，静态读到的断言行）：

- `apps/electron/src/renderer/lib/resolved-blob-messages.test.ts`：`:67` 正常引用表读出；`:73-75` 非消息形状（`{type:'user'}`/`null`/`'string'`）→ `[]`；`:94-95` 字段为字符串/对象（非数组）→ `[]`。
- `apps/electron/src/main/lib/agent-session-payload-externalization.test.ts` 等 3 个主进程测试覆盖外部化/还原链路（夹具用字面量字段名）。

缺口：`readSessionBlobRefs` 对「条目缺 `chars`/`bytes`」的行为无断言（实现放行）；`SESSION_BLOB_MISSING_FIELD` 的渲染提示链路无直接断言（grep 未见渲染层读该字段的实现行，见 §10）。

**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 字段名/条目形状契约 | 已证实 | `:13-28` |
| `readSessionBlobRefs` 三段 fail-safe（非对象/非数组/逐条守卫） | 已证实 | `:31-41`；间接测试 `resolved-blob-messages.test.ts:73-75,94-95` |
| 守卫只校验 path/hash，chars/bytes 缺失也通过 | 已证实 | `:35-40` |
| 主进程 externalize/resolve 复用本文件常量与函数 | 已证实 | `agent-session-manager.ts:74-76,796-798,1016-1024` |
| 还原失败写 `_proferBlobsMissing` 且不抛 | 已证实 | `agent-session-manager.ts:1026-1031` 注释+签名 |
| 渲染层「原文不可用」提示是否读 `_proferBlobsMissing` | 未知 | grep `SESSION_BLOB_MISSING_FIELD`/`_proferBlobsMissing` 仅命中定义、session-manager 与测试字面量；渲染消费行未检出（检索范围=冻结树全文） |
| 外部测试以字面量造数，常量改动无测试守护 | 已证实 | `agent-session-payload-externalization.test.ts:26-27` 等 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两常量 | §2, §7 | 13-16 | covered |
| `SessionBlobRef` | §2 | 19-28 | covered |
| `readSessionBlobRefs` 三分支 | §3 | 31-41 | covered |
| chars/bytes 不校验边界 | §3, §9 | 35-40 | covered（无测试） |
| MISSING 字段渲染消费 | §10 | — | unknown |
