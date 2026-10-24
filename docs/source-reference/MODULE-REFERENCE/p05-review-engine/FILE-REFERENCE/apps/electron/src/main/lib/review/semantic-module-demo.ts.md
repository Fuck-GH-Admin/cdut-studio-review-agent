---
path: apps/electron/src/main/lib/review/semantic-module-demo.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5d54fea718c0fd710351bdcca13e7a678fb2116a
sha256: 9c4c492f974be6534bc12493b9da5ee52b9a68e9f575742125bb833fc82e357f
lines: 476
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/semantic-module-demo.ts

## 1. 结论与边界

D0.5 Agent-first 语义模块试验（头注 :1-3）：只组织审核责任，**不调度 Pi 工具步骤**；是制作侧 Demo 契约，**不是已发布的 D1 Schema 或校方规则系统**。状态机（模块/模板/事务）+ 预览展开 + 简单投影 + 合成回执核对。

边界：投影产物 `TemplateVersion` 带 `D0.5_DEMO_ONLY` 标注且发布被拒（见 `template-store.publishTemplate` 侧）；真实校验/发布在别处。

## 2. 导出与关键符号

类型：`DemoSourceKind/DemoSource`（:8-12）、`DemoResponsibility`（:13-19）、`DemoParameter`（:20-24）、`DemoModuleUse`（:25-32）、`DemoModule`（:33-44）、`DemoTemplate`（:45-55）、`DemoState`（:56-60）、`DemoEdit`（:61-69，8 种 op）、`DemoTransaction`（:70-73，`expectedRevision` 乐观锁）、`DemoTaskPreview`（:74-83）、`DemoPreview`（:84-92，含 `fingerprint`）、`DemoCoverageEntry`（:93-98）、`DemoCoverageReceipt`（:101-104）。

| 函数 | 行 | 说明 |
| --- | --- | --- |
| `emptyDemoState` | 110-112 | `{revision:0,…}` |
| `validateDemoState` | 213-283 | 全量结构校验（issues[]）；辅助：`idError` 118-120、`checkSource` 122-129、`checkTasks` 131-141、`checkUses` 143-168、`visitTemplateUses` 170-211 |
| `applyDemoTransaction` | 285-345 | 原子批量修改（乐观锁） |
| `previewDemo` | 358-413 | 情景展开预览（fingerprint） |
| `projectSimpleDemoDraft` | 419-446 | 无条件简单投影→TemplateVersion 草稿 |
| `checkDemoCoverage` | 452-476 | 合成回执核对（指纹门禁） |

内部：`SAFE_ID`（:106）、`MODULE_KEY/TEMPLATE_KEY`（:107-108）、`copy`（:114-116）、`idError`（:118-120）、`checkSource`（:122-129）、`checkTasks`（:131-141）、`checkUses`（:143-168）、`visitTemplateUses`（:170-211，以上为 validateDemoState 前置辅助）、`interpolate`（:347-355）、`assertUnconditionalProjection`（project 内引用）。

## 3. 内部逻辑与关键流程

