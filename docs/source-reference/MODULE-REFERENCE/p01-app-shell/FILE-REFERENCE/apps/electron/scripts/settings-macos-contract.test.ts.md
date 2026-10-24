---
path: apps/electron/scripts/settings-macos-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0ab9afbd8dfcc8a91b2bda6fc2475ae2e2d6f8d3
sha256: 0208b3bb516d72ac7ce94af37a9e19ea8a17249a6e2e3ab21f9895b0ebf637bf
lines: 67
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/settings-macos-contract.test.ts

## 1. 测试目标

**设置页源码接线契约**测试（文件头自述 `apps/electron/scripts/settings-macos-contract.test.ts:4`：「验证 UI 到现有状态/API 的接线，不冒充真实窗口 E2E」）：以静态文本/正则断言钉住 4 组接线不变量——①未保存渠道表单时遮罩/Esc 关闭先请求确认；②未保存时跳教程先保护、确认后仍打开教程并关设置；③Shell 状态收敛到关于页且无运行时状态不渲染空卡片；④macOS 登录项读系统为准不覆盖、非 Mac 保留原写入行为。

被测对象（真实源文本，无 mock、无运行时）：`apps/electron/src/renderer/components/settings/SettingsDialog.tsx`、`SettingsPanel.tsx`、`GeneralSettings.tsx`、`AboutSettings.tsx`、`apps/electron/src/main/index.ts`。断言为静态阅读所得，本轮 `NOT_RUN`。

## 2. 用例清单

实测计数：`test(` 4 个、`it(` 0 个（grep 实测），1 个 `describe('Mac 设置页接线契约')`（`apps/electron/scripts/settings-macos-contract.test.ts:17`）。辅助：`source()`（`:5-7`，`readFileSync(new URL('../src/'+path, import.meta.url))`）、`between()`（`:9-15`，取两标记间切片，标记缺失即 expect 失败）。

| # | 用例（行） | 设置 | 动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 关闭先请求确认（:18-25） | 读 SettingsDialog.tsx | `between(dialog,'const handleOpenChange','\n  return (')` | handler 含 `if (!nextOpen && channelFormDirty)`；匹配 `/setCloseRequested\(true\)\s+return/`；`setCloseRequested(true)` 位置早于 `setOpen(nextOpen)`；全文含 `onOpenChange={handleOpenChange}` |
| 2 | 未保存跳教程保护（:27-38） | 读 SettingsPanel.tsx | 切 handleTabChange/executePendingAction/navigateToTab 三段 | handleTabChange 匹配 `/channelFormDirty\)\s*\{\s*setPendingAction/` 且 setPendingAction 早于 navigateToTab(tabId)、该段无 `setSettingsOpen(false)`；executePendingAction 段含 `navigateToTab(pendingAction.tabId)`；navigateToTab 段含 `if (tabId === 'tutorial')` 与 `setSettingsOpen(false)` |
| 3 | Shell 状态收敛（:40-49） | 读 GeneralSettings/AboutSettings | 含/不含断言 | GeneralSettings 不含「Agent Shell 环境」；AboutSettings 含 `function ShellEnvironmentCard`、`if (!runtimeStatus || !runtimeStatus.shell)`、`<ShellEnvironmentCard />` |
| 4 | 登录项读系统不覆盖（:51-64） | 读 GeneralSettings/main index.ts | 含/不含断言 + 切 mac 段 | GeneralSettings 含 `window.electronAPI.getAutoLaunch().then`、不含 `setAutoLaunch(settings.autoLaunch`、含 `disabled={autoLaunchBusy}`；mac 段（`safeRun('applyAutoLaunch'` 起至 `\n    const settings` 前）含 `app.getLoginItemSettings().openAtLogin`、`updateSettings({ autoLaunch: enabled })`、`return`、不含 `setLoginItemSettings`；startup 段含 `app.setLoginItemSettings({ openAtLogin: enabled })`（非 Mac 保留） |

## 3. 真实断言

