---
path: apps/electron/src/renderer/components/content-review/CreateCaseDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7a7d49d9c582335af6d655defda12b9f81968541
sha256: bb91ede4c7d60321933025a35105c7a0ac620a9362339cc0e522e8e57a90e995
lines: 245
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/CreateCaseDialog.tsx

## 1. 结论与边界

「新建审核项目」对话框：收集标题 / 审核模板 / 申请主体 / 适用学年 / 审核类型 / 审核领域包，提交给动作层 `actions.createCase`（`apps/electron/src/renderer/components/content-review/CreateCaseDialog.tsx:54-245`）。

运行时 UI 组件。只做表单与本地校验，**不直接调用 IPC**：提交经 props `onCreate`（`:51`、`:92-99`），而真实实现是 `createReviewActionsController.createCase`（`review-actions-controller.ts:528-551`）。

明确不做的事：

- **不发布政策、不建 Plan**：描述文案明确「建案不会自动发布政策或批准审核」（`:118`）。
- **不强制绑定模板**：空选项 = 先建原生草稿（`:144`、`:153`），提交 `reviewTemplate:null`（`:98`）。
- **不自己决定字段必填**：学年是否显示/必填由「审核类型 + 选中模板的字段声明」共同决定（`:66-68`）。

## 2. 导出与关键符号

