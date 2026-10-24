---
path: apps/electron/src/renderer/lib/composer-compact-height.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c048fdb40468c08ea75e7d52a333ece5c773d94a
sha256: b0a19653f874343798cbe64069fdc62fa0f28de895493aed0b8ed24ea152370a
lines: 144
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/composer-compact-height.ts

## 1. 结论与边界

Composer 紧凑档（窗口高度驱动）纯逻辑模块（144 行）：三个设置值归一化（触发窗口高度/紧凑上限/紧凑最小高度）、带迟滞（hysteresis）的紧凑档判定、输入框 max-height/min-height 解析。历史背景：2026-09-13 曾因阈值附近反复切换（单次拖拽实测 4 次跳动）移除过一版，本次以迟滞 + 不加过渡动画两个手段重新引入（`apps/electron/src/renderer/lib/composer-compact-height.ts:8-13`）。边界：纯函数 + 常量，零 I/O、零模块级可变状态；只提供计算，紧凑档布尔状态由调用方组件持有（`apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:136-140`）。

## 2. 导出与关键符号

- 常量导出 9 个：`DEFAULT_COMPACT_VIEWPORT_HEIGHT=700`（`apps/electron/src/renderer/lib/composer-compact-height.ts:17`）、`DEFAULT_COMPACT_MAX_HEIGHT=140`（`:20`）、`COMPACT_EXIT_HYSTERESIS_PX=60`（`:23`）、`COMPOSER_TIER_HEIGHTS={collapsed:101,default:200,expanded:500}`（`:26-30`）、`COMPOSER_EDITOR_MIN_HEIGHT=101`（`:36`）、`DEFAULT_COMPACT_MIN_HEIGHT=60`（`:39`）、`COMPACT_MIN_HEIGHT_RANGE={min:40,max:101}`（`:42`）、`COMPACT_VIEWPORT_HEIGHT_RANGE={min:400,max:1600}`（`:45`）、`COMPACT_MAX_HEIGHT_RANGE={min:80,max:200}`（`:48`）。
- 函数导出 6 个：`normalizeCompactViewportHeight`（`:56-64`）、`normalizeCompactMaxHeight`（`:67-74`）、`normalizeCompactMinHeight`（`:77-84`）、`resolveCompactViewport`（`:92-102`）、`resolveComposerMaxHeight`（`:110-127`）、`resolveComposerMinHeight`（`:135-144`）。
- 类型导出 0 个。合计导出 15 个符号，与源码逐条一致。内部符号：无独立内部函数（归一化三函数相互复用，`resolveComposerMaxHeight:122`、`resolveComposerMinHeight:142` 内调归一化防脏输入）。

## 3. 内部逻辑与关键流程

1. `normalizeCompactViewportHeight`（`apps/electron/src/renderer/lib/composer-compact-height.ts:56-64`）：`value === 0` 短路返回 0（关闭该行为，`:57`）；`Number(value)` 可解析字符串（`:58`）；非有限数或 `<=0` 回退默认 700（`:59`）；其余 `Math.round` 后夹到 [400,1600]（`:60-63`）。
2. `normalizeCompactMaxHeight`（`:67-74`）：无 0 短路（0 走回退分支返回默认 140，`:69`）；取整夹到 [80,200]（`:70-73`）。
3. `normalizeCompactMinHeight`（`:77-84`）：同构，回退默认 60，夹到 [40,101]（`:79-83`）。
4. `resolveCompactViewport`（`:92-102`）：`threshold` 非有限或 `<=0` 恒 false（关闭，`:97`）；`viewportHeight` 非有限数保持 `previous` 不变（`:98`）；迟滞分支 `previous ? viewportHeight < threshold + 60 : viewportHeight < threshold`（`:99-101`，进入用 threshold、退出需高出 threshold+COMPACT_EXIT_HYSTERESIS_PX）。
5. `resolveComposerMaxHeight`（`:110-127`）：`manuallyCollapsed` 最优先返回 101（`:116`）；非紧凑档展开 500/默认 200（`:117-119`）；紧凑档 `compactDefault = Math.min(200, normalizeCompactMaxHeight(compactMaxHeight))`（`:120-123`），返回展开档 `Math.min(500, compactDefault*2)` 或默认档 `compactDefault`（`:124-126`）。
6. `resolveComposerMinHeight`（`:135-144`）：非紧凑档 101（`:139`）；紧凑档 `Math.min(101, normalizeCompactMinHeight(compactMinHeight))`（`:140-143`），空内容可见高度即此值。

## 4. 调用者与调用链

- 入向（冻结树全量 grep 15 个导出符号 + 路径串 `composer-compact-height`）：
  - `apps/electron/src/renderer/atoms/ui-preferences.ts:8-15`（import 3 常量 + 3 归一化函数）：设置载入归一化 `apps/electron/src/renderer/atoms/ui-preferences.ts:62-64`、补丁写回归一化 `apps/electron/src/renderer/atoms/ui-preferences.ts:119,122,125`、默认值 `:40-42`。
  - `apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:32-36`（import 3 resolve 函数）：初始判定 `apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:136`、状态更新判定 `:140`、`resolveComposerMaxHeight` `:832`、`resolveComposerMinHeight` `:839`。
  - `apps/electron/src/renderer/components/settings/UsageSettings.tsx:68-80`（import 11 个符号）：草稿归一化 `apps/electron/src/renderer/components/settings/UsageSettings.tsx:217-219,229,238,247`、设置项描述与范围常量 `:426-449`。
  - 测试 import：`apps/electron/src/renderer/lib/composer-compact-height.test.ts:2-17`。
