# nb-127-r2 返修复验报告（QA：docs-r07-qa-extra-04-20261024）

- 批次：nb-127-r2（revisionOf nb-127-r1；11 文件 / 5201 行）
- 封版：sealId `seal-e6fbb27d09a01ef5`，sealedAt 2026-10-23T20:44:35Z
- **batchVerdict：`accepted`（13/13——11/11 文件全 accepted）**；G0 PASS / G1 PASS / G2 PASS

## 复验要点（4 findings 全闭）

- **QA-127-F02 resolved**：session-context.tsx.md「5 个调用点」→「4」三处（:51/:76/:91），并按 QA 备选项分开标注 `useConversationIdOptional` 软消费 2 处（useConversationSettings.ts:67、ModelSelector.tsx:147）——比要求更完整。after `b66316d8…` 实测吻合。
- **QA-127-F03 resolved**：globals.css.md「13 个 @keyframes」→「18 个」且 18 行号全列，与 QA 独立清单**逐行一致**（:970…:3071）；证据栏补 `grep -nE '^@keyframes' 复现 18`。after `98531a88…` 实测吻合。
- **QA-127-N01 resolved**：「364 规则块」补计数口径 `grep -cE '^\S.*\{$'`（含 At 开块 29 处）——**QA 实测复现 =364**，口径成立。
- **QA-127-N02 resolved**：main.tsx.md「五类/六类」统一为「6 路窗口分流（5 参数分支+主窗缺省）」四处（:19/:86/:101/:118），与源事实（1059-1150 分流表）一致。

## 修订面审计

恰 3 篇改动（session-context/globals/main.tsx.md，逐 diff 核对为定行数修订）；8 篇与 r1 逐字节一致。nb-127（`seal-542bc76a…`）/nb-127-r1（`seal-8cc163f7…`）旧 seal 未动。FINDINGS-RESPONSE 与 QA 复核对象对应准确，并正确澄清 r1 时间差。

## 逐文件 verdict

accepted 11/11（3 篇新 hash 复验 + 8 篇同字节重录）。acceptedHashes 见 RESULT.json。

## nb-127 链终态

r0 review(9/2) → r1 review(9/2, G0 自查修复+F 残留) → **r2 accepted(11/11)**，全 findings（F-02/F-03/N-01/N-02）关闭。

## NOT_RUN

产品测试/typecheck/构建/GUI/真实渲染（静态审查）。

## 边界

仅 nb-127-r2 复验；reviews/nb-127{,-r1}/ 历史保留。
