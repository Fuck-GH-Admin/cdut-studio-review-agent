---
path: apps/electron/src/renderer/components/UiScaleContainer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7e1e4cfbf78d826233dc020597f8becb70be73ad
sha256: fb45c26eba193ef78d10e18ba3dbddc899136b12e14fde951a9d17fe2e3fccf9
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/UiScaleContainer.tsx

## 1. 结论与边界

界面等比缩放容器（渲染层运行时）：内容整体 `transform: scale(s)` 等比放大、容器宽高反补偿 `(100/s)%`，视觉放大后仍占满视口不溢出（文件头 `apps/electron/src/renderer/components/UiScaleContainer.tsx:1-13`）。`s===1` 时内层不加 transform，等效透传（`:8-9,28-29`）。注释声明 transform 创建 containing block，`position:fixed` 相对本容器定位但视觉等价；Radix 弹层 Portal 到 body 不受影响（`:10-12`）。

边界：不存缩放值（`@/atoms/ui-scale`）；不缩放弹层内容；子组件需 `h-full/w-full` 占满（`:8`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `UiScaleContainer` | 函数/组件（导出） | 19-42 | `({children}: {children: React.ReactNode}) => React.ReactElement` | 缩放容器 |

无内部函数。

## 3. 内部逻辑与关键流程

`uiScaleAtom` 取档位（`:20`）→ `UI_SCALE_VALUES[scale]` 取数值 s（`:21`）→ 外层 `h-[100dvh] overflow-hidden` 壳（`:24`）→ 内层 s===1 无 style，否则 `transform:scale(s); transform-origin:top left; width:100/s %; height:100/s dvh`（`:28-35`）→ children（`:38`）。

## 4. 调用者与调用链

入向（全树检索，证实）：**无 JSX 渲染点、无 import**——仅注释提及（`atoms/ui-scale.ts:5,77,92`、`settings/AppearanceSettings.tsx:69`）。否定范围：`apps/`+`packages/` 全 `*.ts/*.tsx` 的 `<UiScaleContainer`、`from '@/components/UiScaleContainer'`、名字形式三种检索均 0 命中（注释除外）。推断：预留/被替换的缩放容器（AppearanceSettings 注释称界面大小控件面向移动端/浏览器端，`:69`）。

出向：`@/atoms/ui-scale`（`uiScaleAtom`/`UI_SCALE_VALUES`，`:17`）。

## 5. 数据 I/O、读写与副作用

读 `uiScaleAtom`；写 DOM style（transform/width/height）。无盘/网络（依据：全文读）。副作用：containing block 影响内部 fixed 定位（`:10-11` 注释声明，未运行验证）。

## 6. 分支、失败、取消与恢复

唯一分支：`s===1` 透传（`:28-29`）。无异常/取消/恢复概念，依据：纯渲染。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；缩放档位权威=`ui-scale` atom（settings.json 校正，见 `ui-scale.ts:92` 注释）。

## 8. 修改影响面

无现成调用方（§4）；若接入，将包裹整个应用内容树，影响全部子组件布局与 fixed 定位语义。需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*`/`*.spec.*` 检索 `UiScaleContainer` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实缩放渲染。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 缩放公式 | 已证实 | `:19-42` 逐行读 |
| s===1 透传分支 | 已证实 | `:28-29` |
| 无渲染点/无 import | 已证实 | 三种形式全树检索（§4 范围） |
| 预留组件定性 | 推断 | 仅注释交叉引用 |
| containing block 行为 | 未知 | 注释声明（`:10-12`），NOT_RUN |
| 运行期表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `UiScaleContainer` | §2-3 | 19-42 | covered |
| s===1 分支 | §3, §6 | 28-29 | covered |
| 调用链（无） | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
