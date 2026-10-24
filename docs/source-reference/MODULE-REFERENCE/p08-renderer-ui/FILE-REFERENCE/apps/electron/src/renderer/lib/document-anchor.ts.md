---
path: apps/electron/src/renderer/lib/document-anchor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a812cd94d3185483835254c9da16cfe0207616e8
sha256: 376db96cf6a931ed863d73afc519dc750ae71065d8fd2de6a0e48e1e044567ca
lines: 41
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/document-anchor.ts

## 1. 结论与边界

**双轨定位胶囊共享口径**（41 行）：对话流 message.tsx 与速课堂 StudySourceTrace 单一来源（`:2`）。锚点模式串**收敛在 `@profer/shared/constants/document-anchor`** 与主进程系统提示词共用（杜绝提示词契约与前端解析口径漂移 `:4-5`）；此处仅保留渲染层图标推断。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `DOCUMENT_ANCHOR_RE` | `:18` | 完整锚点（锚定 `^...$` 供 href 精确校验；捕获组 fileId/页码块/页码） |
| `DOCUMENT_ANCHOR_IN_TEXT_RE` | `:21` | 文内扫描（非锚定；捕获组口径一致） |
| `pickAnchorIcon` | `:32-41` | 边界敏感图标推断：公式→Sigma/表格→Table2/插图→ImageIcon/默认 MapPin |

**边界敏感正则**（`:24-30` 注释）：负向后顾+词边界双约束——「发表/表现/列表」不误判表格、「意图/试图」不误判插图。

## 3. 内部逻辑与关键流程

两正则从 shared 模式串构造+图标三分派。

## 4. 调用者与调用链

`message.tsx`（MarkdownLink 溯源胶囊）、StudySourceTrace；出向 `@profer/shared`（模式串单一真源）、lucide-react。被 `document-anchor.test.ts`（3 个 `test(`）覆盖一致性。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

label 无命中→MapPin 兜底。

## 7. 权限与权威状态

**单一真源契约**（`:4-5`）：模式串只在 shared 维护，本层不复制（测试 `:6-8` 锁定 `.source === DOCUMENT_ANCHOR_PATTERN`）。

## 8. 修改影响面

改图标正则影响溯源胶囊视觉；模式串改动须走 shared（主进程提示词同源）。

## 9. 测试证据

`document-anchor.test.ts`（同批，3 个 `test(`：1 一致性+循环生成 8 合法/4 非法动态用例）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/单一真源契约/边界正则 | 已证实 | 41 行全读 |
| 一致性+接受/拒绝 | 已证实 | 测试 3 声明（13 动态用例） |
| shared 模式串实现 | 未知 | nb-45 批（已 seal）不在本批复述 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
