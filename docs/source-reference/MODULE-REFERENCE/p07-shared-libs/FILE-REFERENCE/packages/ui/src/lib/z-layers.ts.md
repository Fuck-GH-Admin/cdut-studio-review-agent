---
path: packages/ui/src/lib/z-layers.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2f30f662fe45c6e4dd04dcf17993ae69eed01174
sha256: e561475938b9d75ac96eae71365841a8f2e54f079b7f24d9da6261029363fc68
lines: 76
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/lib/z-layers.ts

## 1. 结论与边界

**客户端全局 z-index 标准阶梯**（`packages/ui/src/lib/z-layers.ts:1-28` 注释）：依据审计修复方案 §4.2（原生 WebContentsView 恒在 DOM 之上），以语义化常量取代魔法数字；业务代码一律引用 `Z_LAYER`/`Z_INDEX`。纯常量模块，无逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Z_INDEX` | const（export） | `:31-47` | 16 键数值阶梯 | canvas 0 → tooltip 10050 |
| `Z_LAYER` | const（export） | `:55-74` | 16 键 Tailwind 类名 | 含 `shellTopDrag: 'z-50'`（仅类名档，无 Z_INDEX 对应） |
| `ZLayerName` | type（export） | `:76` | `keyof typeof Z_LAYER` | 类名键类型 |

`Z_INDEX` 全景（`:32-46`）：canvas 0 / toolbar 10 / chrome 30 / drawer 40 / shellContent 60 / shellRail 62 / shell 70 / shellResizer 80 / dialog 100 / confirm 110 / fullscreen 150 / lightbox 200 / menu 9999 / overlay 9999 / tooltip 10050。`Z_LAYER` 同名键取值 `z-<n>`/`z-[<n>]`（`:56-73`），外加 `shellTopDrag: 'z-50'`（`:60`）。

## 3. 内部逻辑与关键流程

无运行逻辑。语义约定（注释 `:11-27`）：应用外壳占 60~80，下拉/浮层/提示用扩展档 9999/10050；系统级 Toast 由 Sonner 内置更高层级承载、不在阶梯内（`:26`）。

## 4. 调用者与调用链

- 入向：21 个外部文件引用 `Z_LAYER|Z_INDEX`（如 `packages/ui/src/primitives/alert-dialog.tsx:7/:24/:44`、本批 `LongTermMemoryView` 所在 p08 各视图、`SettingsDialog.tsx:14`）；`packages/ui/src/index.ts:17-18` 再导出；测试 `mermaid-detection.test.ts:10-11`（经 `./index`）。
- 出向：无（纯常量）。
- Tailwind 联动：类名字面量被 content 扫描生成 CSS（注释 `:52-53` 指 `apps/electron/tailwind.config.js` 含 `../../packages/ui/src/**`）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

不适用，依据：常量模块无分支。

## 7. 权限与权威状态

无权限逻辑；层级权威=本文件（注释 `:27`"禁止再写魔法数字"）。

## 8. 修改影响面

改数值/增删键 → 21 个外部文件的层级关系、Tailwind 生成类、`mermaid-detection.test.ts:46-65` 的 2 个 z 阶梯断言（§9）。`menu`/`overlay` 同值 9999（`:44-45`）依赖 DOM 打开顺序叠放（注释 `:22`）。

## 9. 测试证据

**间接（`packages/ui/src/mermaid-detection.test.ts:46-65`，describe "全局渲染图层标准阶梯（§4.2）"，NOT_RUN）**：用例 1（`:47-57`）断言 9 个层级两两 `toBeLessThan` 单调有序（canvas<toolbar<chrome<shellContent<shellResizer<dialog<confirm<fullscreen<lightbox<menu<tooltip）；用例 2（`:59-65`）断言 `Z_LAYER.dialog/confirm/fullscreen/lightbox/tooltip` 严格等于 `z-[${Z_INDEX.x}]`。未覆盖：shellRail/shell/shellTopDrag/menu/overlay 档位。无其他测试（负向：冻结树 `*.test.*` 检索 `z-layers|Z_INDEX` 仅此 1 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出、16+16 键全景 | 已证实 | 逐行读 `:1-76` |
| `ZLayerName` 定义于 `:76` | 已证实 | `:76` |
| shellTopDrag 无 Z_INDEX 对应（类名独有） | 已证实 | `:60` vs `:31-47` |
| Tailwind 扫描生成 | 推断 | 注释 `:52-53`；config 未逐行核 |
| 实际遮挡效果 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Z_INDEX`/`Z_LAYER`/`ZLayerName` | §2 | `:31-76` | covered |
| 语义约定 | §3 | 注释 `:11-27` | covered |
| 测试断言 | §9 | 测试行号 | covered（NOT_RUN） |
| 运行时遮挡 | §10 | — | unknown |
