---
path: apps/electron/src/renderer/lib/shortcut-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 413e4359761087b2f8bfe182f866eeba1d7e02d1
sha256: 87e079f08105b87fd4fc06459b95e6933913ddba9dd7f7fa4c71fef0d3828894
lines: 369
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/shortcut-registry.ts

## 1. 结论与边界

快捷键中央注册表（369 行）：单一全局 keydown（capture 阶段）+ Map 分发模式，避免多个 addEventListener 分散注册（shortcut-registry.ts:1-6）。职责：accelerator 解析/严格匹配、handler 注册与独占、用户覆盖配置、显示文本、冲突检测。功能键（F1–F12）拦截全部收敛在渲染层，主进程不按白名单拦截（:187-195 注释）；全局快捷键由主进程 globalShortcut 处理，不在本表注册（:144）。

## 2. 导出与关键符号

函数 8 个：`isMacFunctionKeyEvent`（shortcut-registry.ts:156）、`resolveShortcutDispatch`（:197）、`initShortcutRegistry`（:253）、`registerShortcut`（:265）、`updateShortcutOverrides`（:290）、`getActiveAccelerator`（:303）、`getAcceleratorDisplay`（:320）、`checkConflict`（:344）；类型 3 个：`ShortcutRegistrationOptions`（:18-25）、`ShortcutMatchResult`（:168-174）、`ShortcutDispatchPlan`（:177-182）；值 1 个：`isMac`（:369 re-export，声明 :13-14）。内部符号：`normalizeKeyName`（内部，:51-65）、`isModifierName`（内部，:67-82）、`parseAccelerator`（内部，:89-112）、`matchesParsed`（内部，:119-133）、`rebuildCache`（内部，:141-151）、`dispatchShortcut`（内部，:214-244）、`ParsedAccelerator`（内部接口，:43-49）、`ShortcutHandlerEntry`（内部接口，:27-30）。

## 3. 内部逻辑与关键流程

按执行顺序：

1. 模块初始化（:13-14、:33-39）：`isMac = navigator.userAgent.includes('Mac')` 模块加载期定值；状态 `handlers: Map<shortcutId, Set<entry>>`（:33）、`currentOverrides`（:36）、`initialized`（:39）、`parsedCache`（:138）。
2. `normalizeKeyName`（:52-64）：`' '→'space'`、arrow*→up/down/left/right、escape→esc、return→enter、`'+'→'plus'`，其余小写。
3. `parseAccelerator`（:90-111）：按 `+` 切分去空白；全为修饰键名时 `key=''`（:91-92）；`hasCmdOrCtrl` 识别 `cmdorctrl|commandorcontrol`（:94-95）；`cmd`/`ctrl` 按平台分流（isMac ? cmd : ctrl，:98-107）；`shift`（:108）、`alt|option`（:109）。
4. `matchesParsed`（:120-132）：四修饰键严格相等（:121-124，防 Cmd+K 误触 Cmd+Shift+K）；`parsed.key` 空 → 仅匹配裸修饰键事件（`['Meta','Control','Shift','Alt']`，:127-129）；否则 `normalizeKeyName(e.key) === parsed.key`（:131-132）。
5. `rebuildCache`（:142-150）：重建 parsedCache；跳过 `def.global`（:145，主进程 globalShortcut 负责）；`getActiveAccelerator` 返回 null（用户禁用）不入缓存（:148）。
6. `isMacFunctionKeyEvent`（:160-162）：非 mac 恒 false；`/^F(?:[1-9]|1[0-2])$/i` 匹配 `key` 或 `code`。
7. `resolveShortcutDispatch`（:202-205）：`runHandlers = match === 'handled' && !event.isComposing`；`swallow = runHandlers || isFunctionKey`。两条规则（:191-195）：组合期不执行但 macOS 功能键仍吞；未消费的 macOS F1–F12 一律吞，防 Chromium 原生焦点框。
8. `dispatchShortcut`（:215-243）：遍历 parsedCache 首个匹配即 `break`（:224）；`match` 取 'handled'（有 handler）或 'no-handler'（:223）；`plan.swallow` → `preventDefault + stopPropagation`（:228-231）；`!runHandlers` 返回（:232）；独占模式：倒序找最后一个 `exclusive` entry，仅执行它并 return（:235-240）；否则按注册序执行全部（:241-243）。
9. `initShortcutRegistry`（:254-257）：`initialized` 守卫仅执行一次；`rebuildCache` 后 `window.addEventListener('keydown', dispatchShortcut, true)`。
10. `registerShortcut`（:270-282）：懒建 Set 并 add entry；返回注销函数（删 entry、空集删键 :276-282）。
11. `updateShortcutOverrides`（:291-292）：写 `currentOverrides` 并 `rebuildCache`。
12. `getActiveAccelerator`（:304-312）：override 存在时取平台字段，`null` → 禁用（返回 null），非空 → 自定义；否则 `SHORTCUT_MAP.get(id)`，缺定义返回 `''`，取平台默认。
13. `getAcceleratorDisplay`（:321-336）：null/空 → `''`；mac 把 `cmd|command|meta|super→⌘`、`ctrl|control→⌃`、`shift→⇧`、`alt|option→⌥`、`backspace→⌫` 并去 `+` 连接；非 mac 原样返回。
14. `checkConflict`（:348-365）：解析目标 accelerator，遍历 `DEFAULT_SHORTCUTS`（跳过 excludeId :350、跳过禁用/空 :353），逐字段（cmd/ctrl/shift/alt/key）比对，命中返回冲突 id，否则 null。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`hooks/useShortcut.ts:9-10`（registerShortcut + options 类型）、`:30` 调用；`renderer/main.tsx:90,414,416`（initShortcutRegistry / updateShortcutOverrides）；`components/shortcuts/GlobalShortcuts.tsx:36,66,71,79`；`components/diff/DiffTabContent.tsx:20,319`（initShortcutRegistry）；`components/settings/ShortcutSettings.tsx:28-33` import 五符号，`:105` checkConflict、`:213,223,225,264` getAcceleratorDisplay、`:325,368,414,448` updateShortcutOverrides、`:575` getActiveAccelerator、`:596`；`components/shortcuts/ShortcutKeycaps.tsx:4,25,31,36`；`components/app-shell/left-sidebar/expanded-sidebar.tsx:21,226`；`components/agent/AgentView.tsx:68-69,3151`（registerShortcut）、`:3327`；`components/tabs/TabBar.tsx:76,767`。经 useShortcut hook 的间接调用点：session-items.tsx:419,707、planning/PlanningView.tsx、ai-elements/scroll-minimap.tsx 等（检索范围：baseline 全树 grep `initShortcutRegistry|updateShortcutOverrides|getActiveAccelerator|getAcceleratorDisplay|checkConflict|registerShortcut`）。测试：shortcut-dispatch.test.ts:2、shortcut-registry.test.ts:2。
- 出向：`./shortcut-defaults` 的 `DEFAULT_SHORTCUTS`（shortcut-defaults.ts:51）、`SHORTCUT_MAP`（:193）、类型 `ShortcutOverrides`（shortcut-defaults.ts:38 re-export，定义 types/settings.ts:160）；DOM `window.addEventListener`（:257）。动态调用：无（全局快捷键在主进程 `global-shortcut-service.ts`，域外）。

