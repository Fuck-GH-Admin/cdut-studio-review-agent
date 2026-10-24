---
path: packages/ui/src/mermaid-detection.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11c02c547bf93ad24bf1fdb00b6002dc1af1b679
sha256: 5111a4b4285deedb0ec5a5fa5a2fe1ac12f178dc24fbaa8b5ec26dbae1dc7b43
lines: 66
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/mermaid-detection.test.ts

## 1. 测试目标

两主题单测（文件头 `packages/ui/src/mermaid-detection.test.ts:1-3` 自述 §7.2）：①思维导图代码块识别与 Mermaid 识别边界（`mermaid-detection.ts`）；②全局 z-index 阶梯（`z-layers.ts`）。被测对象主手册见 `mermaid-detection.ts.md` 与 `z-layers.ts.md`。

## 2. 用例清单

共 **8 个 `test()`**，2 个 describe（经 `./index` 导入 5 符号，`:5-12`）：

| describe | 用例 | 行 |
| --- | --- | --- |
| `shouldRenderMindMapCodeBlock`（6） | 显式类命中 / mermaid 类不命中 / 无类首行命中 / 不误判 / isMindMapLanguage / 不冲突 | `:15-43` |
| 全局渲染图层标准阶梯（2） | 阶梯单调有序 / 类名与数值对应 | `:47-65` |

## 3. 真实断言

- `shouldRenderMindMapCodeBlock('language-mindmap','anything')` `toBe(true)`（`:16`）；`('language-mermaid','mindmap\n  a')` `toBe(false)`（`:20`）；`(undefined,'mindmap\n  root\n    a')` 与 `(undefined,'  mindmap\n a')` `toBe(true)`（`:24-25`）；`(undefined,'const x = 1')` false、`('language-js','mindmap')` false（`:29-30`）。
- `isMindMapLanguage`：`'mindmap'`/`'MINDMAP'` true、`'mermaid'` false（`:34-36`）。
- 不冲突（`:40-42`）：mindmap 内容 + `language-mermaid` → `shouldRenderMermaidCodeBlock` true 且 `shouldRenderMindMapCodeBlock` false。
- z 阶梯（`:48-56`）：9 条 `toBeLessThan` 单调断言（canvas<toolbar<chrome<shellContent<shellResizer<dialog<confirm<fullscreen<lightbox<menu<tooltip）；类名断言 5 条 `Z_LAYER.x` `toBe(\`z-[${Z_INDEX.x}]\`)`（`:60-64`，dialog/confirm/fullscreen/lightbox/tooltip）。

## 4. 未覆盖与脆弱点

- 未覆盖：`looksLikeMermaidDefinition`（方向模式/注释跳过）、`shouldInspectMermaidCodeBlock`、`isMermaidLanguage`；z 阶梯的 shellRail/shell/shellTopDrag/menu/overlay 档位。
- 脆弱点：阶梯断言只查有序与 5 对对应，`menu===overlay===9999` 未锁定；`'  mindmap\n a'` 的前导空格行为被断言（依赖 `trimStart/trim`，`:98-99` 实现）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §3 | 已证实 | 逐行读 `:1-66` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| mindmap 判定四分支 | 6 用例 | covered |
| Z 阶梯单调/类名对应 | 2 用例 | covered |
| mermaid 方向模式/inspect | — | unknown |
