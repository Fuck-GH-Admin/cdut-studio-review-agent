---
path: apps/electron/src/renderer/components/cdut-zone/AiClassCognitionModal.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9bde757c52941d10f97c8eeb03258405863442bd
sha256: 2acbed7a6672f08333227e106ce8a8f329ef360ea2f2d298437b7059cc6c344b
lines: 266
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassCognitionModal.tsx

## 1. 结论与边界

「认知底座」**双引擎配置弹窗**（266 行）：引擎一 课堂知识检索（精准查点/全书脉络与宏观演化）、引擎二 跨课联想终身记忆（当堂专注/海马体跨课联想）；卡片即点即存经 IPC 落盘，下一轮推理生效（`:2-9`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassCognitionModal` | `:96-266` | 唯一 export，无 props：双 section 卡片（适用场景/功能优势/性能预估三行要点）即点即存 |

内部：`CognitionOption:26-37`、`CognitionOptionCard:39-94`（选中 ring-2+「已启用」Check）；`studyOptions:101-130`（classic '精准查点'/graphrag '全书脉络'，性能"10MB~30MB/首字 +0.5~1.5 秒" `:123`）；`memoryOptions:132-161`（classic '当堂专注'/hipporag '海马体'，性能"15MB~40MB/Token +10%~25%" `:154`）。

## 3. 内部逻辑与关键流程

`updateStudyEngine:163-175`：同值早退→备份→**乐观写**→`updateSettings` IPC→回读归一（'graphrag'?'graphrag':'classic'）→成功 toast/失败**回滚+toast.error**；`updateMemoryEngine:177-189` 对称（'hipporag' 归一）。sr-only 标题；底部仅【完成】。

## 4. 调用者与调用链

`AiClassView.tsx:42/385`（无 props 常驻）；出向 study-retrieval-atoms、`window.electronAPI.updateSettings`（preload:609/2540 对拍）、sonner。

## 5. 数据 I/O、读写与副作用

IPC settings 写+atoms 乐观写/回滚+toast。

## 6. 分支、失败、取消与恢复

保存失败→回滚+toast.error（'认知底座设置保存失败'）；无 pending 态（连点竞态窗口小但存在，照实）。

## 7. 权限与权威状态

引擎语义权威在 settings（types/settings.ts:346/348 可选字段，归一化兜底 classic）；"全部在本地运行"（`:208` 文案）。

## 8. 修改影响面

改引擎选项影响检索/记忆行为；settings 契约联动 DeveloperSettings（三入口，矛盾 c）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件双引擎/提交链/回滚 | 已证实 | 266 行全读（IPC 契约实存对拍） |
| **(a)** toast.success 以 next 非回读值为准（归一化下等价，措辞照实）；**(b)** 即点即存无确认（与 GraphGenerateModal 交互模型不同，如实）；**(c)** 与 DeveloperSettings.tsx 同引擎读写但**互不刷新**（跨入口陈旧） | 已证实 | `:170`/`:184`、DeveloperSettings `:22-54` |
| settings-service 实现 | 未知 | 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/双引擎/提交链 | §2/§3 | covered |
| 3 矛盾 | §10 | covered |
