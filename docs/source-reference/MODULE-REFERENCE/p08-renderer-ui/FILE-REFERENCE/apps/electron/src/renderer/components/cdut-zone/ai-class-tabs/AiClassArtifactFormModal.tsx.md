---
path: apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassArtifactFormModal.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d9f9d99d6848ca75e1f01aed29b778daa63e17e7
sha256: 7cc62d9e3680c643bac7cd3fce3c308461219839b07eb0de827f362f0efb68e7
lines: 153
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassArtifactFormModal.tsx

## 1. 结论与边界

学习工件生成参数配置弹窗（文件头 `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassArtifactFormModal.tsx:1-6`）：首页三入口（脑图/抽认卡/测验）唤起，按类型呈现参数表单，确认后提交生成请求（双轨联动）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AiClassArtifactFormModal` | 组件（导出） | 31-153 | `{kind,onCancel,onConfirm}` |
| `TITLE`/`DESC` | 内部常量 | 24-29 | 类型标题/描述（quiz「一阶逻辑互斥约束杜绝干扰项事实重叠」、flashcard「最小信息原则+FSRS-7」） |
| `FIELD_CLASS` | 内部 | 21-22 | 输入统一样式 |

## 3. 内部逻辑与关键流程

状态：`focusedTopic`（选填）、`cardMode`（concise 5-8/standard 10-15/in_depth 20+，`:81-83`）、`difficulty`（easy/medium/hard）、`questionCount`（1-50 clamp，`:109`）、`types`（single/multiple/boolean 多选，`toggleType` `:39-41`）。`submit`（`:43-56`）按 kind 组装 `StudyGenerateArtifactInput`：flashcard 带 cardMode+difficulty；quiz 带 questionCount+difficulty+questionTypes（空回退 `['single']`）；mindmap 仅 base。`useGlobalOverlay(true)`（`:32`）。

## 4. 调用者与调用链

入向：AI 速课堂首页三功能入口；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@profer/ui/primitives/dialog`、`@profer/shared`（类型）、jotai overlay。

## 5. 数据 I/O、读写与副作用

纯表单；回调交父级提交；全局 overlay 登记。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| kind 分型 | 表单字段/提交载荷分派 | 49-55,77-139 |
| questionCount 越界 | clamp 1-50 | 109 |
| types 空 | 回退 single | 52 |
| 关闭 | onCancel | 59 |

## 7. 权限与权威状态

生成参数权威=表单提交载荷（`focusedTopic` 空=覆盖全部资料，`:72` 描述）。

## 8. 修改影响面

改表单影响生成请求参数。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 分型提交载荷 | 已证实 | `:43-56` |
| clamp/回退 | 已证实 | `:52,109` |
| 真实生成流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 21-153 | covered |
| 断言 | §9,§10 | — | unknown |
