---
path: apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 01e85163d1bddcca5e5d7862ecf4b796a898db5d
sha256: 8cf93680c00949b35fd95f9b4a4743bb3b481f5bcd43ce4c536fd884e93a8ff1
lines: 121
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx

## 1. 结论与边界

D4 受控候选的**场景编辑器**：加载固定候选目录，允许用户改审核对象（targets）、主场景与逐条件适用性，确认后通过 `onChange` 向上抛出一个 `D4ClientSelection`（`apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx:5-121`）。

运行时 UI 组件。文件注释定位为「受控候选的场景输入；只改变案卷选择，不改写冻结作者态」（`:4`）。

明确不做的事：

- **不安装计划**：只产出选择值，`attachD4TechnicalPlanV3` 由父级调用（`ReviewV3TemplateRoutingAssistant.tsx:92`、`ReviewV3LocalCandidateWorkbench.tsx:179`）。
- **不发布/不编辑模板**：候选来自 `listD4Templates()` 的只读目录（`:22-27`）。
- **不把缺件候选变成可用**：`selectionIssue` 非空的选项 `disabled`，建议带入选中的也会被跳过（`:32`、`:77-79`）。

## 2. 导出与关键符号

`export` 共 **1 个**（只有组件）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `D4CaseSetup` | 导出 function | `:5-121` | `({onChange, suggestedTemplateId}: {onChange: (v: D4ClientSelection\|undefined)=>void; suggestedTemplateId?: string}) => React.ReactElement` | 唯一导出 |

内部 state（`:9-14`）：`templates`、`templateId`、`draft`（JSON 字符串）、`confirmed`、`studentFixture`、`error`。

内部函数：`updateTarget`（`:48-52`）、`addObject`（`:53-63`）、`removeObject`（`:64-68`）。

## 3. 内部逻辑与关键流程

### 3.1 渲染期解析 `selection`（`:15-20`）

```ts
const template = templates.find(t => t.templateId === templateId)
let selection
try {
  const parsed = draft ? JSON.parse(draft) : undefined
  if (parsed && Array.isArray(parsed.targets) && parsed.targets.every(t =>
      t && typeof t.title === 'string' && (!t.conditions || (Array.isArray(t.conditions) &&
      t.conditions.every(c => c && typeof c.id === 'string' && typeof c.applicability === 'string')))))
    selection = parsed
} catch { /* 编辑时允许暂时不完整，禁止提交。 */ }
```

解析失败或结构不符 → `selection` 为 `undefined`，界面只显示「场景 JSON 格式不正确」（`:117`）与原始 JSON 编辑器（`:112-114`）。

### 3.2 目录加载（`:22-27`）

挂载时 `listD4Templates()` → `setTemplates`；失败 `setError(String(e))`。用 `active` 标志防止卸载后写入（`:23-26`）。依赖数组为空，只读一次。

### 3.3 建议带入（`:28-36`）

当 `suggestedTemplateId` 与目录都就绪时：找到该候选；**若不存在或 `selectionIssue` 非空则直接返回**（不覆盖用户当前选择，`:32`）；否则 `setTemplateId`、`draft = JSON.stringify(selection, null, 2)`、重置 `confirmed/studentFixture/error`。

依赖 `[suggestedTemplateId, templates]`。父级用 `key={preferred||'manual'}` 强制重挂载（`ReviewV3TemplateRoutingAssistant.tsx:231`），因此切换建议时会重建整个组件。

### 3.4 向上发射 `onChange`（`:37-46`）

```ts
let value
try {
  const selected = JSON.parse(draft)
  if (confirmed && template && !template.selectionIssue &&
      selected.templateId === template.templateId && selected.version === template.version &&
      Array.isArray(selected.targets))
    value = { selection: selected, useControlledStudentFixture: studentFixture }
} catch {}
onChange(value)
```

依赖 `[draft, confirmed, studentFixture, template, onChange]`。**每次依赖变化都会调用 `onChange`**：不满足条件时调用 `onChange(undefined)`，即「未确认 = 明确清空父级选择」。

**校验强度差异（已证实）**：渲染期 `selection`（`:19`）要求每个 target 的 `title` 是字符串、`conditions` 若存在则每项含字符串 `id`/`applicability`；而发射路径（`:41`）只要求 `Array.isArray(selected.targets)` 且 `templateId`/`version` 匹配。因此一份「JSON 可解析、templateId/version 正确、targets 是数组但元素缺 title」的草稿，在界面上不会渲染对象卡片（`selection` 为 `undefined`），但只要用户勾选确认，仍会被 `onChange` 作为有效选择发射给父级。

### 3.5 对象编辑（`:48-68`）

