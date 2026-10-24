---
path: apps/electron/src/main/lib/cslab/cslab-plot-history.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 921e425b3d3d5f537778704edf6bc5ac35b13e91
sha256: 866505c95437385373089b84b17e09347b90e4bff82b9df61e93ff5f5f2e4d85
lines: 121
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-plot-history.ts

## 1. 结论与边界

CSLab 绘图撤销快照（文件头 `apps/electron/src/main/lib/cslab/cslab-plot-history.ts:1-7`）：Agent 写回画板前把旧版本快照到 `vault/plots/.history/<plotId>/`，主窗口撤销条凭 `undoToken` 整文档回滚；仅最近若干份轻量保留，不引入数据库/版本链。

## 2. 导出与关键符号

`export` 逐条核对：2 个函数 = 2 个导出（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createPlotUndoSnapshot` | 函数（导出） | 59-91 | `(input:{labId,plotId})=>Promise<string\|null>` | 首次创建（目标不存在）返回 null |
| `restorePlotUndoSnapshot` | 函数（导出） | 98-121 | `(input:{labId,plotId,undoToken})=>Promise<CsLabPlotDocument\|null>` | 非法/缺失返回 null |
| `HISTORY_LIMIT`/`TOKEN_RE` | 内部 | 19-21 | 20 份；`^undo-[A-Za-z0-9-]{8,80}$`（**杜绝路径穿越**） |
| `CsLabPlotUndoSnapshotFile`/`historyDir`/`snapshotPath`/`pruneHistory` | 内部 | 23-52 | 快照形状；`vault/plots/.history/<plotId>/<token>.json`；超限删最旧（失败不影响主流程） |

## 3. 内部逻辑与关键流程

- `createPlotUndoSnapshot`（`:59-91`）：`assertLabId`；读 `plotPath` 不存在/坏 JSON/`normalizePlotDocument` 失败/`plot.labId!==labId` → `null`（防跨 lab，`:68-78`）；token=`undo-<Date.now()>-<4字节hex>`；`writeTextAtomic` 写快照（`./cslab-atomic.ts:14`）；`pruneHistory`（`:38-52`，`.json` 排序删最旧，异常吞掉）。
- `restorePlotUndoSnapshot`（`:98-121`）：`TOKEN_RE` 不匹配 → `null`（路径安全）；快照缺失/坏 → `null`；`plot.labId!==labId` → `null`；`writeTextAtomic(plotPath)` 写回 + `fs.rm` 删除快照（**一次性消费**）。

## 4. 调用者与调用链

入向：绘图写回流程（Agent 写画板前）+ 撤销 IPC；测试：`cslab-plot-history.test.ts`（93 行，本批）。出向：`node:fs/crypto/path`、`@profer/shared`（`CsLabPlotDocument`/`normalizePlotDocument`）、`./cslab-atomic.ts`、`./cslab-paths.ts`、`./cslab-science.ts`（`plotPath`）。

## 5. 数据 I/O、读写与副作用

读写：`vault/plots/.history/<plotId>/<token>.json` 与绘图文件（原子写）；副作用：prune 删除旧快照。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 目标不存在/坏 JSON/labId 不符 | `null`（无快照） | 68-78 |
| token 非法/快照缺失 | `null` | 104,108-112 |
| 快照 labId 不符 | `null`（不写回） | 116 |
| prune 失败 | 静默 | 49-51 |

恢复语义=undoToken 一次性回滚（`:119` 删快照防重复消费）。

## 7. 权限与权威状态

- labId 双检（create/restore 均验 `plot.labId`，防跨实验室断言）。
- token 白名单正则防路径穿越（`:20-21`）。

## 8. 修改影响面

改快照/回滚影响撤销语义；改 HISTORY_LIMIT 影响磁盘占用；影响 `cslab-plot-history.test.ts`。

## 9. 测试证据

直接测试：`cslab-plot-history.test.ts`（93 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| token 正则防穿越 | 已证实 | `:20-21,104` |
| labId 双检 | 已证实 | `:78,116` |
| 一次性消费回滚 | 已证实 | `:118-119` |
| prune 20 份 | 已证实 | `:19,38-52` |
| 生产接线 | 未知 | 未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 快照创建 | §3 | 59-91 | covered |
| 回滚 | §3 | 98-121 | covered |
| 修剪/路径安全 | §3 | 23-52 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
