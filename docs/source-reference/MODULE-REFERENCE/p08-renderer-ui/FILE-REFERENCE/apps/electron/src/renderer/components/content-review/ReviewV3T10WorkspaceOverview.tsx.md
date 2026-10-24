---
path: apps/electron/src/renderer/components/content-review/ReviewV3T10WorkspaceOverview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8ecdd896ca3baedb954da4350bb832e33f359d55
sha256: 1b5eadfe786de9817a774bd6e39ab5491fdfbad848727789ea92e56498a1ddd4
lines: 137
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T10WorkspaceOverview.tsx

## 1. 结论与边界

**T10 单案产品导航摘要**（`:1-4` 注释）：只投影当前 V3 案卷/Run/模板/待办，**绝不建立另一套持久状态或业务决定**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T10WorkspaceOverview` | function（export） | `:45-137` | 五个 onOpen* 导航回调（Props `:29-35`） |

内部：`STAGES` 8 阶段文案（`:23-28`）、`StatusItem`（`:37-43`）。

## 3. 内部逻辑与关键流程

1. 聚合选择（**:52-54，业务面板激活时显示其真实聚合，不把另一案卷 Run/来源混到旧案卷**）；`matchesSelected` 不匹配则清 run/extracted/template（`:63-65`）。
2. 状态条：材料数（active 过滤 `:66`）/检查（执行中/过期/计数/无记录四态 `:75-78`）/业务阶段；模板名（pending-template-v3→「尚未绑定审核模板」`4 分支` `:69-73`）。
3. **下一步决策树**（`:81-114`）：decided→办理记录（**「已完成决定不表示每项 AI 发现均被确认」** `:87`）；未绑模板→配置（**「不能将草稿当成正式规则」** `:91`）；零材料→添加；执行中→进度；无 Run/过期→工作台（历史案卷提示 `:103`）；有待办→处理（n 项）；否则→业务办理（**「自动检查完成不等于正式决定」** `:111`）。

## 4. 调用者与调用链

入向：工作台顶部。出向：`@/atoms/review-atoms`（9 原子）、`./V2CasePanel`（reviewV2AggregateAtom）、`./review-workspace-view-model`。

## 5. 数据 I/O、读写与副作用

纯投影；导航回调。

## 6. 分支、失败、取消与恢复

决策树 7 分支（§3）。不适用。

## 7. 权限与权威状态

红线：零持久状态/决定（`:3`）；不混案卷（`:52-53`）；决定≠确认（`:87/:111`）。

## 8. 修改影响面

改摘要 → 导航文案与下一步推荐口径。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T10WorkspaceOverview` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+决策树 | 已证实 | 逐行读 `:1-137` |
| atoms/视图模型 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+决策树 | §2/§3 | `:45-137` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