`export` 共 **1 个**（只有组件）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CreateCaseDialog` | 导出 function | `:54-245` | `({open, onOpenChange, templates, onCreate}: CreateCaseDialogProps) => React.ReactElement` | 唯一导出 |
| `CASE_TYPE_OPTIONS` | 内部 const | `:37` | `ReviewCaseType[] = ['综合测评','活动申请','自定义审核']` | 与 Main 白名单一致 |
| `defaultAcademicYear` | 内部函数 | `:40-44` | `() => string` | 9 月及以后算新学年 |
| `CreateCaseDialogProps` | 内部 interface | `:46-52` | `{open; onOpenChange; templates: TemplateVersion[]; onCreate: (input: CreateCaseInput) => Promise<ReviewCase\|null>}` | `onCreate` 返回 `null` 表示失败（`:50`） |

## 3. 内部逻辑与关键流程

### 3.1 初始状态与打开重置（`:55-80`）

7 个 state：`title`、`applicant`、`academicYear`（初值 `defaultAcademicYear`，注意传的是函数本身，React 会惰性调用）、`caseType`（默认 `'综合测评'`）、`domainPackId`（默认 `DEFAULT_DOMAIN_PACK_ID`）、`templateKey`、`submitting`（`:55-61`）。

打开时（`:71-80`）重置全部 7 项；关闭时不重置（下次打开会再重置）。

### 3.2 学年显示/必填的推导（`:63-68`）

```ts
const selectedTemplate = templates.find(t => `${t.templateId}@${t.version}` === templateKey)
const yearField = selectedTemplate?.fields.find(f => f.key === 'academicYear' && (f.scope ?? 'case') === 'case')
const showAcademicYear = caseType === '综合测评' || !!yearField
const yearRequired = caseType === '综合测评' || yearField?.required === true
```

即：`caseType==='综合测评'` 时**恒显示且恒必填**；其它类型只有选中模板显式声明 `academicYear`（scope 为 `case`）时才显示，`required` 由字段自身决定。

### 3.3 提交（`:87-110`）

1. `preventDefault`；`!canSubmit` 直接返回（`:88-89`）。
2. `submitting=true`（`:90`）。
3. `onCreate({title: trim, type: caseType, applicant: trim, academicYear: showAcademicYear ? academicYear.trim() : '', domainPackId, reviewTemplate: selectedTemplate ? {templateId, version} : null})`（`:92-99`）——学年**恒发送字符串**：字段隐藏或留空都是 `''`（`:96`）。
   **空学年提交链路（已证实，全领域）**：`''` → controller 原样透传（`review-actions-controller.ts:536`）→ preload 类型即 `academicYear: string`、不归一化（`preload/index.ts:4752`）→ Main IPC 对非 `undefined` 的学年一律 `requireString(input.academicYear,'academicYear')`（`review-ipc.ts:182-184`），而 `requireString` 对空串抛「参数 academicYear 缺失或类型非法」（`review-ipc.ts:76-81`）→ controller catch 后 `reportError('新建案卷失败', …)` 并返回 `null`（`review-actions-controller.ts:547-549`）→ 对话框不关（`:100`）、错误条显示参数错、`finally` 复位 `submitting` 可立即重试（`:107-109`）。因此 native 层「通用草稿可省略学年」的分支（`native-workspace-case-v3.ts:245-249`）**从本 UI 不可达**（仅 Main 直调的测试触达）；「活动申请/自定义审核 + 任意领域包」在学年字段隐藏时也必然在 IPC 边界失败，报的是参数错而非领域错。
4. 返回 `null` → **不关闭对话框**、不 toast（`:100`）；错误已由动作层写入错误条（`:50` 注释、`review-actions-controller.ts:547-549`）。
5. 成功 → `toast.success`（描述按是否选模板二选一，`:101-105`）→ `onOpenChange(false)`（`:106`）。
6. `finally` 复位 `submitting`（`:107-109`）——**异常会向上抛**（无 catch），由 React 事件处理器默认行为处理。

`canSubmit`（`:85`）：`title` 非空 && `applicant` 非空 && （`!yearRequired` 或 `academicYear` 非空）&& `!submitting`。

### 3.4 渲染要点（`:112-244`）

- `Dialog` 受控于 `open`/`onOpenChange`（`:113`）。
- 模板下拉：`disabled={templates.length === 0}`；首项「先创建原生草稿（暂不绑定正式模板）」`value=""`；其余按 `${templateId}@${version}` 列出（`:136-150`）。
- 选中模板时显示 `description` 或默认说明（`:151-153`）。
- 申请主体与学年两列栅格；学年输入 `required={yearRequired}`（`:166-175`）。
- 审核类型用 `Select`，选项来自 `CASE_TYPE_OPTIONS`（`:180-191`）。
- 领域包用 `DropdownMenu` 而非 `Select`（注释说明要在选项里同时展示名称与说明，`:196`），选中项以 `Check` 图标标记（`:215-218`）。
- 底部「取消」「创建项目」（`submitting` 时文案「创建中…」）（`:230-237`）。
- 不可提交时底部提示必填项（`:238-240`）。

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/CaseManagerBar.tsx:33`（import）、`:304`（挂载）：`<CreateCaseDialog open={createOpen} onOpenChange={setCreateOpen} templates={publishedTemplates} onCreate={actions.createCase} />`。
- `publishedTemplates` 是「每个 templateId 取最新已发布版本」的 memo（`CaseManagerBar.tsx:97-104`）。
- 全树唯一引用。

**出向**

| 目标 | 行 | 说明 |
| --- | --- | --- |
| `onCreate` → `actions.createCase` | `:92` | `review-actions-controller.ts:528-551` |
| `toast.success` | `:101` | sonner |
| `onOpenChange(false)` | `:106`、`:231` | 关闭 |

动作层 `createCase` 的真实副作用（`review-actions-controller.ts:528-551`）：`api.createCase(...)`（缺省字段不写，`:532-539`）→ `refreshWorkspaceV2(created.id)`（失败仅上报，`:540`）→ `refreshCaseList()`（`:541`）→ 写 `reviewCasesByIdAtom` 与 `selectedCaseIdAtom`（`:543-544`）→ 清错误（`:545`）；异常时 `reportError('新建案卷失败', error)` 并返回 `null`（`:547-550`）。

## 5. 数据 I/O、读写与副作用

