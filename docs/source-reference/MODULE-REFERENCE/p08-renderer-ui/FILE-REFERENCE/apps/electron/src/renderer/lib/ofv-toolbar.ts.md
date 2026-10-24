---
path: apps/electron/src/renderer/lib/ofv-toolbar.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d8c676fcf76fa5c407b0df9eb2a353b74d94d778
sha256: 7bd446b18b831b0fe7a7acaf75e548661652e05cc0e1e303050b4c77df687d6f
lines: 59
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/ofv-toolbar.ts

## 1. 结论与边界

构造 OFV（`@open-file-viewer/core`）预览工具栏的配置对象（纯工厂函数，运行时代码）：缩放/旋转/下载/全开、打印/搜索关闭、追加「用默认应用打开」自定义动作。两处调用点（独立 viewer 页、app 内预览回退）共用同一份配置避免漂移（`apps/electron/src/renderer/lib/ofv-toolbar.ts:1-16`）。

边界：不读文件、不做权限判定（`resolveFilePath`/`systemOpenFile` 均在调用方，见 §4）；不实现打印/搜索（有意去掉，`apps/electron/src/renderer/lib/ofv-toolbar.ts:5-8`）；不渲染 UI（只产 `PreviewToolbarOptions`，样式在 `apps/electron/src/renderer/styles/ofv-profer-theme.css:83-143`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OfvToolbarHandlers` | 接口 | 21-29 | `{ onOpenInDefaultApp?: () => void; showDefaultAppAction?: boolean }` | 两调用点差异的唯一入口 |
| `createOfvToolbarOptions` | 函数 | 31-59 | `(handlers?: OfvToolbarHandlers) => PreviewToolbarOptions` | 工具栏选项工厂 |

导出计数：2（接口 1 + 函数 1）；无其它 `export`。内部：`showDefaultAppAction` 默认 `?? true`（`:32`）；自定义 action `id: 'open-in-default-app'`（`:45`，label「默认应用」`:46`、title「用默认应用打开」`:47`、order 90 `:48`）；`onClick` 内联分支（`:49-55`）。

## 3. 内部逻辑与关键流程

按执行顺序（`apps/electron/src/renderer/lib/ofv-toolbar.ts:31-59`）：
1. `:32` 解析 `showDefaultAppAction`，缺省 true。
2. `:33-42` 返回固定开关：`zoom/rotate/download/fullscreen: true`、`print: false`、`search: false`。`:34-36` 注释自述：OFV 仅在 `toolbar === true` 时给全套默认值，传对象时未显式 `true` 的开关视为关闭（该行为依据 OFV `createToolbar` 源码，位于 node_modules 未在冻结树内，本文件只引述——**推断**）。
3. `:43-57` `actions`：`showDefaultAppAction` 为真时含 1 个动作，否则空数组。
4. `:49-55` `onClick`：`handlers.onOpenInDefaultApp` 存在则调用并 `return`（`:50-53`）；否则 `window.open(BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL, '_blank')`（`:54`）——哨兵 URL 回投主进程，仅适用于无 preload 的独立 viewer 页（`:13-15` 注释自述，链路证实见 §4）。

## 4. 调用者与调用链

入向（全冻结树检索 `ofv-toolbar|createOfvToolbarOptions`，见 §10 否定检索记录）：
- 独立 viewer 页：`apps/electron/src/renderer/viewer/main.ts:35` 导入，`:142` 无参调用（回落哨兵 URL 路径）。
- app 内预览回退：`apps/electron/src/renderer/components/file-browser/ofv-preview/OfvPreview.tsx:31` 导入，`:77-84` 调用并传 `showDefaultAppAction: false`（外层已有文件头，`:78-79` 注释）与 `onOpenInDefaultApp`（`:81-83`）。

出向：
- `BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL`（`apps/electron/src/renderer/lib/ofv-toolbar.ts:19` 导入，`:54` 使用）：定义 `packages/shared/src/constants/browser-file-sentinels.ts:18`（`'profer-action://open-in-default-app'`）。
- `window.open` 哨兵 → 主进程拦截：`apps/electron/src/main/lib/browser-controller.ts:866-869`（`setWindowOpenHandler`）与 `:887-891`（`will-navigate`）两处匹配该常量后调 `openLocalFileWithDefaultApp`（`:540-559`：`tab.isLocalPreview && tab.localFilePath` 门禁 `:541-544` → `confirmExecutableFileOpen` `:546` → `shell.openPath` `:551`）。
- app 内路径：`onOpenInDefaultApp` → `window.electronAPI.systemOpenFile(filePath, undefined, access)`（`OfvPreview.tsx:82`；preload 桥 `apps/electron/src/preload/index.ts:3380`）。
- 类型 `PreviewToolbarOptions` 来自 `@open-file-viewer/core`（外部依赖，node_modules 不在冻结树，形状**未知**）。

## 5. 数据 I/O、读写与副作用

不适用（数据部分），依据：本文件无磁盘/网络/缓存/持久化读写，纯内存构造配置对象。副作用仅一个：回退分支的 `window.open(...)`（`apps/electron/src/renderer/lib/ofv-toolbar.ts:54`），触发主进程拦截（§4），不产生真实导航（`browser-controller.ts:868`/`:889-890` 均 deny/preventDefault）。无状态保持、无并发问题。

## 6. 分支、失败、取消与恢复

- `handlers.onOpenInDefaultApp` 存在/缺失二分支（`apps/electron/src/renderer/lib/ofv-toolbar.ts:50-55`）。
- `showDefaultAppAction` 真/假二分支（`:43`/`:57`）。
- 无 throw/无错误码/无重试恢复：`onClick` 内失败（如 `systemOpenFile` reject）由调用方自理（`OfvPreview.tsx:82` 用 `void` 忽略）。恢复逻辑不适用，依据：本文件无异步流程与状态机。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/IPC 检查。权限在下游：`OfvPreview.tsx:67` 的 `resolveFilePath(filePath, access)`（不在授权目录则拒）与 `browser-controller.ts:541-544`（仅 `tab.isLocalPreview` 且 `tab.localFilePath` 存在才打开——哨兵只能开该标签自己的本地文件，安全自述见 `packages/shared/src/constants/browser-file-sentinels.ts:13-14`）。权威状态（哪个文件被打开）由主进程的 tab 记录产生，不由本文件决定。

## 8. 修改影响面

- 改开关默认值 → 影响两条预览路径的工具栏按钮集（`viewer/main.ts:142`、`OfvPreview.tsx:77-84`）。
- 改 action `id`/删除动作 → 影响「默认应用打开」入口；哨兵 URL 常量链（`packages/shared/src/constants/browser-file-sentinels.ts:18` ←→ `browser-controller.ts:866/:887`）需同步，否则独立 viewer 页该功能静默失效。
- 改 `showDefaultAppAction` 语义 → `OfvPreview.tsx:78-81` 的去重复意图失效。
- 无直接测试，改动只能靠两条预览路径人工验证（§9）。

## 9. 测试证据

直接测试：**无**。全冻结树（`baseline/source` 全目录）检索 `ofv-toolbar|createOfvToolbarOptions|open-in-default-app|showDefaultAppAction`，命中 30 处：本文件、`OfvPreview.tsx`、`viewer/main.ts`、`ofv-profer-theme.css`（CSS 类名 `.ofv-toolbar*`，非本模块测试）、`browser-file-sentinels*`；`*.test.*` 中仅 `packages/shared/src/constants/browser-file-sentinels.test.ts`，不导入本文件。

间接证据：`packages/shared/src/constants/browser-file-sentinels.test.ts:17`（哨兵常量值锁 `'profer-action://open-in-default-app'`）、`:19`/`:66`（解析器不认该协议）。真实断言与本文件的交汇只有常量值。

NOT_RUN：本轮未运行任何测试/typecheck/build/GUI；上述为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、`print/search` 关闭、`zoom/rotate/download/fullscreen` 开启 | 已证实 | `apps/electron/src/renderer/lib/ofv-toolbar.ts:31,37-42` |
| 两调用点及其参数差异 | 已证实 | `viewer/main.ts:35,142`、`OfvPreview.tsx:31,77-84` |
| 哨兵 URL 被主进程拦截并打开该标签本地文件 | 已证实 | `browser-controller.ts:866-869,887-891,540-559` |
| OFV `createToolbar` 对对象形态的默认值语义（注释自述） | 推断 | `ofv-toolbar.ts:34-36`；OFV 源码在 node_modules，未读 |
| `PreviewToolbarOptions` 的完整字段形状 | 未知 | `@open-file-viewer/core` 不在冻结树 |
| 无直接测试（否定结论） | 已证实 | 全冻结树检索范围见 §9（30 命中逐一分类） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `OfvToolbarHandlers` | §2、§4 | 21-29 | covered |
| `createOfvToolbarOptions` | §2、§3 | 31-59 | covered |
| 固定开关 6 项 | §3 | 37-42 | covered |
| `onOpenInDefaultApp` 分支 | §3、§6 | 49-55 | covered |
| `showDefaultAppAction` 分支 | §3、§6 | 43,57 | covered |
| 哨兵回退 `window.open` | §4、§5 | 54 | covered |
| OFV 默认值语义 | §3 | 34-36 | partial（推断，实现未读） |
