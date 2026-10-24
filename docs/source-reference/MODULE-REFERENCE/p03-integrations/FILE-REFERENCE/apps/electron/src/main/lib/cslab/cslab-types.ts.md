---
path: apps/electron/src/main/lib/cslab/cslab-types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f578d2cd3acf8282cb5ff9a63dad723db59fe2c
sha256: ef1eb1791108f3aceb750b64e67613db05788bda2eb9053d7b333dd977d3ed6b
lines: 17
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-types.ts

## 1. 结论与边界

17 行纯 re-export 文件：CSLab（CDUT Science Laboratory）后端类型定义与 IPC 通道契约，全部自 `@profer/shared` 转出（`apps/electron/src/main/lib/cslab/cslab-types.ts:8-17`）。模块代号 CSLab、隔离目录声明（`:4-5`）。

## 2. 导出与关键符号

re-export 8 项（`:8-17`）：`CSLAB_IPC_CHANNELS`（值）、`CsLabChannelKey`/`CsLabOperationalStatus`/`CsLabAuthStatus`/`CsLabAuthResult`/`CsLabTelemetry`/`CsLabNode`/`CsLabLogEntry`（类型）。类型本体在 `@profer/shared`（非本批）。

## 3. 内部逻辑

无（纯导出面）。

## 4. 调用者与调用链

CSLab 各模块与渲染层经此获取契约；出向 `@profer/shared`。

## 5-7. I/O/分支/权限

无；不适用。

## 8. 修改影响面

改 shared 契约后此文件自动生效；显式列表新增类型需同步。

## 9. 测试证据

间接（cslab.test 使用 CsLabTelemetry 字段）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 项 re-export | 已证实 | `:8-17` |
| shared 侧类型定义 | 未知 | 非本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全文 | §2 | covered |
