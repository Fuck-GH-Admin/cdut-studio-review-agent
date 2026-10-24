---
path: apps/electron/src/renderer/components/cdut-science/cslab-dnd.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32f48f957dd3512f2753f1016c86aca337fb6fb6
sha256: 406b11efb6ad10d2f42dd6d94353b0b602945595bf096a6d73d1eb897f32458c
lines: 86
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/cslab-dnd.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

CSLab 拖拽协议**单一事实源**（86 行，头注 :1-6）：两类载荷——`application/x-cslab-ref`（数据表单元格→编辑器/文稿条目）与 `application/x-cslab-asset`（资产/文稿→舞台窗格/四分屏）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CSLAB_CELL_MIME`/`CSLAB_ASSET_MIME` | const | 11-12 | 两类 MIME |
| `CsLabAssetDragPayload` | interface | 14-19 | kind/uri/title/layerType? |
| `hasDragType` | fn | 21-25 | types 包含判定 |
| `readCellRef` | fn | 27-48 | 解析+字段校验（缺一即 null） |
| `readAssetDrag` | fn | 50-68 | kind 限定 asset|manuscript+uri/title 必需 |
| `buildCapsuleAttrs` | fn | 71-86 | 单元格引用→胶囊属性（`cap-{ts36}-{rand4}` id、status 'fresh'） |

## 3. 内部逻辑与关键流程

两个 read* 函数：JSON.parse try/catch→结构校验不全→null（不半解析）；`buildCapsuleAttrs` 值 `String(value)`、unit 缺省 ''、`revisionAtBind=tableRevision`。

## 4. 调用者与调用链

入向：表格单元格拖拽源/舞台窗格拖放目标/TipTap 插入（`cslab-capsule-node` 消费 attrs）。出向：`@profer/shared` 类型、`./cslab-capsule-node` 类型（:9）。

## 5. 数据 I/O、读写与副作用

纯函数（DataTransfer 读取）。

## 6. 分支、失败、取消与恢复

解析/校验失败→null；不抛。

## 7. 权限与权威状态

- 协议权威：MIME/字段校验单一收口（头注 :2-6）；畸形载荷静默拒。无 sender/role 检查。

## 8. 修改影响面

拖拽绑定链：表格单元格拖入编辑器/文稿条目、资产拖入舞台窗格/四分屏象限。
- 波及面：`buildCapsuleAttrs` 产出被 `cslab-capsule-node` 消费（revisionAtBind/status 初值）；MIME 常量被拖放目标判定消费。
- 回归关注：畸形载荷静默拒（校验不全→null 半解析不允许）、协议单一事实源不旁落。
- 无专属测试文件（全树检索确认）；回归须靠拖拽交互人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/行号 | 已证实 | 逐行核对 |
| 校验拒/胶囊属性语义 | 已证实（代码） | :27-86 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| read*/buildCapsuleAttrs | §3 | 27-86 | covered（未测） |
