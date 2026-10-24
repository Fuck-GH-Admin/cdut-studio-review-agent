---
path: apps/electron/src/renderer/components/content-review/TemplateWizardPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b77ebe730c0ba8394f5eb88a73679459dc0388f3
sha256: 86f76cd143d2d7da4e9c2a9bab57dd1c13d5fe7a6073aa6f18b54f5ad2af7dad
lines: 733
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/TemplateWizardPanel.tsx

## 1. 结论与边界

**审核模板库与编辑器**（`TemplateWizardPanel.tsx:1`）：案卷字段/材料槽/综测分项/审核标准/流程全界面配置。发布语义红线：**模板只有发布后才进入"本案审核模板"；参考范本须复制并按本单位制度确认再发布**（`:334`）；**模拟场景只生成可编辑草稿，不自动认定学校制度、不安装到原生 V3 Case**（`:351-353`）；**草稿不直接进审核，防未确认示例标准被当成正式规则**（`:353`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TemplateWizardPanel` | function（export） | `:129-733` | 模板库+编辑器 |

内部常量表：`FIELD_KINDS`/`STAGE_KINDS`（7 种）/`ROLE_OPTIONS`（5 角色）/`MATERIAL_KINDS`/`OUTPUT_KINDS`/`OUTPUT_AUDIENCES`（`:22-48`）；`newTemplate`（blank/comprehensive 双骨架 `:58-96`，综测含 6 字段+申报表+分项证明槽+三段流程）、`reordered`/`normalizeOrder`/`validateEditor`（**:110-123**：名称/字段 key 唯一/必需分项须有标准/标准标题要求非空/材料槽非空/至少一流程节点；**forPublish 时追加 validateT01TypedCriteria** `:121`）、`linkedStages`（顺序连线 `:125-127`）。

## 3. 内部逻辑与关键流程

### 3.1 库管理（`:144-326`）

三列表并取（latest/versions/archived `:146-150`）；新建/场景起草（`createT01Scenario` `:164-168`）；配置导入（**2MB 限** `:172`）/导出（`:179-188`）；打开（**非 draft 自动 fork 新版本** `:190-194`）；范本复制（`copyT01TemplateConfiguration`→`saveTemplateDraftV2` `:196-213`）；删除（**历史案卷仍可读取原版本可恢复** `:308`）/恢复（`:319-326`）；四分类过滤（published 显示已发布版本 `:297-305`）；版本历史（**已发布不可覆盖** `:409`）。

### 3.2 编辑器（`:432-729`）

- 基本信息（`:449-467`）；**综测分项起点提示「模板不会替你编造综测政策」**（`:445-447`）；范本复制稿提示须用正式依据核对（`:467`）。
- 字段（`:469-512`）：key/label/kind/归属（case/subject/分项）/必填/enum 选项/数字单位与上下限/**条件必填**（`ReviewV3T01ConditionEditor`，条件设置时清 required `:504-506`）。
- 分项与标准（`:514-616`）：每条标准独立检查（`:516`）；执行方式三选（Agent/人工/程序计算 `:552`，**deterministic 互斥 dataCheck 与数值规则** `:544-550`）；检查范围三选；数值规则（`ReviewV3T01NumberRuleEditor`+「改回工作簿核对」`:564-577`）；数据检查（sheet-sum-match/sheet-unique-values+列配置+停止标签；**未识别值要求确认不按 0 计算** `:602`）；删除分项联动删字段/槽（`:533-536`）。
- 材料槽（`:618-654`）：编号/用途/归属分项/要素/类型勾选/份数/提交时间（submission|decision）/事项共用/**条件要求材料**（`:646-648`）。
- 评分量表（`:656-681`）：缺评策略 block/exclude、最低有效评委、维度（min/max/weight）。
- 输出（`:683-695`）与流程（`:697-718`）：节点顺序即流转（保存时连线 `:699`）、退回节点、执行人。
- 试跑（`ReviewV3T01TrialPanel` `:720`）；**保存/发布仅 draft 可用**（`:725-726`）；「发布后版本不可覆盖，修改创建新版本」（`:723`）。

## 4. 调用者与调用链

入向：模板区。出向：T01 全家（TrialPanel/AuthoringLaunchpad/ConditionEditor/NumberRuleEditor/typed-criteria/template-portability/versioning）、`./V2CasePanel` 原子、`window.reviewAPI` 10 接口（含 `requestT01ModelDraft` 模型端口「渠道与凭据在 Main」`:357-361`）。

## 5. 数据 I/O、读写与副作用

写：模板草稿/发布/删除/恢复/排序（Main）；下载/导入配置。

## 6. 分支、失败、取消与恢复

校验问题列表展示（`:721`）；保存失败 toast+message。不适用取消/恢复。

## 7. 权限与权威状态

红线：发布门槛（`:334/:353`）、范本≠校内政策（`:467`）、模型端口凭据在 Main（`:357`）、发布不可覆盖（`:409/:723`）。

## 8. 修改影响面

改面板 → 模板全配置面；validateEditor 变化牵动发布门槛。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `TemplateWizardPanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+配置全链+发布门槛 | 已证实 | 逐行读 `:1-733` |
| reviewAPI 模板实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 库管理 | §3.1 | `:144-326` | covered |
| 编辑器全节 | §3.2 | `:432-729` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