- **输入**：`open`、`templates`、`onCreate`。
- **读**：`templates` 的 `templateId/version/name/description/fields`（`:63`、`:66`、`:146-148`、`:152`）。
- **写**：仅本地 state；持久化由 `onCreate` 完成（Main 建案）。
- **无** localStorage / 剪贴板 / 定时器 / 全局监听。
- **副作用**：`toast.success`；对话框开关。
- **幂等**：不幂等——每次成功提交都会新建一个案卷；`submitting` 只防同一事件循环内的重复点击（`:85`、`:234`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 必填缺失 | `:85`、`:234` | 按钮禁用 + 底部提示 |
| 无已发布模板 | `:142` | 下拉禁用，只能建草稿 |
| `onCreate` 返回 `null` | `:100` | 静默留在对话框；错误由动作层错误条展示 |
| `onCreate` 抛异常 | `:107-109` | `finally` 复位 `submitting`，异常继续上抛（本文件无 catch） |
| 学年为空或字段隐藏时提交（全领域） | `:96` → `review-ipc.ts:182-184`、`:76-81` | IPC 边界 `requireString` 抛「参数 academicYear 缺失或类型非法」→ 动作层 `reportError('新建案卷失败', …)` 返回 `null`（`review-actions-controller.ts:547-549`）→ 对话框不关（`:100`），错误条显示该参数错；`finally` 复位 `submitting`（`:107-109`），补上学年后可直接重试 |
| 取消 | `:231` | `onOpenChange(false)` |
| 重新打开 | `:71-80` | 重置为缺省值 |

**恢复**：无持久草稿；关闭即丢弃输入。**不可恢复**：所有表单字段。

## 7. 权限与权威状态

- 本文件无 sender/role 检查、无 IPC 调用。
- 权威状态在 Main：
  - 类型白名单 `CASE_TYPES`（`review-ipc.ts:73`），非法类型抛「参数 type 非法」（`:161`）；
  - 模板必须是 `status==='published'`，否则抛「只能使用已发布的审核模板创建项目」（`review-ipc.ts:166-174`（发布校验在 `:173`））；
  - 领域包必须已知，否则 `createNativeWorkspaceCaseV3` 抛「未知审核领域不能静默回退综测并创建正式业务案卷」（`native-workspace-case-v3.ts:242-243`）；
  - 建案者必须是 `local`+`reviewer`（`native-workspace-case-v3.ts:240-241`）。
- 前端只做**表单可用性**约束（`:85`、`:142`）。

## 8. 修改影响面

- **唯一调用方** `CaseManagerBar.tsx:304`：改 props 需同步；`templates` 的来源是 `publishedTemplates`（只含已发布最新版），若改成含草稿的列表，下拉会与 Main 的「必须 published」校验冲突。
- **`CreateCaseInput`**（`review-actions-controller.ts:139-146`）：字段增删必须同步本文件 `:92-99` 与 `api.createCase` 入参。
- **学年口径（两层，已证实）**：前端显示/必填只看 `caseType` 与模板字段（`:67-68`）；Main 侧则有两层——① **IPC 边界对所有领域强制非空**：非 `undefined` 一律 `requireString`（`review-ipc.ts:182-184`、`:76-81`），本对话框恒发字符串（`:96`），故空学年在 IPC 层就被拒；② **native 领域层仅 `comprehensive-assessment` 再强制**（`native-workspace-case-v3.ts:51`、`:245-249`），该层分支从本 UI 不可达。前端判据与这两层都不同：`活动申请/自定义审核` + 综测领域包时前端隐藏学年，但仍会因 ① 在 IPC 边界失败。
- **`CASE_TYPE_OPTIONS`**：必须与 `review-ipc.ts:73` 的 `CASE_TYPES` 保持同一集合。
- 无存储格式/迁移。

## 9. 测试证据

**直接测试**：无。全树 `--include=*.test.ts/tsx/mjs` 检索 `CreateCaseDialog`、`defaultAcademicYear`、`CASE_TYPE_OPTIONS` 命中 0。

