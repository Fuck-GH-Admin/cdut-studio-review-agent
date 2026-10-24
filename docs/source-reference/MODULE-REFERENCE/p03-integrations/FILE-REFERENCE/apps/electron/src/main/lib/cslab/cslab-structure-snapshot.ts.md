---
path: apps/electron/src/main/lib/cslab/cslab-structure-snapshot.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 59dce6c7b1f0284218a823245a988f1eb47e8c7b
sha256: 965ec3ffdcba8cd1f57c11d18f2f98a8bd0dc9b5b8a1b05776ecb8cfa6da657f
lines: 154
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-structure-snapshot.ts

## 1. 结论与边界

**CSLab 3D 晶体视窗快照服务（主进程）**（`cslab-structure-snapshot.ts:1-10`）：Agent 工具→广播 REQUEST_STRUCTURE_SNAPSHOT→渲染层 Mol* 截图回传 PNG DataURL→**校验 PNG 头、写盘 `vault/figures/` 并结算挂起请求**。**本文件 Electron-free**（事件出口收敛在 cslab-events，便于 bun test 直跑 `:9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `normalizeSnapshotScale` | function（export） | `:42-45` | 仅 1\|2\|3，缺省 2（钳制） |
| `decodePngDataUrl` | function（export） | `:48-57` | DataURL 正则+base64 解码+**魔数校验**+最小长度 |
| `pngDimensions` | function（export） | `:60-66` | IHDR 宽高（非正→抛） |
| `writeStructureSnapshot` | function（export） | `:82-106` | 写 `vault/figures/<prefix>-<ts>-<sha256 前 8>.png` |
| `requestStructureSnapshot` | function（export） | `:112-132` | 广播+挂起 Promise（默认 20s 超时 `:31`） |
| `submitStructureSnapshot` | function（export） | `:135-154` | 回传校验+落盘+结算 |

内部：`PNG_SIGNATURE`/`PNG_HEADER_BYTES=24`/`DEFAULT_TIMEOUT_MS=20_000`（`:29-31`）、`PendingSnapshot`/`pendingSnapshots`（`:33-39`）、`settlePendingSnapshot`（`:68-79`）。

## 3. 内部逻辑与关键流程

1. **请求**（`:112-132`）：assertLabId+归一 scale+requestId（时间戳+uuid8 `:118`）；挂起 Promise+定时器（**超时报可诊断错误**：提示确认工作台已打开且视窗可见 `:123`）；广播事件（`:126-130`）。
2. **回传**（`:135-154`）：`input.error` → 抛（**渲染层失败快速熔断不空等** `:110/:140`）；空 dataUrl 拒（`:141`）；写盘成功结算 resolve（`:147`）；异常结算 reject 并外抛（`:149-153`）。
3. **落盘**（`:82-106`）：PNG 校验→IHDR 尺寸→figures 目录→sanitize 前缀→sha256 前 8 做摘要名→返回 path/relPath/width/height/bytes。

## 4. 调用者与调用链

入向：Agent 工具 `requestStructureSnapshot`、渲染层 SNAPSHOT_STRUCTURE IPC（跨文件）；测试 `cslab-structure-snapshot.test.ts`（同批 3 用例）。出向：`./cslab-paths`/`./cslab-events`/`./cslab-types`、`@profer/shared` 类型、`node:fs`/`crypto`。

## 5. 数据 I/O、读写与副作用

写 PNG 到实验室沙箱 `vault/figures/`；内存挂起表；广播事件；定时器。

## 6. 分支、失败、取消与恢复

超时 reject+清表（`:121-124`）；settle 幂等（`:74`）；PNG 校验三失败（`:50/:52/:54`）；渲染失败快速熔断（`:140`）。不适用取消（Promise 超时即恢复）。

## 7. 权限与权威状态

assertLabId/sanitizeFileName 路径安全（`:87/:93`）；Electron-free 边界（`:9`）。

## 8. 修改影响面

改校验/落盘/挂起 → Agent 结构图导出链；超时文案与熔断语义影响 UX。

## 9. 测试证据

**直接测试 `cslab-structure-snapshot.test.ts`（3 用例，NOT_RUN）**：合法 PNG 落盘+尺寸、非 PNG 拒绝、渲染失败熔断不写盘——断言见测试手册。未覆盖：requestStructureSnapshot 超时、normalizeSnapshotScale。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+3 内部+请求/回传/落盘全链 | 已证实 | 逐行读 `:1-154` |
| 测试 3 用例断言 | 已证实 | 测试 `:1-85`；NOT_RUN |
| Mol* 截图侧行为 | 未知 | 渲染层 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | `:42-154` | covered |
| 请求/回传/落盘 | §3 | `:82-154` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