- `updateTarget(index, patch)`：无 `selection` 直接返回；否则重写 `targets[index]` 并 `setConfirmed(false)`（`:49-51`）——**任何编辑都会撤销确认**。
- `addObject()`：无 `selection` 返回；找第一个 `kind==='generic-object'` 的 target 作模板，找不到则 `setError('请先在完整场景 JSON 中定义一个业务对象及其来源')`（`:55-56`）；用 `objectKey+'-new-'+n` / `subjectId+'-new-'+n` 循环直到两者都唯一（`:57-59`）；`structuredClone(first)` 后替换 `objectKey`/`subjectId`/`title='待填写对象 '+(n-1)`（`:60`）；追加并 `setConfirmed(false)`、清 error（`:61-62`）。
- `removeObject(index)`：过滤掉该下标，`setConfirmed(false)`（`:66-67`）；**无二次确认**。

### 3.6 渲染（`:69-121`）

- 顶部黄字提醒「条件改变后请新建案卷」（`:70`）。
- 方案下拉：占位文案含「可用数/总数」（`:76`）；选项按 `domain · name` 展示，`selectionIssue` 非空时追加「· 不可用（原因）」并 `disabled`（`:77-79`）；`onChange` 时整份替换 `draft` 为该候选的 `selection` JSON，并重置 `confirmed`/`studentFixture`（`:72-75`）。
- 每个 target 一个 `fieldset`：名称输入、移除按钮（`:82-87`）；`objectKey`/`subjectId` 两个输入（`:88-91`）。
- 仅 `kind==='generic-object'` 且已选模板时显示主场景下拉（`template.primary`）与逐条件下拉（`:92-106`）；条件改为 `unknown` 时把 `decidedBy` 设为 `'undetermined'`，否则 `'reviewer'`（`:101`）。
- 「新增同类型审核对象」按钮与当前对象数（`:108-111`）。
- 完整 JSON 高级编辑（`<details>` + textarea）（`:112-114`）。
- `template.controlledStudentFixture` 时显示学籍快照勾选（`:115`）。
- 确认勾选「我已核对对象、场景、条件及其来源版本…」（`:116`）。
- 三条错误/提示：JSON 不正确（`:117`）、候选不可用（`:118`）、加载/新增错误（`:119`）。

## 4. 调用者与调用链

**入向（2 处）**

| 调用方 | 行 | 传入 |
| --- | --- | --- |
| `ReviewV3TemplateRoutingAssistant.tsx` | `:6`、`:231` | `key={preferred\|\|'manual'}`、`suggestedTemplateId={preferred\|\|undefined}`、`onChange={setSelection}` |
| `ReviewV3LocalCandidateWorkbench.tsx` | `:13`、`:346` | `onChange={setD4Selection}`、`suggestedTemplateId={routedD4TemplateId}` |

**出向**

| 目标 | 行 | 说明 |
| --- | --- | --- |
| `window.reviewAPI.listD4Templates()` | `:24` | preload `apps/electron/src/preload/index.ts:4827` → `LOCAL_D4_LIST_V3`；Main `review-v3-main-d4-local-plan.ts:78-80`（先 `assertC0ReviewMainSender`） |
| `onChange` | `:45` | 向上发射选择/清空 |

## 5. 数据 I/O、读写与副作用

- **输入**：`onChange`、`suggestedTemplateId`。
- **读**：D4 候选目录（一次）。
- **写**：仅本地 state 与 `onChange` 回调；无持久化。
- **副作用**：挂载即发一次 `listD4Templates` IPC；`onChange` 在依赖变化时可能被多次调用（每次渲染的 `template` 对象身份不变时不会，`draft` 变则会）。
- **并发**：无异步写；`active` 标志防卸载后 `setState`（`:23`、`:26`）。
- **幂等**：`listD4Templates` 幂等；`onChange` 幂等（纯值传递）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 目录加载失败 | `:25` | `setError(String(e))`，下拉为空 |
| 建议候选不存在/缺件 | `:32` | 静默跳过，不覆盖用户选择 |
| JSON 解析失败 | `:20`、`:44` | 渲染期 `selection=undefined`；发射期 `onChange(undefined)` |
| 未确认 | `:41` | `onChange(undefined)` |
| 无 `generic-object` 时新增 | `:56` | `setError('请先在完整场景 JSON 中定义一个业务对象及其来源')` |
| 编辑任何字段 | `:51`、`:62`、`:67`、`:74`、`:101`、`:113`、`:115` | 撤销 `confirmed` |
| 候选缺件 | `:77-79`、`:118` | 选项禁用 + 红字原因 |

**恢复**：无持久状态；重挂载（父级 `key` 变化）即重置。**不可恢复**：用户编辑到一半的 `draft`。

