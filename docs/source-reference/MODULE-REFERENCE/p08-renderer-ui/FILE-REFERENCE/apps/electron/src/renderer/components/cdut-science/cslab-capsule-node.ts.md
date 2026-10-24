---
path: apps/electron/src/renderer/components/cdut-science/cslab-capsule-node.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b99c45e1541ce594a7612a4c784fdc79eba8e592
sha256: e3c5d83d58ac058a1fa828476de8ed7f34f9037319826b87e23efe4c10818265
lines: 202
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/cslab-capsule-node.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

CSLab 活体胶囊 TipTap Node（202 行，头注 :1-7）：inline+atom 不破坏文本流（光标不在边界卡死）；**一键更新只允许 `setNodeMarkup + addToHistory=false` 精准事务（审计红线）**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CapsuleNodeAttrs` | interface | 11-21 | 9 属性（capsuleId…revisionAtBind/status） |
| `ScienceCapsuleNode` | Node | 23-110 | `scienceCapsule`（inline+atom+draggable） |
| `collectCapsulesFromDoc` | fn | 113-150 | TipTap JSON 收集胶囊（保存时） |
| `findCapsulePositions` | fn | 153-159 | 胶囊 id→绝对位置 Map |
| `patchCapsuleAttrs` | fn | 162-182 | 批量精准属性更新（不污染 Undo/焦点） |
| `markCapsulesStale` | fn | 185-190 | 数据表 revision 变化标记 stale |
| `applyUpdatedCapsule` | fn | 193-202 | 一键更新写回真实值+绑定 revision |

## 3. 内部逻辑与关键流程

1. **渲染**（:62-108）：status 三态样式（stale 琥珀闪烁/orphan 灰/accent）；title=`{tableUri}#{column}:{rowIndex}` 或「未绑定数据表的胶囊」。
2. **收集**（:113-150）：递归 walk；`tableUri` 空→status 强制 `orphan`（:141-143）；无 id 过滤。
3. **`patchCapsuleAttrs`**（:162-182）：定位→`setNodeMarkup` 合并 patch→`addToHistory:false`+`cslab-capsule-update` meta（审计红线 :6）。

## 4. 调用者与调用链

入向：文稿编辑器扩展装配、数据表 revision 变更监听（stale）、一键更新动作。出向：`@tiptap/core`、`@profer/shared`（:8）。

## 5. 数据 I/O、读写与副作用

编辑器事务 dispatch；无磁盘/网络。

## 6. 分支、失败、取消与恢复

位置失效跳过该 patch；空 patch→false；不抛。

## 7. 权限与权威状态

- 审计红线权威：更新事务不入 Undo 栈（`addToHistory:false`，:6/:180）；orphan 强制标注（无绑定不冒充 fresh）。无 sender/role 检查。

## 8. 修改影响面

文稿胶囊绑定/陈旧/更新链。无专属测试。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出/行号 | 已证实 | 逐行核对 |
| 审计红线/orphan 语义 | 已证实 | :6/:141-143/:180 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ScienceCapsuleNode` | §3.1 | 23-110 | covered（未测） |
| collect/patch/stale/apply | §3.2-3.3 | 113-202 | covered（未测） |