## 5. 数据 I/O、读写与副作用

有状态模块：模块级注册表 `handlers` Map（:33）、覆盖配置 `currentOverrides`（:36）、一次性 `initialized`（:39）、解析缓存 `parsedCache`（:138，配置变更即重建 :141-151）。副作用仅一处：全局 keydown capture 监听（:257，无对应 remove）；无 I/O、无窗口操作。

## 6. 分支、失败、取消与恢复

用户禁用（accel===null）不入分发缓存（:148）且不参与冲突检测（:353）；`def.global` 不进渲染分发（:145）；独占语义（:234-240）：任一注册项 exclusive 则只跑最后注册的 exclusive；组合态 `isComposing` 不执行 handler（:203）；注销后空集删键防泄漏（:280）。已证实边界：`getActiveAccelerator` 的 `''`（定义缺失/平台无默认值，:311）不被 :148 排除、会进入 parsedCache 并解析出 `key=''`（:92），其与真实键盘事件的匹配行为测试未覆盖（unknown）；含 `+` 的 accelerator 被 `split('+')`（:90）切分的解析边界亦未覆盖（unknown）。无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（注册表不鉴权；主进程 globalShortcut/权限逻辑在 `global-shortcut-service.ts`，域外）。

## 8. 修改影响面

分发/解析语义变更需同步：`hooks/useShortcut.ts`、`ShortcutSettings.tsx`、`ShortcutKeycaps.tsx`、`GlobalShortcuts.tsx`、`main.tsx:414-416`、`DiffTabContent.tsx:319`、`AgentView.tsx`、`TabBar.tsx`、`expanded-sidebar.tsx` 及测试 `shortcut-registry.test.ts`、`shortcut-dispatch.test.ts`；`DEFAULT_SHORTCUTS/SHORTCUT_MAP` 契约（shortcut-defaults.ts）与主进程 `global-shortcut-service.ts`（共享定义，域外）联动；`rename-item`（shortcut-defaults.ts:132-139，F2）是 dispatch 测试的匹配目标。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。两个测试文件机械计数：shortcut-registry.test.ts `test(`=10、shortcut-dispatch.test.ts `test(`=5（均 `it(`=0、`test.each(`=0），共 15 用例。真实断言示例：shortcut-registry.test.ts:33-36（mac 未绑定 F 键一律 swallow）、:51-54（no-handler 仍 swallow）、:84-87（组合态不吞普通键）、:92-95（组合态 F 键仍吞）；shortcut-dispatch.test.ts:72（双 handler 均执行 hits=2）、:81（独占只跑最后注册）、:98（exclusive 压过 plain）、:108（注销后不重复执行）。断言≠运行，不得声称运行成功。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 解析/匹配/分发/独占全逻辑 | 已证实 | shortcut-registry.ts:51-244 全文 |
| 注册/覆盖/显示/冲突 API | 已证实 | :253-366 |
| F1–F12 策略（渲染层拦截） | 已证实 | :187-195 注释 + :202-205 |
| 空 accelerator 缓存边界 | 已证实（静态） | :148/:311/:92 静态比对 |
| 空 accelerator / 含 '+' 解析的运行行为 | 未知 | 测试未覆盖，NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| normalizeKeyName/isModifierName/parseAccelerator | §3 | shortcut-registry.ts:51-112 | covered |
| matchesParsed | §3/§6 | :119-133 | covered |
| rebuildCache/parsedCache | §3/§5 | :138-151 | covered |
| isMacFunctionKeyEvent | §3 | :156-163 | covered |
| resolveShortcutDispatch | §3 | :197-206 | covered |
| dispatchShortcut（含独占） | §3/§6 | :214-244 | covered |
| initShortcutRegistry/registerShortcut | §3/§5 | :253-283 | covered |
| updateShortcutOverrides/getActiveAccelerator | §3 | :290-313 | covered |
| getAcceleratorDisplay/checkConflict | §3 | :320-366 | covered |
| 空 accelerator 缓存边界 | §6 | :148/:311 | partial |
