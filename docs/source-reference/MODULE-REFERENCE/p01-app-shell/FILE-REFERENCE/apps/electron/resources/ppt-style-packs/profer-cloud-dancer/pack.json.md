---
path: apps/electron/resources/ppt-style-packs/profer-cloud-dancer/pack.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8a44fe29871d82806e03204138677cd6308396e
sha256: dd88d8ccba27032ff09299096744f4c9424492eb863c2c9407239ea85a4289d4
lines: 93
kind: config
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/ppt-style-packs/profer-cloud-dancer/pack.json

## 1. 结论与边界

**PPT 风格包配置**（93 行 JSON，schemaVersion 1）：`profer-cloud-dancer`——暖纸/云朵/月牙/轻盈动势柔和编辑风格（`:5`，适合学生汇报）。纯声明式。

## 2. 导出与关键符号

无导出（配置数据）。顶层 9 段：`tokens`（8 色含 clay/cloud/shadow、typography 行高 1.16、cornerRadius=0.12）、`layoutGrammar`（10 角色三密度，云/拱/月牙母题布局 `:32-43`）、`motifs` 5 个（cloud-cluster≤4/arch≤3/crescent≤2/dancer-motion≤1/paper-texture 不可编辑 `:44-50`）、`chartLanguage`（3 series/annotationStyle=clay-pill-and-rule `:51-59`）、`imageDirection`（avoid 全幅海报/暗企业图/霓虹渐变 `:60-65`）、`narrativeRhythm`（densitySwing=gentle/每 3 章换气 `:66-71`）、`qaProfile`（文本比≤0.4/禁 full-slide-dancer-on-content 等 4 项/required 3 项 `:72-79`）、`editorialPolicy`（general-editorial/narrative 标题/requireMetricDefinition=false/requireConclusionBoundary=false `:80-88`）、`preview`。

## 3. 内部逻辑与关键流程

不适用（声明式）；消费方=PPT 生成链。与 academic-editorial 同 schema 双风格之一（编辑策略差异：scientific vs general）。

## 4. 调用者与调用链

- 入向：PPT 技能风格包加载器（域外）。
- 出向：无。

## 5. 数据 I/O、读写与副作用

无（配置）。

## 6. 分支、失败、取消与恢复

不适用（声明式）。

## 7. 权限与权威状态

视觉规范权威=qaProfile/editorialPolicy；motif-locality/soft-negative-space 为 required（`:78`）。

## 8. 修改影响面

Profer Cloud Dancer 风格生成与 QA 判定面；两包差异点（编辑策略/换气节奏/文本比上限）是风格族配置基线。

## 9. 测试证据

`NOT_RUN`。无直接测试（配置）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 段结构/5 母题/编辑策略差异 | 已证实 | `:1-93` 全文 |
| 生成器消费行为 | 边界 | 域外 |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 段配置 | §2 | 6-92 | covered |