1. **`validateDemoState`**（:213-283；前置辅助函数 :118-211）：模块/模板 ID 唯一且 SAFE_ID、版本正整数、必备四元（name/purpose/scope/limits 或 name/purpose/limits）、来源校验（`checkSource`——`official-policy` 须可验证，否则 `不支持在 D0.5 中认证正式校规`）、参数名 `^[a-z][a-z0-9]*$` 唯一非空说明（:229-235）、引用图**可嵌套不可循环**（:268-280）；情景：id 合法唯一、引用未知情景报错、子父情景冲突 `不可能被激活`（:257-265，注释 :257 连未激活分支也核验）。
2. **`applyDemoTransaction`**（:285-345）：revision 不符 → throw `VERSION_CONFLICT: 当前修订号为 …`（:286）；空事务拒绝（:287）；copy-on-write（:288）；8 种 op（create/revise 模块须新版本 `只能从已有模块派生更高版本`、模板增删改查/本地任务 upsert，:294-340）；`revision++` 后全量 validate，失败 throw `VALIDATION_FAILED: …` **原对象不变**（:342-344，注释 :284 原子性）。
3. **`previewDemo`**（:358-413）：validate 全量；模板需情景而未给 → `本模板需要明确业务情景，未知不可视为不适用`（:363）；参数插值 `{{key}}`（未绑定 → `[未绑定:key]` + issue，:347-355）；展开（:384-408）：情景过滤（:385）、循环保护（:389-391）、参数优先级**当前显式绑定 > 父继承 > 子默认**（:393-396）、objectKey 继承（:397）、checkId=`usePath/taskId` 唯一（:401-402）、limits 累积（:404）；fingerprint=sha256(templateId+version+scenario+tasks+issues)（:411）。
4. **`projectSimpleDemoDraft`**（:419-446）：`assertUnconditionalProjection`（无条件才可投影）；preview 阻断/空/带 objectKey → throw `审核责任未通过预览校验`（:424）；产出 `TemplateVersion`：描述带 `[D0.5 DEMO / 非校规]`、`sourceNote: D0.5_DEMO_ONLY: …不得发布或冒充正式行政政策`（:427-428）、单 section `semantic-tasks`（criteria id=`demo-`+sha256(checkId)[:16]，:434）、单 auto-check 阶段、`status:'draft'`。
5. **`checkDemoCoverage`**（:452-476）：指纹不符（含缺失）→ `生效任务包 fingerprint 不匹配或缺失；旧版本审核回执不能复用`（:454-455）；未知/重复 checkId、确定性意见（compliant/non-compliant）缺 sourceIds → `确定性意见缺少真实来源引用`（:465-467）、待核/不适用/失败缺 reason、`not-executed/execution-failed` → `仍有未完成或失败检查`、漏项、blocked → `情景或组合校验尚未通过`；`complete = problems.length===0`。

## 4. 调用者与调用链

入向（生产）：`review-d2-runtime.ts:11`（`previewDemo`+类型）；`review-authoring-v1.ts:11`（preview/project/validate）；`review-d4-common.ts:4`（preview）；`apps/electron/scripts/review-semantic-demo.ts:13`（CLI 全家）。测试：`semantic-module-demo.test.ts:7-9`。`checkDemoCoverage` **生产零消费者**（全树检索仅定义与测试）。出向：`node:crypto`（:5）、`@profer/shared` 类型（:6）。

## 5. 数据 I/O、读写与副作用

纯函数族（copy/clone 语义）；无盘/网（CLI 脚本侧落 state.json，非本文件）。

## 6. 分支、失败、取消与恢复

- throw 类：`VERSION_CONFLICT`/`空事务不允许提升修订号`/`模板不存在`/`固定模块版本已存在，必须创建新版本`/`只能从已有模块派生更高版本`/`目标模块版本已存在`/`待替换/待删除的模块实例不存在`/`VALIDATION_FAILED: …`/`审核责任未通过预览校验`/`复杂业务情景只能预览`（assertUnconditionalProjection 内）。
- 事务原子：任何 op/终态失败原对象不变（:284/:342-344）；无取消概念。

## 7. 权限与权威状态

- 非校规权威：`D0.5_DEMO_ONLY` 标注 + 发布被拒（测试 :167-188：`publishTemplate` throw `D0.5 演示草稿不得发布`）；`official-policy` 来源须可验证否则拒绝（:checkSource）。
- 责任边界：模块 limits 累积到任务（:375/:404）；objectKey 隔离（同一模块两实例互不推定授权，测试 :120-143）。
- 回执权威：指纹门禁（fingerprint 变更即旧回执过期，:454-455）；确定性意见必须有真实来源（:465-467）。
- 无 sender/role 检查。

## 8. 修改影响面

- `review-authoring-v1`（作者链路）、`review-d2-runtime`/`review-d4-common`（预览）、CLI `review-semantic-demo.ts`、fixtures（`docs/design/review-agent/fixtures`）。
- validate 规则收紧会阻断现存 state.json（回执指纹同理）。
- 同测：`semantic-module-demo.test.ts`（15 用例）。

