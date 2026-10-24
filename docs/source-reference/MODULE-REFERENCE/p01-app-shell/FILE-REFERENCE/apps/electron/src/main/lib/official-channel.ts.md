---
path: apps/electron/src/main/lib/official-channel.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 011ec6f69b5dcd407de57e398f81316696c4d99e
sha256: 5c2a25f56d96474f2e3a7b6ab54538aee02f7489653c5d9c8c04a6c115e4ba8b
lines: 6
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/official-channel.ts

## 1. 结论与边界

官方代管渠道判定（6 行）：服务端模型族虚拟渠道（`serverManaged === true`）或旧版 `newapi-` 前缀渠道均属官方代管。纯判定函数，不做任何渠道管理/网络/持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isOfficialManagedChannel` | 函数（导出） | 4-6 | `(channel: Pick<Channel,'id'\|'serverManaged'> \| { id: string; serverManaged?: boolean }) => boolean` | 双条件判定 |

导出合计 1。内部无符号。

## 3. 内部逻辑与关键流程

单表达式（`:5`）：`channel.serverManaged === true || channel.id.startsWith('newapi-')`。严格等 true（truthy 不够）；`id` 前缀匹配 `newapi-`（兼容旧版渠道命名，注释 `:3`）。

## 4. 调用者与调用链

入向（全冻结树检索 `isOfficialManagedChannel`，8 个生产文件）：
- `lib/conversation-title-service.ts:18` → `conversation-title-service.ts:70`（标题生成渠道过滤）。
- `lib/lightweight-completion.ts:20` → `lightweight-completion.ts:72`。
- `lib/agent-runtime-credentials.ts:6` → `agent-runtime-credentials.ts:32`（`isOfficialChannel` 布尔量）。
- `lib/channel-manager.ts:36` → `channel-manager.ts:214`（用户可见渠道列表过滤）、`channel-manager.ts:416`（服务端已删清理判断）、`channel-manager.ts:568`、`channel-manager.ts:668`（throw `'官方同步渠道不可删除，请在 New API 后台管理'`）。
- `lib/adapters/pi-model-registry.ts:28` → `pi-model-registry.ts:404`、`pi-model-registry.ts:409`。
- `lib/agent-orchestrator.ts:100` → `agent-orchestrator.ts:463`（与 `isCommercialBuild()/isCommercialMode()` 联合门禁）。
- `lib/cdut/cdut-ai-class-manager.ts:64` → `cdut-ai-class-manager.ts:551`（同款联合门禁）。
- `lib/retrospective-service.ts:24` → `retrospective-service.ts:248`（同款联合门禁）。
- 测试：无直接测试引用（全树检索无命中）。
- 出向：仅类型 `Channel`（`@profer/shared` `:1`）。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：`:4-6` 纯函数，无 I/O/全局状态）。

## 6. 分支、失败、取消与恢复

两分支即判定表达式本身（`:5`）；不 throw、无失败路径（不适用，依据：全文无 throw/异步）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。判定本身是**权威标记的语义闸**：`serverManaged` 权威由服务端下发（消费方 `channel-manager.ts` 等维护），本文件只读字段做判定；FACT-CHECKING-NOTES 口径下不把调用方的删除守卫（`channel-manager.ts:668` 的 throw）写成本文件的权限验证。

## 8. 修改影响面

改判定语义会影响 8 个消费方的渠道过滤/删除守禁/模型注册/商业门禁（§4 行号）；尤其 `channel-manager.ts` 的用户可见列表与删除保护、`agent-orchestrator.ts:463`/`cdut-ai-class-manager.ts:551`/`retrospective-service.ts:248` 的商业构建门禁。新增官方渠道命名空间需同步此判定。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `isOfficialManagedChannel` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：无断言级命中。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 判定表达式/严格等 true/前缀语义 | 已证实 | `:1-6` 全文逐行 |
| 8 个调用方与各自用途行号 | 已证实 | 全树检索（§4） |
| 旧版 `newapi-*` 渠道命名的历史来源 | 推断 | 注释 `:3` 声明"旧版"，未核服务端实现 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isOfficialManagedChannel` | §2/§3 | 4-6 | covered |
| 调用者矩阵 | §4/§8 | - | covered |
| 测试缺口（无直接测试） | §9 | - | covered |
