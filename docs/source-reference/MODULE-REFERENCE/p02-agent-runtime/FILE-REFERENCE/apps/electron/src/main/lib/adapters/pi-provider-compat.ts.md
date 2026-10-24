---
path: apps/electron/src/main/lib/adapters/pi-provider-compat.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a35ba54bb7fb6f80e20ce185a7f0030b3e6388fc
sha256: 0234d2fc7032094f243d1033b385261230664a6d081619b53ea9bcb7e8fd7dbf
lines: 9
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-provider-compat.ts

## 1. 结论与边界

Pi provider 角色兼容判定（运行时纯函数，9 行）：豆包 OpenAI 兼容接口只接受 system/user/assistant/tool 角色，Pi 默认把系统提示词编码为 developer，故需显式降级为 system（`apps/electron/src/main/lib/adapters/pi-provider-compat.ts:3-6` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `supportsPiDeveloperRole` | 导出函数 | 7-9 | `(provider: ProviderType): boolean` | `provider !== 'doubao'` |

`ProviderType` 来自 `@profer/shared`（`:1`，仅类型导入）。

## 3. 内部逻辑

单表达式 `provider !== 'doubao'`（`:8`）。无分支/无状态。

## 4. 调用者与调用链

入向：冻结树 `apps/**`+`packages/**` 检索 `supportsPiDeveloperRole` **除本文件定义外零命中**（消费普查见手册 §10；与 `pi-model-registry.compilePiReasoningCapabilities` 的 `compat.supportsDeveloperRole: false`（zai 系，`pi-model-registry.ts:188/:198`）是不同机制的并行实现——照实记录）。出向：`@profer/shared`（类型）。

## 5. 数据 I/O 与副作用

无（纯函数）。

## 6. 分支、失败与恢复

无 throw；不适用。

## 7. 权限与权威状态

无权限分支；角色兼容权威=豆包端点行为（注释自述，未实测）。

## 8. 修改影响面

改判定影响调用方（当前零调用方）的 developer 角色降级决策；与 zai 系 `supportsDeveloperRole` 兼容位并行存在。

## 9. 测试证据

无专属测试（冻结树 glob `**/pi-provider-compat*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单函数单表达式 | 已证实 | `:1-9` |
| 零消费者（定义外） | 已证实（静态） | `apps/**`+`packages/**` 全扩展名检索 |
| 豆包只收 4 角色 | 推断 | `:3-6` 注释自述（端点未实测） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| supportsPiDeveloperRole | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
