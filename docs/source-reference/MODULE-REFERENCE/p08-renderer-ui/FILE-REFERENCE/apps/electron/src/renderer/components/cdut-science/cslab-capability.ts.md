---
path: apps/electron/src/renderer/components/cdut-science/cslab-capability.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5f61f7702a8f348839f0d54fe585aba50eadf717
sha256: 2e39bc53bcc6889fc530f3fdf88bfa086890de2453c1999c41a1f9c726950e7f
lines: 90
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/cslab-capability.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

CSLab 资产能力解析器（90 行，头注 :1-6）：舞台窗格由「文件本质能力」决定**不倒推**；判断只依赖资产元数据不读文件内容。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isImageAsset` | fn | 27-30 | fig 层或图片扩展名（8 种，:14） |
| `supportsMol3dView` | fn | 41-46 | mol 层且 4 种结构格式（cif/pdb/poscar/xyz） |
| `resolveAssetCapability` | fn | 48-90 | 资产→能力（kind/defaultView/actions） |

内部：`TABLE_ACTIONS`（:16-23，6 动作）、`FIGURE_ACTIONS`（:25-29）、`MOL_3D_FORMATS`（:38，注释 :34-37 体数据 cube/chgcar/locpot 只作等值面叠加不计 3D 视图）、`extensionOf`（:22-25）。

## 3. 内部逻辑与关键流程

`resolveAssetCapability`：图片优先（figure）→switch layerType：table/raw→dataset（raw 注释 :55-56 血缘解析在 openAssetInPane，能力层先声明 dataset 回退抽屉）；mol→molecule（open-structure/analyze-crystal/simulate-pxrd）；lit/fact→literature；doc→manuscript；note/node→canvas（format==='canvas' 才 open-canvas）；default→generic/empty。

## 4. 调用者与调用链

入向：舞台窗格路由/资产抽屉（`openAssetInPane` 侧）。出向：`@profer/shared` 类型（:7-11）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；default 回 generic。

## 7. 权限与权威状态

- 能力权威：窗格由文件本质决定（头注 :2-3）；体数据不冒充 3D 视图资产（:34-37）。无 sender/role 检查。

## 8. 修改影响面

舞台窗格路由：`openAssetInPane`、资产抽屉、四分屏象限分配。
- 波及面：能力判定（figure/dataset/molecule/literature/manuscript/canvas/generic）直接决定默认窗格与可用动作列表；`supportsMol3dView` 影响 3D 视图准入（体数据不计入）。
- 回归关注：窗格由文件本质决定不倒推（头注口径）、raw 层先声明 dataset 回退抽屉的既有约定。
- 无专属测试文件（全树检索确认）；回归须靠集成验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 本质能力语义 | 已证实 | :2-3/:34-37 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isImageAsset`/`supportsMol3dView` | §2 | 27-46 | covered（未测） |
| `resolveAssetCapability` 全分支 | §3 | 48-90 | covered（未测） |
