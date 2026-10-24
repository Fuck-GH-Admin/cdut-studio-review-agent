---
path: apps/electron/src/main/lib/review/review-v3-d4-demo-publish.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c81c77af873375ac0e12580031e9cdbd7c492382
sha256: 33dae9bb9e4984e2aa0d0c117bf556b7bab8c67e757d930375ddba9e367609ab
lines: 170
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-d4-demo-publish.ts

## 1. 结论与边界

把 50 套 D4 冻结候选（`publication: candidate-held` = 未获校方批准）发布为**演示用**业务模板（文件头 :1-13，中文注释）：演示阶段允许候选→可执行模板，但发布**不生成任何校方政策引用**（policyVersionIds/policyRefs 空）、判据全 `execution:'semantic'`（须人工复核）、名称只用业务名。「不是伪造校方批准」——事实不改。

不做的事：不改 D4 冻结定义、不发布正式政策引用、不覆盖用户正式模板（已发布+名称干净即跳过）。

## 2. 导出与关键符号

导出 8 条（`export` 逐条核 :46/:48/:52/:56/:115/:125/:165/:170）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `D4_DEMO_TEMPLATE_ID_PREFIX` | const | `:46` | `'d4demo-'` | 派生命名空间（TAR-01：不占 D4 冻结作者键 :44-45 注释） |
| `derivedDemoTemplateId` | function | `:48` | `(templateId) => 'd4demo-'+templateId` | |
| `isDerivedDemoTemplateId` | function | `:52` | 前缀判定 | |
| `demoTemplateFromD4` | function | `:56-113` | `(entry, workspace) => TemplateVersion` | 单套转换 |
| `D4PublishResult` | interface | `:115-120` | `{published, renamed, skipped, failed}` 四数组 | 发布结果 |
| `publishD4Templates` | function | `:125-162` | `() => D4PublishResult` | 批量发布 |
| `isCleanName` | function | `:165-168` | `(name) => boolean` | 名称是否干净业务名 |
| `publishD4DemoTemplates` | const | `:170` | `= publishD4Templates` 别名 | 无模块级消费者 |

内部符号：`stripCodePrefix`（:22-29，去 `G02-T01｜` 类编号前缀与内部术语括注）、`D4ModuleTask/D4Module`（:31-44）。

## 3. 内部逻辑与关键流程

### 3.1 `demoTemplateFromD4`（:56-113）

取 `workspace.definitions.templates[0]`（:57）；只消费模板显式引用的模块（TAR-02，:62-64 注释：不再平铺全集）；场景限定降级为分项说明/要求前缀（`【适用场景：…；不适用时按人工待核处理】` :66-68）；分项 `required:false`（:75，不强制先录事项）；判据 `execution:'semantic'` + `targetScope:'case'`（:79-82，注释 :78：必须人工复核）；title 截 60（:77）；`displayTitle = stripCodePrefix(definition.name)`（:90）。产物：`templateId = derivedDemoTemplateId(entry.templateId)`（:93）、`version = entry.templateVersion`（:94）、`catalogKind:'reference'`、`sourceNote` 注明 `D4_DERIVED_DEMO:…有损演示转换`（:95）、单字段 `title`（:100-102）、`materialSlots:[]`、`policyVersionIds:[]`/`policyRefs:[]`（:107-108）、单 stage `initial-review`/单 output `feedback`（:109-110）。

### 3.2 `publishD4Templates`（:125-162）

逐套 try/catch 归类（:130-160）：`getTemplate(derivedId)` 取最新；**TAR-11 跳过**=已发布且名称干净（:132-136，`skipped` 原因「已发布且名称正常」）；`needsRename = latest && !isCleanName(latest.name)`（:137）；版本号「已有派生版本递增、否则从冻结版本起算」（:140-141，注释：绝不改写历史）；`saveDraft` + `publishTemplate(templateId, version)`（:143-144）；结果记录 sections/criteria 计数（:145-150）；异常 → `failed`（reason 为错误文本 :154-158）。

### 3.3 `isCleanName`（:165-168）

