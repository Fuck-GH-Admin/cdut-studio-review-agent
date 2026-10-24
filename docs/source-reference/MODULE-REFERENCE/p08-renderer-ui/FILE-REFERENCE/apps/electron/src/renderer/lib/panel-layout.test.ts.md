---
path: apps/electron/src/renderer/lib/panel-layout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 046870b697ccd3c7964e5a4eb676b1c38098410d
sha256: e758483bb0a07b085c54624fa8adf9b24b34aa27a5d12b65f8a5365a1a570e3e
lines: 141
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/panel-layout.test.ts

## 1. 测试目标

验证 `./panel-layout` 纯函数层的宽度预算与文件面板可见性判定：`layoutNeed` 各组合、`computeVisibility` 的收起/展开阈值与 50px 滞后带、`mainAreaNeed` 的栏数计算与非法回落、`PANE_SPLIT_GAP` 与渲染侧 `GROUP_SPLIT_GAP` 的同值契约。被测对象是纯函数，无 UI/无 IPC。bun:test 框架（`apps/electron/src/renderer/lib/panel-layout.test.ts:1`），共 **18 个 `test(`**（实测计数，无 `it(`、无 `test.each`）。

## 2. 用例清单

依赖顺序：无序（纯函数、无共享可变态）；夹具 `full`/`fpOnly`/`none`/`hidden`/`shown`（`:17-22`）。

| # | 用例（describe/test） | 设置 | 动作 | 断言（行） |
| --- | --- | --- | --- | --- |
| 1-3 | `layoutNeed 各组合` | full/none/fpOnly | `layoutNeed` | :26-29=1036、:33-34=436、:38=736 |
| 4 | 宽窗全开可见 | full, shown | `computeVisibility(1400,…)` | :45 toEqual `{filePanel:true}` |
| 5 | 滞后带生效 | full, hidden | 1085/1086 | :50-51 false/true |
| 6 | 窄窗隐藏 | full, hidden | 700 | :56 toEqual `{filePanel:false}` |
| 7 | 无意图恒隐藏 | `{...full,filePanel:false}`, shown | 1400 | :61 false |
| 8 | 侧栏抬阈值 | full, hidden | 1086/1085 | :67-68 true/false |
| 9-12 | `mainAreaNeed 按主区栏数` | 1/2/0/-3/1.7 | `mainAreaNeed` | :76-77=420、:81-82=848、:86-88 均=420 |
| 12 | gap 同值锁 | — | `PANE_SPLIT_GAP` vs `GROUP_SPLIT_GAP` | :92 toBe |
| 13 | 组合+文件面板 1400 | groupNoSidebar, shown | `layoutNeed`+`computeVisibility` | :102=1164、:103 true、:105=736 |
| 14 | 组合+左栏+文件面板让位 | groupWithSidebar, shown | 1400/1464 | :110=1464、:111 false、:112 true |
| 15 | 组合恢复需滞后带 | groupWithSidebar, hidden | 1463/1514 | :116 false、:117 true |
| 16 | 组合解散恢复 | hidden | 1400（组合→单栏） | :122 false、:123 true |
| 17 | 防抖动单次切换 | layout, hidden/shown | 785/786/737/735 | :131-135 四断言 |
| 18 | `HYSTERESIS===50` | — | 常量 | :139 toBe |

## 3. 真实断言

均为真实 `expect`（无 mock、无 spy、无 fake timer）：
- 公式+数值双断言风格，如 `expect(layoutNeed(full)).toBe(CONVERSATION_MIN_WIDTH + SIDEBAR_WIDTH + FILE_PANEL_MIN_WIDTH + GAP_BUFFER)` 与 `.toBe(1036)`（`apps/electron/src/renderer/lib/panel-layout.test.ts:26-29`）。
- 边界断言：滞后带临界 1085/1086（`:50-51`）、1463/1514（`:116-117`）、785/786/737/735（`:131-135`）——精确到 1px 的开闭区间。
- 整体形状断言 `toEqual({ filePanel: true })`（`:45`）。
- 跨模块契约断言 `expect(PANE_SPLIT_GAP).toBe(GROUP_SPLIT_GAP)`（`:92`）：真 import `@/atoms/tab-group-atoms`（`:15`），取真实常量 `GROUP_SPLIT_GAP=8`（`apps/electron/src/renderer/atoms/tab-group-atoms.ts:76`），**无 mock 边界**——这是防「只改一边」的回归锁。

## 4. 未覆盖与脆弱点

未覆盖：`mainAreaNeed(3)` 及以上多栏预算；`layoutNeed` 的 sidebar-only 组合（仅侧栏 736）；`computeVisibility` 在 `mainPaneCount>2` 的阈值分支；`prev.filePanel=true` 且 A=false 的组合（`:59-62` 用 shown 测过无意图，但 A 真/prev 假+意图假未单列）。
脆弱点：期望值大量硬编码（1036/436/736/848/1164/1464/1086/1514/786），常量有意调整时需同步改测试（这同时是回归保护）；`:65` 注释推导（436+300+300+50）与 `:101`（848+16+300）等算例必须与实现公式保持一致。
无依赖顺序、无并发/异步用例、无失败/恢复路径用例（纯函数不适用）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 个 `test(`（实测计数） | 已证实 | `grep -c '^\s*test('` = 18（本文件，全文件逐行读 1-141） |
| 断言行引用真实存在且为 expect | 已证实 | `panel-layout.test.ts:26-140` 逐条读 |
| `GROUP_SPLIT_GAP=8` 真实来源 | 已证实 | `apps/electron/src/renderer/atoms/tab-group-atoms.ts:76` |
| 无 mock/无测试隔离选项 | 已证实 | 本文件无 `mock`/`spy`/`setSystemTime` 等（1-141 逐行读） |
| 断言在真实运行下全绿 | 未知 | NOT_RUN：本轮未执行 bun test，不得写作「测试通过」 |
| `@/atoms` 别名解析配置 | 推断 | 由 `apps/electron/tsconfig.json`/bunfig 别名机制解析，本文件仅见证据 `panel-layout.test.ts:15` |

## 6. 覆盖表

| 被测符号/分支 | 手册章节 | 测试行 | 状态 |
| --- | --- | --- | --- |
| `layoutNeed` 三组合 | §2 #1-3、§3 | 25-39 | covered |
| `computeVisibility` 收起/展开阈值 | §2 #4-8、§3 | 43-69 | covered |
| `computeVisibility` 滞后带 | §2 #5,15,17、§3 | 48-52,115-118,128-136 | covered |
| `mainAreaNeed` 1/2 栏+非法回落 | §2 #9-11、§3 | 75-89 | covered |
| `PANE_SPLIT_GAP`↔`GROUP_SPLIT_GAP` | §2 #12、§3 | 91-93 | covered |
| 组合（mainPaneCount=2）预算 | §2 #13-16、§3 | 96-125 | covered |
| `HYSTERESIS` 常量 | §2 #18 | 138-140 | covered |
| 多栏（3+）/sidebar-only | §4 | — | unknown（未覆盖，已声明） |
