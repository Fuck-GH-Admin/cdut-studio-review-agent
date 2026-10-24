---
path: packages/shared/src/utils/cslab-zotero.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5a4b2298bed83d248f95bd5d91ac2b22276c4177
sha256: 9770eb759f5933227cae639d38cc5eb68c3b3ab79abdf05402e4defad0655da3
lines: 124
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-zotero.ts

## 1. 结论与边界

Zotero 批注**坐标纯函数**（主/渲染共用，`packages/shared/src/utils/cslab-zotero.ts:1-12`）：仅无 Node 依赖的数学与 JSON 解析（附件路径解析留主进程）。旋转方向与 **PDF.js PageViewport 一致**（`:4-10`）：0° `(x,H-y)`、90° `(y,x)`、180° `(W-x,y)`、270° `(H-y,W-x)`。

边界：不做路径解析/IO；解析失败一律 null（不抛）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ZoteroRect` | type | 12 | `[number×4]` | PDF 用户坐标 |
| `ZoteroRotation` | type | 13 | `0\|90\|180\|270` | |
| `ZoteroAnnotationPosition` | interface | 15-20 | `{pageIndex; rects[]; rotation; inkPaths?}` | |
| `ZoteroViewportRect` | interface | 22-27 | `{left;top;width;height}` | |
| `normalizeRotation` | function | 29-35 | `(value: unknown) => ZoteroRotation` | 90 步进归一 |
| `parseZoteroAnnotationPosition` | function | 37-72 | `(raw: unknown) => ZoteroAnnotationPosition\|null` | JSON 字符串解析 |
| `zoteroRectToViewport` | function | 74-124 | `(rect, page, scale, rotation) => ZoteroViewportRect` | 四旋转分支 |

## 3. 内部逻辑与关键流程

- `normalizeRotation`（`:29-35`）：非有限 → 0；`round(v/90)*90 mod 360` 归一；仅 90/180/270 保留，其余 → 0。
- `parseZoteroAnnotationPosition`（`:37-72`）：非字符串/空 → null；JSON 失败 → null；`pageIndex` 非负整数化（缺省 0）；`rects` 逐项（<4 元素或非有限跳过，`:48-54`）；`ink` 仅非空字符串收集（无则 undefined，`:64`）；rotation 经归一。
- `zoteroRectToViewport`（`:74-124`）：scale/width/height 非法回退 1（`:76-78`）；rect 角点归一 min/max；按四旋转分支输出（各分支 width/height 交换逻辑与 PDF.js 一致，`:85-123`）。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：

- `parseZoteroAnnotationPosition`：`apps/electron/src/main/lib/cslab/cslab-literature.ts:32,182`、`cslab-zotero.ts:47,908`（electron 局部模块，经 `cslab-zotero-format.ts` 转发）、`cslab-zotero.test.ts:259-261`（批外 10 test 中 5 例）。
- `zoteroRectToViewport`：`apps/electron/src/renderer/components/cdut-science/CsLabPdfViewer.tsx:16,520`（renderer 产品调用）、批外测试 `:219-250`。
- `ZoteroAnnotationPosition` 类型：`cslab-literature.ts:33,170`；其余 3 类型仅再导出。
- `normalizeRotation`：仅内部+再导出（**零实际调用行**）。
- **同名碰撞警示（重要）**：`apps/electron/src/main/lib/cslab/` 下同 basename 模块群（cslab-zotero/-format/-bridge/.test）——检索模块名多数命中是 electron 局部模块，非本文件。
- 产品入口：main（经 cslab-zotero-format 转发）+ renderer（CsLabPdfViewer）；preload/core/cli 无。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

失败形态=null（解析面）；无异常抛出；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；PDF.js 坐标约定是权威口径（`:4-10`）。

## 8. 修改影响面

四旋转分支/坐标约定改动影响 PDF 批注定位（CsLabPdfViewer）；测试：批外 `cslab-zotero.test.ts`（10 test）。

## 9. 测试证据

本批**无**直接测试；间接 `apps/electron/src/main/lib/cslab/cslab-zotero.test.ts`（批外 10 test，5 例直测）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| PDF.js 四旋转约定 | 已证实 | `:4-10,85-123` |
| 解析 fail-safe（null 不抛） | 已证实 | `:37-72` |
| `normalizeRotation` 零实际调用行 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 同 basename 碰撞群 | 已证实 | 子 agent 检索 |
| 真实 Zotero 批注数据 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 类型 + 3 函数 | §2 | 12-124 | covered |
| 四旋转分支 | §3 | 74-124 | covered |
| 解析容错 | §3 | 37-72 | covered |
