---
path: apps/electron/src/renderer/components/cdut-zone/AiClassCognitionButton.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ded9d0d51bf0d519872ebc45d5ddf821e557e67a
sha256: 84ab04b30115784039a86e325346fe162f469a38a7d60d8e155736170bd62b50
lines: 78
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassCognitionButton.tsx

## 1. 结论与边界

「认知底座」**快捷入口胶囊**（78 行）：常驻对话区右上角，点击唤起配置弹窗；挂载时从 settings.json 水合双引擎选择（头注释称"保证胶囊徽标与设置页实时一致" `:5`——**失实见矛盾 (a)**）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassCognitionButton` | `:18-78` | 唯一 export，无 props：`setModalOpen(true)` 点击（`:47`）；双层信标（animate-ping+实心，isEnhanced?violet:sky）；徽标 `isEnhanced?'宏观演进+联想':'经典精准'`（`:74`） |

内部：`isEnhanced:24`（graphrag||hipporag）；水合 effect（`:27-42`）：`getSettings`→归一写原子（非增强一律 classic）→失败静默保默认。

## 3. 内部逻辑与关键流程

挂载一次水合→信标/徽标派生→点击开 Modal（写同批原子，Modal 内改即时一致）。

## 4. 调用者与调用链

`AiClassView.tsx:41/384`；出向 study-retrieval-atoms、`getSettings` IPC（preload:606/2529 对拍）。

## 5. 数据 I/O、读写与副作用

IPC 读 settings+atoms 写。

## 6. 分支、失败、取消与恢复

getSettings 失败静默回退 'classic' 徽标；无 loading。

## 7. 权限与权威状态

徽标派生权威=atoms（水合自 settings）；合成语义 isEnhanced 任一增强即"宏观演进+联想"（矛盾 (b) 照实）。

## 8. 修改影响面

改徽标逻辑影响状态展示；与 Modal/DeveloperSettings 三入口联动（矛盾 (a)/(c)）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件水合/徽标/交互 | 已证实 | 78 行全读（字节核对） |
| **(a)** 头注释"实时一致"失实：仅挂载水合一次无订阅，DeveloperSettings 改后徽标不刷新直至重挂载 | 已证实 | `:5` vs `:27-42` |
| **(b)** isEnhanced 合成文案（任一增强即显示联合徽标） | 已证实 | `:24`/`:74` |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/水合/徽标 | §2/§3 | covered |
| 2 矛盾 | §10 | covered |