## 9. 测试证据

直接测试 `semantic-module-demo.test.ts`（15 用例 / 1 describe，BDD；真 `template-store`（mkdtemp 配置隔离）、真 `resolveEffectiveRules`、真 CLI `Bun.spawnSync`；NOT_RUN）要点：
1. `:41-71` 简单文本责任 → 投影 TemplateVersion 草稿（`status:'draft'`、outputs 无 approval、validateTemplate 无 error、规则 `execution:'semantic'`、requirement 含 checkId、`confirmation==='confirmed'` 注释「模板结构，不等同校规权威已确认」）。
2. `:73-88` 固定引用版本切换：原状态/旧引用/历史预览 fingerprint 不变；`VERSION_CONFLICT`。
3. `:90-108` 错误引用 `VALIDATION_FAILED`、越权参数 `不允许传入未开放参数`、自环 `循环`、official-policy `不支持在 D0.5 中认证正式校规`；revision 不提升。
4. `:110-133` 双情景：未知情景 blocked（`需要明确业务情景`）；family 3 任务/temporary 2 任务互不串（关系证明隔离）；投影 throw `复杂业务情景只能预览`。
5. `:135-158` 同模块双实例（objectKey 区分）：checkId 不同、插值「查阅/复制」隔离；回执 complete=true 注明「不代表两个操作均已获准」。
6. `:160-170` 覆盖账本：漏项 `审核责任漏项`、无来源 `缺少真实来源引用`、execution-failed/空 reason → complete false。
7. `:172-188` D0.5 草稿 `publishTemplate` throw `D0.5 演示草稿不得发布`。
8. `:194-215` 无关检查顺序调整 → 投影规则 ID 集合不变（防漂移）。
9. `:217-233` 复合模块+本地任务：`module/authority/relation/check` 存在、moduleRef 指向 `relation-proof`。
10. `:235-265` CLI：fixture state+preview/edit/project 命令真实落盘（`revision:2`、投影 requirement 含文本）。
11. `:267-288` 回归 1a：隐藏子情景 `引用未知情景` 拒建；无情景模板 legacy 投影 throw `family-only 存在条件情景`。
12. `:290-311` 回归 1b：隐藏 objectKey 投影拒（`逐对象作用范围`）；`when` 未映射拒（`未映射的结构化属性：when`）；无条件嵌套允许（2 criteria）。
13. `:313-321` 回归 1c：父子情景冲突 throw `子情景与父情景冲突`。
14. `:323-350` 回归 2：同 checkId 改要求 → fingerprint 变、旧回执 `fingerprint 不匹配` 拒、新回执过、缺指纹拒。
15. `:352-368` 参数优先级：显式>继承>默认（`查阅` 覆盖 `默认复制`；`摘录` 覆盖；空绑定不覆盖继承）。

未覆盖：`interpolate` 未绑定文案分支、`revise-module` 各错误分支单独断言；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 函数/类型群/行号如 §2 | 已证实 | 逐条 |
| 事务原子+乐观锁 | 已证实 | :285-345 + 测试 :73-108 |
| 指纹门禁/回执过期 | 已证实 | :452-455 + 测试 :323-350 |
| D0.5 不得发布 | 已证实 | :427-428 + 测试 :172-188 |
| 情景/参数隔离三不变量 | 已证实 | 测试 :110-158/:352-368 |
| `checkDemoCoverage` 生产零消费者 | 已证实（否定） | 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validateDemoState` | §3.1 | 213-283 | covered（经测试族） |
| `applyDemoTransaction` 8 op | §3.2/§9 | 285-345 | covered |
| `previewDemo` 展开/插值/指纹 | §3.3/§9 | 358-413 | covered |
| `projectSimpleDemoDraft` | §3.4/§9 | 419-446 | covered |
| `checkDemoCoverage` | §3.5/§9 | 452-476 | covered（生产零消费） |
