---
path: apps/electron/src/renderer/components/content-review/review-source-focus.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4285e101423565d4a9999d57fcd9d73fd6d0a61
sha256: a55b021333c6cc8f28b40509518ee598315daab441b4f3b8ac8b2a6a39ce9c71
lines: 34
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-source-focus.ts

## 1. 结论与边界

**V2 SourceRef→V1 渲染块定位映射**（`apps/electron/src/renderer/components/content-review/review-source-focus.ts:3`）：把 V2 引用映射到最接近的已解析块，**不虚构精度**（"without inventing precision"）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `sourceRefTargetsBlock` | 函数 | `:4-22` | `(ref, document, block) => boolean` |

内部：`spreadsheetColumnName`（`:24-34`，列索引→A/B/…）。

## 3. 内部逻辑与关键流程

匹配链（`:5-21`）：文档版本匹配（`id` 或 `id-v*` 前缀）→块存在→按 `location.kind` 分派：

- `paragraph`：`blockIndex === location.index`（`:9`）。
- `sheet-cell`：行/列（`spreadsheetColumnName` 转字母比较，大小写不敏感）/sheet 三匹配（`:10-13`）。
- `pdf-rect`：`block.page === location.page`（`:14`）。
- `text-range`：quote 命中→true；否则按块文本偏移区间重叠（`:15-20`）。
- `file`：`blockIndex === 0`（**只定位首块**，防所有原文跳动——test 锁定）。

## 4. 调用者与调用链

消费方：三栏定位联动（D8 `reviewFocusAtom`）。出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 版本不匹配 | `:5` | false |
| 块不存在 | `:7` | false |
| 各 location 分派 | `:9-21` | 对应匹配 |
| 未知 location | `:21` | file 判定兜底 |

## 7. 权限与权威状态

「不虚构精度」是定位权威语义（`:3`）。

## 8. 修改影响面

- `location.kind` 集合与 `SourceRef` 联合绑定。
- `spreadsheetColumnName` 列转换与 Excel 约定耦合。

## 9. 测试证据

`review-source-focus.test.ts`（23 行，2 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、五类定位 | 已证实 | `:4-22` |
| file 只首块 | 已证实 | `:21` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `sourceRefTargetsBlock` | `:4-22` | covered |
| 列名转换 | `:24-34` | covered |
