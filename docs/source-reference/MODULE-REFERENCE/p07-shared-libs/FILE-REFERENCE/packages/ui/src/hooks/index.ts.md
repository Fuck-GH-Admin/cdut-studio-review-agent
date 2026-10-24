---
path: packages/ui/src/hooks/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 52e76eda6b1b4f091f4c251421b23a727779bb82
sha256: eb3d00596f19c934a66f0d773fd4b1cb463044159e83245c82b64802f2146a23
lines: 5
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/hooks/index.ts

## 1. 结论与边界

共享 Hooks 的**模块 barrel**（`packages/ui/src/hooks/index.ts:1-5`）：仅再导出 `useSmoothStream`。注意：`useSmoothZoom` **不经此 barrel**（由 `packages/ui/src/index.ts:11` 直连 `./hooks/use-smooth-zoom.ts` 导出）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `useSmoothStream` | re-export | `:5` | `export { useSmoothStream } from './useSmoothStream.ts'` | 唯一导出 |

## 3. 内部逻辑与关键流程

无（纯 re-export）。

## 4. 调用者与调用链

入向：`packages/ui/src/index.ts:10`；外部消费者 `apps/electron/src/renderer/components/agent/AgentMessages.tsx`（经 `@profer/ui`）。出向：`./useSmoothStream.ts`（本批同组手册）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

不适用，依据：纯 re-export 无分支。

## 7. 权限与权威状态

无。

## 8. 修改影响面

改导出 → `packages/ui/src/index.ts:10` 与 AgentMessages 流式渲染。

## 9. 测试证据

无直接测试（barrel 无逻辑）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一 re-export；useSmoothZoom 不经此文件 | 已证实 | 逐行读 `:1-5` + `index.ts:10-12` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useSmoothStream` re-export | §2/§4 | `:5` | covered |
