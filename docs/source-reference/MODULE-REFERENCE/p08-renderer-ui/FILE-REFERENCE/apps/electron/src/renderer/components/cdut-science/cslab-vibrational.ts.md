---
path: apps/electron/src/renderer/components/cdut-science/cslab-vibrational.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0288e867100c99ba4ab2de5950e4e3bebaf17710
sha256: 34c9f8d27ba3f4678df799f836f84252f5ea5a46a64da233dfad02bcfd27de8e
lines: 37
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/cslab-vibrational.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

拉曼/红外特征伸缩振动**参考区间表**（37 行）：红线注释（:4-8）——区间来自公开文献常见范围，仅供「点原子后粗略定位谱带」，**不代表本样品实测峰位**，UI 必须标注「内置参考区间（启发式）」。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabVibrationalBand` | interface | 10-15 | from/to/label/note |
| `VIBRATIONAL_REFERENCE_BANDS` | const | 19-31 | 9 元素（ti/fe/si/al/zn/cu/c/o/n）区间表 |
| `findVibrationalBands` | fn | 34-37 | 元素符小写查表，未收录→`[]` |

内部：`REFERENCE_NOTE='内置参考区间（启发式），非本样品实测'`（:17）。

## 3. 内部逻辑与关键流程

`findVibrationalBands`：trim+小写→查表→缺省空数组。

## 4. 调用者与调用链

入向：晶体工作台原子点选谱带提示（`CsLabVestaCrystalPane` 侧）。出向：无。

## 5. 数据 I/O、读写与副作用

无（静态数据）。

## 6. 分支、失败、取消与恢复

单函数；不抛。

## 7. 权限与权威状态

- 科学诚实权威：启发式区间必须随 `note` 标注不可冒充实测（:4-8/:17）。无 sender/role 检查。

## 8. 修改影响面

谱带参考提示展示：晶体工作台点原子后的谱带粗定位提示。
- 波及面：UI 展示 note 文案；9 元素区间表数据变更会改变提示范围。
- 回归关注：「内置参考区间（启发式），非本样品实测」标注强制不可去除（科学诚实红线）。
- 无专属测试文件（全树检索确认）；回归须靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/行号 | 已证实 | 逐行核对 |
| 启发式标注强制 | 已证实 | :4-8/:17 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `findVibrationalBands`/参考表 | §3 | 19-37 | covered（未测） |