非 `G\d\d` 开头且不含「演示/测试/技术预审/技术候选」字样。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- 生产：`apps/electron/src/main/lib/review/review-ipc.ts:961` 注册 `REVIEW_IPC_CHANNELS.D4_DEMO_PUBLISH_V3` handler，`:962` `require('./review-v3-d4-demo-publish')` 解构 `publishD4Templates`、`:963` 调用。渲染链（间接）：`apps/electron/src/preload/index.ts:4932` preload API `publishD4DemoTemplates`（invoke 同通道）→ `apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:168` `window.reviewAPI.publishD4DemoTemplates()`——同名 API 经 IPC 间接到达，非 import 本模块。
- 测试：`apps/electron/src/main/lib/review/template-asset-contract.test.ts:9`（覆盖 `demoTemplateFromD4`/`derivedDemoTemplateId`/`isDerivedDemoTemplateId`/前缀常量 :22-26）。
- **否定**：`publishD4DemoTemplates`/`isCleanName`/`D4PublishResult` 无模块级外部引用（符号名全树检索仅本文件）。

出向（:14-16）：`@profer/shared` 类型（TemplateVersion/TemplateCriterionSpec/ReviewAuthoringWorkspaceV1）；`review-d4-catalog`（`loadD4UnifiedCatalog` :126、`loadD4UnifiedWorkspace` :138、D4UnifiedEntry 类型）；`template-store`（`getTemplate` :131、`saveDraft` :143、`publishTemplate` :144）。

## 5. 数据 I/O、读写与副作用

- 经 `template-store` 写模板存储（saveDraft/publishTemplate——落盘属该模块）；读 D4 目录（loadD4UnifiedCatalog/Workspace）。
- 幂等：TAR-11 跳过已发布+干净名；重跑时名称不干净强制改名重发（:137/:151）；版本递增不改历史。
- 副作用：模板库新增派生版本。无网络。

## 6. 分支、失败、取消与恢复

- 逐套 try/catch：单套失败不影响其它（:130/:153-158）；失败原因保留错误文本。
- 跳过/改名/新发三路分支（:132-151）。
- 不适用「取消/恢复」：同步批量函数，无中途取消。

## 7. 权限与权威状态

无 sender/role 检查（依据：无相关字段；IPC 守卫在 review-ipc 层）。权威语义：D4 `candidate-held` 事实不改；派生模板政策引用恒空（:107-108），语义判据须人工复核（:78-82）。

## 8. 修改影响面

- 生产入口 review-ipc（D4_DEMO_PUBLISH_V3）；渲染端同名 API 链。
- `isCleanName`/TAR-11 语义影响重复发布行为；派生 ID 前缀被 `isDerivedDemoTemplateId` 消费者识别（template-asset-contract.test 断言）。
- 需同步测试：`template-asset-contract.test.ts`（批外）。

## 9. 测试证据

- 间接（批外 `template-asset-contract.test.ts:9`，NOT_RUN）：`demoTemplateFromD4`/ID 派生三函数+前缀常量（:22-26）被断言。
- **否定**：`publishD4Templates`/`isCleanName` 无直接测试（全树 `*.test.ts` grep 符号名 0 命中）。批内 `review-v3-d4-catalog-attach.test.ts`（本批）验证的是 D4 挂 Plan 链，不覆盖发布函数。
- mock 边界：未读 template-asset-contract.test 断言细节（批外）；`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；政策引用恒空、判据全 semantic | 已证实 | :46-170/:107-108/:79-82 |
| TAR-02 只消费显式引用模块；场景降级为说明前缀 | 已证实 | :62-68 |
| TAR-11 跳过=已发布+干净名；不干净强制改名重发 | 已证实 | :132-137/:151 |
| 版本递增不改写历史 | 已证实 | :140-141 |
| `publishD4Templates` 生产入口 review-ipc:961-963 | 已证实 | grep 锚点 |
| `publishD4DemoTemplates` 别名无模块级消费者（IPC 同名链） | 已证实（否定） | 全树符号检索（§4） |
| `publishD4Templates`/`isCleanName` 无直接测试 | 已证实（否定） | 全树 `*.test.ts` 检索 |
| `stripCodePrefix` 正则完备性 | 推断 | :22-29，无测试断言 |
| template-store 写入语义 | 未知（属他文件） | :143-144 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `demoTemplateFromD4` | §3.1 | :56-113 | covered |
| `publishD4Templates` 三路+失败 | §3.2/§6 | :125-162 | covered |
| `isCleanName` | §3.3 | :165-168 | covered |
| ID 派生三函数/常量 | §2 | :46-52 | covered |
| `stripCodePrefix` | §2/§10 | :22-29 | covered |
| `publishD4Templates`/`isCleanName` 测试 | §9 | — | unknown（无直接测试） |
| template-store 写入语义 | §10 | :143-144 | unknown |
