---
path: apps/electron/resources/ppt-style-packs/academic-editorial/pack.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3bcf975724ff6758ebef5e29367793147957c798
sha256: 3da41f46252ba20240f727b74c6a20718249f97caf28a549d43914b26fb0fbd5
lines: 90
kind: config
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/ppt-style-packs/academic-editorial/pack.json

## 1. 结论与边界

**PPT 风格包配置**（90 行 JSON，schemaVersion 1）：`academic-editorial`（Academic Editorial）——纸白/墨黑/单一强调色期刊式研究叙事（`:5`）。纯声明式 token/语法/QA 规则。

## 2. 导出与关键符号

无导出（配置数据）。顶层 9 段：`tokens`（canvas 13.333x7.5 英寸、7 色、typography 5 档+行高 1.12、grid 12 栏、lineWidthPt 3 档、cornerRadius=0）、`layoutGrammar`（10 角色×low/medium/high 三密度布局变体 `:31-42`）、`motifs` 3 个（evidence-marker≤4/accent-rule≤2/paper-grain 不可编辑 `:43-47`）、`chartLanguage`（4 series/对比度≥4.5 `:48-56`）、`imageDirection`（prefer/avoid 清单 `:57-62`）、`narrativeRhythm`（sequence/densitySwing=wide/每 4 章换气 `:63-68`）、`qaProfile`（minBody 13pt/文本比≤0.42/forbidden 5 项/required 3 项 `:69-76`）、`editorialPolicy`（scientific-editorial/requireMetricDefinition=true/requireConclusionBoundary=true/禁 3 类标题 `:77-85`）、`preview`（webp）。

## 3. 内部逻辑与关键流程

不适用（声明式）；消费方=PPT 生成链（按 layoutGrammar 选变体、qaProfile 门禁）。

## 4. 调用者与调用链

- 入向：PPT 技能风格包加载器（域外）。
- 出向：无（preview.webp 伴随资产）。

## 5. 数据 I/O、读写与副作用

无（配置）。

## 6. 分支、失败、取消与恢复

不适用（声明式）。

## 7. 权限与权威状态

视觉规范权威=qaProfile/editorialPolicy（required/forbidden 清单）；对比度下限 4.5（chartLanguage）。

## 8. 修改影响面

Academic Editorial 风格的生成与 QA 判定面；与 profer-cloud-dancer 包构成风格族两成员。

## 9. 测试证据

`NOT_RUN`。无直接测试（配置）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 段结构/数值/规则清单 | 已证实 | `:1-90` 全文 |
| 生成器消费行为 | 边界 | 域外 |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 段配置 | §2 | 6-89 | covered |