**间接证据**：`review-actions-controller.test.ts` 覆盖 `actions.createCase` 的缓存/选中写入（如 `:224-235` 的恢复用例依赖已存在案卷），但不渲染本对话框。

**未覆盖**：学年显示/必填的四组合、`onCreate` 返回 `null` 的静默分支、异常上抛、模板下拉空态、领域包选择。

**NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出为组件 | 已证实 | `grep -c "^export"` = 1；`:54` |
| 打开时重置全部表单字段 | 已证实 | `:71-80` |
| 学年显示/必填由 `caseType` 与模板字段决定 | 已证实 | `:66-68` |
| 提交时未选模板传 `reviewTemplate:null` | 已证实 | `:98` |
| `onCreate` 返回 `null` 时不关闭对话框 | 已证实 | `:100` |
| 动作层失败会 `reportError` 并返回 `null` | 已证实 | `review-actions-controller.ts:547-550` |
| 经本对话框提交时，IPC 边界对**所有领域**强制非空学年 | 已证实 | 对话框恒发字符串（`:96`）→ controller 透传（`review-actions-controller.ts:536`）→ preload 不归一化（`preload/index.ts:4752`）→ `review-ipc.ts:182-184` 非 `undefined` 一律 `requireString`，空串抛「参数 academicYear 缺失或类型非法」（`:76-81`） |
| native 领域层仅 `comprehensive-assessment` 再强制学年（该分支从本 UI 不可达） | 已证实 | `native-workspace-case-v3.ts:51`（`ACADEMIC_YEAR_DOMAINS`）、`:245-249`；从本 UI 不可达的依据是上面 IPC 层已先拒绝空串 |
| 文件注释「Main 目前仍全局强制此字段」与本通道可观察行为一致，**不构成过时/矛盾** | 已证实（撤回 r0 的矛盾判定） | 本文件 `:64-65` 的注释描述的就是上面 IPC 层的全局强制；`review-ipc.ts:181` 的「此处不再全局强制」指 handler 不再做领域级判断（紧随其后 `:182-184` 仍对非 `undefined` 值 `requireString`），与领域层「仅 comprehensive-assessment 强制」是不同层口径 |
| `caseType` 非综测且模板未声明学年字段时，提交发 `''` 并在 IPC 边界被拒（全领域），报参数错而非领域错 | 已证实（静态链路）/未实测 | `:67-68`、`:96` + `review-ipc.ts:182-184`、`:76-81`；实际报错文案由动作层错误条展示，未运行复现 |
| `defaultAcademicYear` 在 1–8 月返回上一学年 | 已证实 | `:42-43`（`getMonth()+1 >= 9` 才用当年） |
| `onCreate` 抛异常时对话框的实际表现 | 未知 | 无 catch；React 事件处理器行为未在本轮验证 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 唯一导出与 props | 2 | `:46-54` | covered |
| `CASE_TYPE_OPTIONS` / `defaultAcademicYear` | 2、3.2 | `:37-44` | covered |
| 打开重置 | 3.1 | `:71-80` | covered |
| 学年推导 | 3.2、10 | `:63-68` | covered |
| 提交与失败分支 | 3.3、6 | `:87-110` | covered |
| 渲染要点 | 3.4 | `:112-244` | covered |
| 调用者与动作层副作用 | 4 | `CaseManagerBar.tsx:304`、`review-actions-controller.ts:528-551` | covered |
| 权限与权威 | 7 | `review-ipc.ts:73`、`:161`、`:166-174` | covered |
| 测试证据 | 9 | — | covered（无直接测试） |
| 空学年提交链路（IPC 全局拒绝 → 对话框不关） | 3.3、6、8、10 | `:96`、`:100`、`:107-109` | covered（静态链路） |
| 领域层仅综测强制且从本 UI 不可达 | 8、10 | `native-workspace-case-v3.ts:245-249` | covered |
| 实际报错文案的用户可见表现 | 10 | — | unknown（未运行） |
