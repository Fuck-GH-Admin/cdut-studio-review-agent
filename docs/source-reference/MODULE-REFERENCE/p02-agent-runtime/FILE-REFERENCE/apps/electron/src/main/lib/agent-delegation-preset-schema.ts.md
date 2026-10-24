---
path: apps/electron/src/main/lib/agent-delegation-preset-schema.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6ac8c7943d46807ae218fbabd69de51e3ff0fd7
sha256: 39feeddb2ae032cbf378bf6c06e878cfe3226da49e28a735464529ecf74fcf8d
lines: 26
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-delegation-preset-schema.ts

## 1. 结论与边界

为协作委派工具的 `presetReference` 参数构建两套等价 schema（Zod 版给 Claude 工具 schema，TypeBox 版给 Pi `defineTool`）。纯 schema 工厂，无运行时逻辑、无 I/O。

不做的事：不做预设解析/校验（`apps/electron/src/main/lib/agent-delegation-preset.ts` 的 `resolveDelegationPreset` 负责运行时校验）；不消费 schema。

## 2. 导出与关键符号

导出 2 条（`export` 逐条核 :3/:13）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `buildZodDelegationPresetReferenceSchema` | function | `:3-11` | `(z: ZodModule['z']) => ZodOptional<ZodObject>` | 字段：`presetId`（trim+min(1)，:6）、`presetScope`（enum `builtin-meta\|user-global\|workspace`，:7）、`workspaceSlug?`（trim+min(1)，:8）、`presetVersion?`（trim+min(1)，:9）；整体 `.optional()` 带 describe（:10） |
| `buildTypeBoxDelegationPresetReferenceSchema` | function | `:13-26` | `(Type) => TOptional<TObject>` | 同四字段（minLength:1），`presetScope` 为三 Literal 联合（:18-22）；describe（:25） |

内部符号：`ZodModule` 类型别名（:1，`typeof import('zod')`）。

## 3. 内部逻辑与关键流程

无分支/无循环；两函数各自返回可选对象 schema。字段集一致（`presetId`/`presetScope`/`workspaceSlug`/`presetVersion`），差异仅校验 DSL：Zod 版 `trim().min(1)` 会剔除纯空白，TypeBox 版 `minLength: 1` 接受 `" "`（本文件内行为差异，见 §10）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- TypeBox 构建器：`apps/electron/src/main/lib/agent-collaboration-tools.ts:48` 导入，`:1004`（`delegateItemType`）与 `:1034`（`delegate_agent` 参数）调用——均在活的 `buildPiCollaborationTools` 工具 schema 内。
- Zod 构建器：`agent-collaboration-tools.ts:49` 导入，`:937/:947` 调用——**均位于 `buildCollaborationSchemas`（:928-982）内，而该函数全冻结树无调用者**（见 collaboration-tools 手册 §10）；即 Zod 版生产路径当前不可达。
- 直接测试：`apps/electron/src/main/lib/agent-delegation-preset-schema.test.ts:5-7`（本批内）。

出向：仅类型 `typeof import('zod')`（:1）与 `typeof import('typebox').Type`（:14）；无模块调用。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（依据：仅类型导入；函数体只构造 schema 对象）。

## 6. 分支、失败、取消与恢复

无分支、无 throw（依据：全文无 `if`/`throw`）。非法输入的拒绝发生在消费方校验时（Zod `safeParse` / TypeBox 校验器），不在本文件。本文件不适用「失败后状态/恢复」：依据纯构造器无状态。

## 7. 权限与权威状态

无权限分支（依据：无 sender/role/权限字段）。`presetScope` 三值枚举是引用作用域的形状定义点；作用域语义与越界拒绝在 `agent-delegation-preset.ts:36-50`（运行时权威）。

## 8. 修改影响面

- 改字段集需同步两构建器、`agent-collaboration-tools.ts` 工具参数（:931-938/:998-1005）与 `agent-delegation-preset-schema.test.ts`（本批内，parity 用例）。
- `PresetReference` 类型（`@profer/shared`）与 `resolveDelegationPreset` 的校验字段是同一契约；schema 放宽（如去掉 workspaceSlug 必填约束）会被运行时 :36-38 再拦截，收窄则直接改变工具可表达输入。
- Zod 版当前不可达（§4），修改它对生产无直接影响，但其单测仍会失败。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-delegation-preset-schema.test.ts`（本批内，3 用例）。
- 「Claude schema accepts all supported stable reference fields」（:10）：`safeParse` 全字段对象 `.success === true`（:12-17）。
- 「rejects blank ID and unknown scope」（:20）：`presetId:' '`（trim 后空）与 `presetScope:'unknown'` 均 `.success === false`（:22-23）。
- 「Pi schema exposes the same fields and scope enum」（:26）：断言 `schema.properties` 含 4 字段名（:30-33）——**仅查属性存在，未断言 TypeBox 侧 minLength/枚举值，也未查两端 parity 的枚举内容**。
- 未覆盖：TypeBox 版 `minLength` 行为（`" "` 可通过）、`presetVersion` 校验、`.optional()` 语义。mock/边界：直接实例化 zod/typebox 真库。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；两端字段集一致 | 已证实 | `:3-26`；测试 :30-33 |
| Zod 版 trim+min(1) 拒绝纯空白 ID；TypeBox 版 minLength:1 不 trim | 已证实 | `:4/:6` vs `:17` |
| Zod 构建器生产调用点仅在无调用者的 `buildCollaborationSchemas` 内 | 已证实 | `agent-collaboration-tools.ts:928-982`（无调用者，全冻结树 `*.ts` 检索） |
| TypeBox 版被活工具 schema 消费 | 已证实 | `agent-collaboration-tools.ts:1004/:1034` |
| 两端 describe 文案一致（'可选目标预设；不传则继承父会话预设'） | 已证实 | `:10` vs `:25` |
| TypeBox 校验器在 SDK 运行时是否强制 minLength | 未知 | 未读 SDK 校验实现 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildZodDelegationPresetReferenceSchema` 字段/校验 | §2/§3 | :3-11 | covered |
| `buildTypeBoxDelegationPresetReferenceSchema` 字段/校验 | §2/§3 | :13-26 | covered |
| trim/minLength 行为差异 | §3/§10 | :4-6/:17 | covered |
| Zod 版生产不可达 | §4/§10 | collaboration-tools:928-982 | covered |
| TypeBox 强制语义 | §10 | — | unknown |
