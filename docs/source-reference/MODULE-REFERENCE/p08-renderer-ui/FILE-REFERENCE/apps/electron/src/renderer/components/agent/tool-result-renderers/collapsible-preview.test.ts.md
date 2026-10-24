---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/collapsible-preview.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d716c5483ba5c41128d938a77b51a57ec7c31a97
sha256: 94df7b9c63d07ff9107a493ed356dd40887a4123dae368f8924e15080917f846
lines: 304
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/collapsible-preview.test.ts

## 1. 测试目标

直接测试 `collapsible-preview.ts` 四导出（sliceResultPreview/sliceResultWindow/canRevealByStep/describeRevealProgress）：折叠判定、窗口切片、递进按钮可见性、进度度量、foldByLines=false 退化。32 个 `test(`，5 个 describe（`:7`/`:75`/`:168`/`:206`/`:253`）。夹具与 CollapsibleResult 默认值对齐（`:4`/`:68` 注释：maxChars 3000/previewLines 15）。

## 2. 用例清单（按 describe 摘要；Given/When/Then 命名）

**A 预览（8 例 `:8-65`）**：短内容不折叠原样；超长单行折叠封顶 3000；行超限保前 15 行；双超限先截行再封顶；**恰好等于上界不折叠**（`:38-42`）；CRLF 不翻倍不残留 `\r`；**代理对截断不产生孤立代理**（😀×4 maxChars 5→'😀😀'，反例 `charCodeAt(4)===0xd83d`）；负 maxChars→空预览。

**B 窗口（9 例 `:76-165`）**：初始态与 sliceResultPreview 完全一致；推进 65 行按行渲染仍标片段；∞ 全展开全文非片段；**单行超长全展开突破字符上界**（637_891 长度断言）；单行无行可递进；行不足仅字符封顶；步长超剩余收敛到总行数；CRLF 全展开 length 断言（归一化去 `\r`）；未超限无控件。

**C 递进按钮（5 例 `:169-203`）**：剩余>步长→提供；<步长→只留全部展开；**恰等步长→合并**（`:183-189`）；step 0/-1→不提供；单行超长→不提供。

**D 进度（4 例 `:207-244`）**：行度量（15/801/786）；递进后剩余减少；单行超长字符度量（3000/637_891/634_891）；全展开剩余 0。

**E foldByLines=false（6 例 `:254-303`）**：40 行但字符未超→不折叠全文；字符超→封顶；**与默认按行折叠对比**（`:271-275`）；全展开拿全文；进度字符度量；全展开剩余 0。

## 3. 真实断言

`toBe`/`toHaveLength`/`toEqual`/`not.toContain`/`toBeGreaterThan`/`toBeLessThan`/精确长度与整数断言。无快照测试、无 mock。

## 4. 未覆盖（子agent U 摘要）

`content??''` 空值；`0≤revealedLines<previewLines` 潜伏区间（矛盾②所在）；foldByLines=false 有限值>previewLines 中间语义；sliceAtBoundary 极角（maxChars=1 高位代理/孤立代理）；非整数参数；visibleLines 字符封顶语义；preview-open-button/pierre-styles 整体零测试。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 32 个 `test(`、断言如 §2 | 已证实 | 文件全读（304 行） |
| 夹具与 CollapsibleResult 默认值一致 | 已证实 | `:5`/`:69` 对拍 `:80-81` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 预览判定/切片 | §2 A | covered |
| 窗口语义 | §2 B | covered |
| 递进/进度 | §2 C/D | covered |
| foldByLines=false | §2 E | covered |
| §4 边缘 | — | — | unknown |
