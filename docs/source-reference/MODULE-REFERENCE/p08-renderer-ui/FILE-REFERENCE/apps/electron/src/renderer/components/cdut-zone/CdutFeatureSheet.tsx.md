---
path: apps/electron/src/renderer/components/cdut-zone/CdutFeatureSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b066d6bbd1d55a66aab2fb5e66854bb99e98365
sha256: 721adb276d554a0f2f5918e5f696525c5f5265617c761d6439cdbf7a0cc1c0e2
lines: 86
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutFeatureSheet.tsx

## 1. 结论与边界

CDUT 专区右侧**业务域顶层抽屉**（86 行）：按 `feature.id` 动态装配业务域交互组件（today-schedule→ScheduleDomainSheet/grade-gpa→GradesDomainSheet/empty-classroom→ClassroomDomainSheet/final-exam→ExamDomainSheet，`:6-10`）；全局模态叠加登记保证抽屉展开时原生视口避让（`:11`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutFeatureSheet` | `:35-86` | `({feature, open, onOpenChange})`：`useGlobalOverlay(open)`（`:41`）；`renderContent:43-64`（switch 4 业务域+default"接入中"占位）；Sheet（side="right"、`sm:w-[680px]` `:70`）+Header（icon+title+desc 兜底文案） |

内部 props：`CdutFeatureSheetProps:29-33`（feature 可 null）。

## 3. 内部逻辑与关键流程

atom overlay 登记→switch 分发（id 来自 CdutQuickBar 契约）→Sheet 容器。default 分支占位"该业务域模块正在接入中"（`:59`）。

## 4. 调用者与调用链

CDUT 专区首页（QuickBar 点击联动）；出向 `@profer/ui`（Sheet 族）、`@/atoms/overlay-atoms`、`./CdutQuickBar`（类型）、`./sheets/*`（4 个业务域抽屉，批外）。

## 5. 数据 I/O、读写与副作用

overlay atom 登记；业务数据流在 sheets 内部。

## 6. 分支、失败、取消与恢复

feature null→renderContent null；未知 id→占位卡。

## 7. 权限与权威状态

`useGlobalOverlay` 全局模态叠加契约（`:40` 注释：原生 BrowserView 避让）；id↔业务域映射表即分发契约。

## 8. 修改影响面

新增业务域需在此登记 switch；改 overlay 影响智联万站避让。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件分发/overlay 契约 | 已证实 | 86 行全读 |
| 4 个 sheets 实现 | 未知 | `./sheets/*` 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；sheets/实效 unknown。