## 7. 权限与权威状态

- 本文件无 sender/role 检查；唯一的 IPC 是只读目录，Main 侧先 `assertC0ReviewMainSender(event)`（`review-v3-main-d4-local-plan.ts:78-79`）。
- 权威状态：候选是否可用由 Main 目录的 `selectionIssue` 决定（`D4ClientTemplate.selectionIssue`，`packages/shared/src/types/review-d2.ts:19`）；本文件只是展示与禁用。
- 前端门禁：`confirmed` + 模板匹配 + `!selectionIssue`（`:41`）决定是否发射；`targets` 结构决定是否能编辑（`:19`）。这些都不是授权——真正的安装校验在 Main（`LOCAL_D4_ATTACH_PLAN_V3` 要求原生草稿、未绑定模板，`review-v3-main-d4-local-plan.ts:81-95`）。

## 8. 修改影响面

- **两个调用方**（见第 4 节）：改 props 需同步；`onChange` 的「undefined 表示清空」语义被两个父级依赖（`setSelection`/`setD4Selection`）。
- **发射校验强度**（`:41` vs `:19`）：若收紧为与渲染期一致，会让当前可提交的部分草稿变成不可提交；若放宽渲染期，则界面会渲染缺字段卡片。二者应一起改。
- **`addObject` 的 `-new-N` 命名**（`:57-60`）：父级/ Main 若对 `objectKey`/`subjectId` 有格式校验，会受影响。
- **条件 `decidedBy` 联动**（`:101`）：`unknown → undetermined`，其它 → `reviewer`；这与 `D2ObjectConditionV1` 的类型约束一致（`packages/shared/src/types/review-d2.ts:30-37`）。
- **`key` 重挂载**：路由助手用 `preferred` 作 key（`ReviewV3TemplateRoutingAssistant.tsx:231`），改 key 语义会丢失用户编辑。
- 无存储格式/迁移。

## 9. 测试证据

**直接测试**：无。全树 `--include=*.test.ts/tsx/mjs` 检索 `D4CaseSetup` 命中 0。

**间接证据**：Main 侧 `review-v3-main-d4-local-plan.test.ts` 覆盖 `LOCAL_D4_ATTACH_PLAN_V3` 的安装行为（如 `:147-177`），但不渲染本组件。

**未覆盖**：两处解析路径的差异、建议带入、`addObject` 唯一性循环、条件联动、`onChange(undefined)` 语义。

**NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出为组件 | 已证实 | `grep -c "^export"` = 1；`:5` |
| 挂载时只读一次目录（单次挂载内） | 已证实 | `:22-27` 依赖 `[]` |
| 父级 `key={preferred\|\|'manual'}` 每次换建议会重挂载并重新 `listD4Templates` | 已证实 | `ReviewV3TemplateRoutingAssistant.tsx:231`（key 变化 → 整组件重建 → `:22-27` 再跑一次目录读取） |
| 缺件候选不可选、建议带入也会跳过 | 已证实 | `:32`、`:77-79` |
| 未确认时向上发射 `undefined` | 已证实 | `:41`、`:45` |
| 任何编辑都撤销 `confirmed` | 已证实 | `:51`、`:62`、`:67`、`:74`、`:113`、`:115` |
| 发射路径的校验比渲染路径弱（不校验 target 字段） | 已证实 | `:19` vs `:41` |
| 条件改为 unknown 时 `decidedBy='undetermined'` | 已证实 | `:101` |
| Main 目录的 `selectionIssue` 语义 | 已证实 | `packages/shared/src/types/review-d2.ts:19`；`D4CaseSetup.tsx:32`、`:41`、`:78`、`:118` |
| 弱校验草稿在真实 Main 安装时是否会被拒 | 未知 | 未读 `attachD4TechnicalPlanV3` 对 targets 的逐字段校验 |
| `onChange` 在父级是否会引起额外重渲染循环 | 推断 | 父级 `setSelection`/`setD4Selection` 是稳定 setState；`template` 来自 `templates.find`，`templates` 不变时同一对象 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 唯一导出与 props | 2 | `:5-8` | covered |
| 渲染期解析 | 3.1、3.4 | `:15-20` | covered |
| 目录加载 | 3.2 | `:22-27` | covered |
| 建议带入 | 3.3 | `:28-36` | covered |
| `onChange` 发射 | 3.4、6 | `:37-46` | covered |
| 对象编辑三函数 | 3.5 | `:48-68` | covered |
| 渲染结构 | 3.6 | `:69-121` | covered |
| 调用者/出向 | 4 | — | covered |
| 权限与权威 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无直接测试） |
| Main 安装校验细节 | 10 | — | unknown |