- 出向：无 import 语句（纯模块）；运行时仅 `Number`/`Number.isFinite`/`Math.round/min/max` 运算。无 IPC/Worker/动态 import。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}`；未命中处均为注释字符串（`rich-text-input.tsx:130` 注释提及 `resolveCompactViewport`）。

## 5. 数据 I/O、读写与副作用

纯函数模块（与有状态模块区分）：6 个导出函数对相同输入恒等输出，无模块级 let/Map/缓存（依据：全文无模块级可变绑定）。副作用：无——不触碰 DOM、不定时器、不发 IPC、不读写存储，仅数值运算。紧凑档布尔状态与窗口高度采集在调用方（`apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:136-140` 与 `useWindowInnerHeight` hook）。

## 6. 分支、失败、取消与恢复

- 边界条件：阈值 `0` 是唯一"关闭"合法值（`:57`），上限/最小高度的 0 都回退默认（`:69,:79`）；`-1`/NaN/非数字串/`null`/`undefined` 一律回退默认（`:59,:69,:79`）；字符串数字合法（`'900'`→900）；统一 `Math.round` 取整（`:62,:72,:82`）；`viewportHeight` 非有限数时维持 `previous`（`:98`）；紧凑档 max-height 内部再归一化防脏（`:122`）；紧凑展开档封顶 `min(500, 2×上限)`（`:125`）。
- throw/返回约定：无显式 throw（全文无 throw 语句），非法输入全部走回退分支返回合法数值。
- 竞态/取消：纯函数无并发状态，无取消概念；迟滞的 `previous` 由调用方 setState 串行提供（`rich-text-input.tsx:140`），拖拽窗口期间不会因单帧抖动反复跳档（测试 `composer-compact-height.test.ts:91-102` 锁定单次切换）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。无权威状态；设置值来源（`inputCompactViewportHeight` 等）的持久化权威在调用方设置层（`apps/electron/src/renderer/atoms/ui-preferences.ts:62-64`）。

## 8. 修改影响面

- `apps/electron/src/renderer/atoms/ui-preferences.ts:62-64,119-125`（三个设置值的读写归一化 → 设置持久化数据洁净性）。
- `apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:136,140,832,839`（输入框实际高度渲染与紧凑档切换）。
- `apps/electron/src/renderer/components/settings/UsageSettings.tsx:217-247,426-449`（设置表单校验、范围文案与默认值展示）。
- 阈值/区间/默认常量改动会连带影响设置 UI 文案（模板字符串内插，`UsageSettings.tsx:426,435,444`）与测试断言（`composer-compact-height.test.ts:21-138` 多处以常量为期望值）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/composer-compact-height.test.ts`：机械计数 `test(` = 16、`it(` = 0、`describe(` = 5。真实断言（expect 行）：`:21-25,29,33-37`（阈值归一化三分支）、`:43-45,49-51`（上限归一化）、`:57-59,63-65,69-72`（最小高度归一化与 `resolveComposerMinHeight`）、`:78-80,85-88,100-101,105-107`（迟滞判定与抖动单次切换）、`:113-138`（`resolveComposerMaxHeight` 四组档位）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 个导出符号、三归一化 + 迟滞 + 双高度解析语义 | 已证实 | `apps/electron/src/renderer/lib/composer-compact-height.ts:1-144` 全文 |
| 迟滞消除阈值附近反复切换 | 已证实 | `:92-102` 逻辑 + `composer-compact-height.test.ts:91-102` 断言（非运行） |
| 三个调用方接线（ui-preferences/rich-text-input/UsageSettings） | 已证实 | §4 所列 import 与调用行（域外静态检索） |
| "不加过渡动画"手段的实现 | 未知 | 在 rich-text-input.tsx 的样式层（域外），本文件不含样式代码 |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `normalizeCompactViewportHeight`（0/非法/夹取） | §3,§9 | `composer-compact-height.ts:56-64` | covered |
| `normalizeCompactMaxHeight` | §3,§9 | `composer-compact-height.ts:67-74` | covered |
| `normalizeCompactMinHeight` | §3,§9 | `composer-compact-height.ts:77-84` | covered |
| `resolveCompactViewport` 迟滞三分支 | §3,§9 | `composer-compact-height.ts:92-102` | covered |
| `resolveComposerMaxHeight` 四档位 | §3,§9 | `composer-compact-height.ts:110-127` | covered |
| `resolveComposerMinHeight` | §3,§9 | `composer-compact-height.ts:135-144` | covered |
| 9 个导出常量 | §2,§9 | `composer-compact-height.ts:17-48` | covered（测试以常量为期望值） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