- 用例 1：`apps/electron/scripts/settings-macos-contract.test.ts:21-24`。实测 `apps/electron/src/renderer/components/settings/SettingsDialog.tsx:38-43`（`handleOpenChange` 内 `if (!nextOpen && channelFormDirty)` `:39` → `setCloseRequested(true)` `:40` → `return` `:41`，后置 `setOpen(nextOpen)` `:43`）、`:47`（`onOpenChange={handleOpenChange}`）。
- 用例 2：`apps/electron/scripts/settings-macos-contract.test.ts:30-37`。实测 `apps/electron/src/renderer/components/settings/SettingsPanel.tsx:238-245`（`handleTabChange`：`if (effectiveTab === 'channels' && channelFormDirty)` `:239` → `setPendingAction({ type: 'tab', tabId })` `:241` → `return` `:242`，`navigateToTab(tabId)` `:244`；段内无 `setSettingsOpen(false)`）、`:180-188`（`executePendingAction` 含 `navigateToTab(pendingAction.tabId)` `:183`）、`:170-178`（`navigateToTab` 含 `if (tabId === 'tutorial')` `:171`、`openTutorialTab(store)` `:172`、`setSettingsOpen(false)` `:173`、`return` `:174`）。
- 用例 3：`apps/electron/scripts/settings-macos-contract.test.ts:44-48`。实测 GeneralSettings.tsx 全文无「Agent Shell 环境」（grep 0 命中，否定结论检索范围=该文件全文）；`apps/electron/src/renderer/components/settings/AboutSettings.tsx:165`（`function ShellEnvironmentCard`）、`:190`（`if (!runtimeStatus || !runtimeStatus.shell)`）、`:356`（`<ShellEnvironmentCard />`）。
- 用例 4：`apps/electron/scripts/settings-macos-contract.test.ts:53-63`。实测 `apps/electron/src/renderer/components/settings/GeneralSettings.tsx:63`（`window.electronAPI.getAutoLaunch().then((enabled) => {`）、`:80`（实为 `setAutoLaunch(await window.electronAPI.getAutoLaunch())`，不含被否定的 `setAutoLaunch(settings.autoLaunch` 形态）、`:301`（`disabled={autoLaunchBusy}`）；`apps/electron/src/main/index.ts:1024-1037`（`safeRun('applyAutoLaunch', …)` `:1024`；darwin 分支 `:1026-1031`：`app.getLoginItemSettings().openAtLogin` `:1027`、`updateSettings({ autoLaunch: enabled })` `:1028`、`return` `:1031`，段内无 `setLoginItemSettings`；`\n    const settings` 边界在 `:1032`；非 Mac 分支 `app.setLoginItemSettings({ openAtLogin: enabled })` `:1034`；`// 启动工作区文件监听` `:1037` 为段终点）。

## 4. 未覆盖与脆弱点

未覆盖：
1. **运行时行为全部未覆盖**：真实 Dialog 遮罩/Esc 事件、教程 Tab 打开、electronAPI.getAutoLaunch 往返、登录项写入均未执行（本测试明确「不冒充真实窗口 E2E」，`apps/electron/scripts/settings-macos-contract.test.ts:4`）——文件存在≠E2E 通过。
2. `executePendingAction` 的 close 分支（`SettingsPanel.tsx:185-186` `onClose?.()`）无断言；`cancelPendingAction`（`:190-193`）仅作 `between` 边界标记。
3. `GeneralSettings.tsx:80` 的状态回写（`setAutoLaunch(await …getAutoLaunch())`）只有否定断言（不含 `settings.autoLaunch` 写法），正向断言只到 `.then` 存在（`:53`）。
4. `handleClose` 的 close 确认链（`SettingsPanel.tsx:247` 起）、tabsOverride/未登录过滤分组（`:195-233`）无断言。
5. Windows 登录项行为只断言「保留 `app.setLoginItemSettings` 存在」（`:63`），未断言参数语义。

脆弱点：
- 所有断言是**精确字符串/正则锚点**（`'const handleOpenChange'`、`'/** 关闭设置面板'`、`'\n    const settings'`、`/setCloseRequested\(true\)\s+return/` 等）：变量/注释重命名、格式化（空格变化命中 `\s+`）会误报失败；`between()` 边界标记取自注释文本（`SettingsPanel.tsx:189,194,237` 等注释），注释改动即断言失效。
- 用例 3 的「不含『Agent Shell 环境』」绑定 rebrand 决策（testBuild 裁剪，注释 `apps/electron/scripts/settings-macos-contract.test.ts:41-42`）；若恢复该选择器需改测试。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 test、1 个 describe、0 个 it | 已证实 | `apps/electron/scripts/settings-macos-contract.test.ts:17-65`（grep 实测计数 4） |
| 纯静态文本断言，无 mock、无运行时调用 | 已证实 | 全文仅 `readFileSync`（`:2,6`）；无 mock/spy/渲染 |
| 4 组接线不变量与当前源码逐条相符 | 已证实 | §3 各双侧行号 |
| GeneralSettings.tsx 无「Agent Shell 环境」 | 已证实 | 该文件全文 grep 0 命中（检索范围：apps/electron/src/renderer/components/settings/GeneralSettings.tsx 全文） |
| mac 登录项「读系统为准」分支存在且先 return | 已证实 | `apps/electron/src/main/index.ts:1026-1031` |
| 注释自述的 rebrand 裁剪动机 | 推断 | `apps/electron/scripts/settings-macos-contract.test.ts:41-42` 注释自述，未读 rebrand 变更记录 |
| 运行时行为与断言一致 | 未知（NOT_RUN） | 本轮未运行测试/GUI/真实窗口 |
| CI 中本测试的运行 runner | 未知 | 本文件不声明 |

## 6. 覆盖表

| 符号/用例组 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| describe 1 组 / test 4 用例 | §2 | 17-65 | covered |
| `source`/`between` 辅助 | §2 | 5-15 | covered |
| 用例 1 关闭确认接线 | §3 | 18-25 | covered |
| 用例 2 教程跳转保护 | §3 | 27-38 | covered |
| 用例 3 Shell 卡片收敛 | §3 | 40-49 | covered |
| 用例 4 登录项读系统 | §3 | 51-64 | covered |
| executePendingAction close 分支/分组过滤/运行时行为 | §4 | SettingsPanel.tsx:185-233 | unknown（未覆盖） |
| 真实窗口验证 | §5 | - | unknown（NOT_RUN） |
