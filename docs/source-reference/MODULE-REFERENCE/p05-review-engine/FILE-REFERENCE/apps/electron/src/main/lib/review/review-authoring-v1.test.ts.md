---
path: apps/electron/src/main/lib/review/review-authoring-v1.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8b05f510b72a6ec9cb48dd18a459d9f48ec5007d
sha256: b7933d503d1ff609482c57f0e42b99da111b3b965a1afb2156a359c0625d1063
lines: 329
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-authoring-v1.test.ts

## 1. 测试目标

D1 作者态真实映射/来源治理（BDD）+ 修订存储与候选发布隔离（`apps/electron/src/main/lib/review/review-authoring-v1.test.ts:42,199`）。被测：`review-authoring-v1`（validate/compile/verify）、`review-authoring-store-v1`（get/save/diff）、`template-store`（publishTemplate/saveDraft/saveAuthoringCandidateDraft）、**真实 CLI**（`Bun.spawnSync` 跑 `scripts/review-authoring-v1.ts`，`:46-53`）。mock 边界：CLI 隔离 `PROFER_CONFIG_DIR`；describe 2 用 tmp home（`:200-207`）；真实磁盘篡改注入。

夹具：`basic()`（`:19-40`：单 module/template/source(user-request, request-scope)/binding）。

## 2. 用例清单

共 **17 个 `test(`**（2 个 `describe`）：

### describe 1「D1 作者态真实映射与来源治理（BDD）」（10 个）

| # | 行 | 用例 | 动作/断言要点 |
| --- | --- | --- | --- |
| 1 | 43-59 | CLI 验证+编译返回映射不发布 | `run(['validate'])` ok、`candidate` mapping 1 条、`template.status==='draft'`、`publicationAllowed===false` |
| 2 | 61-85 | candidate-save 首存强制资格封存 | saved true、publicationEligible false、control.classification `'candidate-held'`、二次保存 exitCode≠0（不隐式覆盖） |
| 3 | 87-100 | 编译候选与 RuleSpec 同真值+来源映射 | validate `[]`、mapping checkId/ruleId/sourceIds/sourceKinds、verify `[]` |
| 4 | 102-107 | 运行候选被改写后不得复用旧映射 | 改 requirement → verify 报「模板内容…不符」「生效规则集…不符」 |
| 5 | 109-118 | manifest 来源映射被改不能伪装 | 改 sourceIds → 「责任来源映射与作者态不一致」；改 workspace → 「作者态定义或来源绑定已变化」 |
| 6 | 120-133 | 未映射条件/改指纹拒绝静默降级 | 加 condition 字段 → 「未映射结构化字段：condition」+ compile 抛 `AUTHORING_INVALID`；改 previewFingerprint → 「责任包指纹」；advanced 未知键 → 「未映射结构化字段」 |
| 7 | 135-142 | 缺绑定/引用错误不以隐式来源生成规则 | 「审核责任缺少来源绑定」+ `AUTHORING_INVALID`；「不存在的来源」 |
| 8 | 144-158 | 跨校制度/制度候选不能提升 | cross-school → compile 抛 `UNVERIFIED_AUTHORITY`；policy-candidate+unknown → 同抛；applicability 改 request-scope → 「制度候选不得直接宣称适用于本案」 |
| 9 | 160-169 | 高级证据/循环引用拒绝 | advanced claimKeys → `UNMAPPABLE_ADVANCED`；自引用 module → 「循环」 |
| 10 | 171-196 | 双分支/逐操作对象不错误投影成无条件 | scenarios 双分支 → compile 抛「复杂业务情景只能预览」；objectKey 对 → 抛「逐对象作用范围」（validate 均 `[]`） |

### describe 2「D1 作者态修订存储与候选发布隔离」（7 个）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 11 | 209-229 | 连续两次修改记录版本 | revision 1/2、parentDigest 链、历史读取、diff.changedModules 含 `'text-structure@1'`、`AUTHORING_REVISION_CONFLICT`、篡改历史 → 「内容摘要不匹配」 |
| 12 | 231-251 | 删/换说明字段再存发布仍拒 | 三次 `publishTemplate` 均 toThrow「模板发布资格未获允许」（删 sourceNote/换文本/首存前剥除） |
| 13 | 253-266 | 展示标记全删仍不能获发布权 | saveAuthoringCandidateDraft + 后续改名 → toThrow 同上 |
| 14 | 268-277 | 资格记录缺失不默认放行 | unlink 资格文件 → toThrow「不得正式发布」 |
| 15 | 279-304 | 父摘要链被篡改拒读拒写 | 伪造 parentDigest → 读/指定版本/续存均 toThrow「父版本摘要链不匹配」；恢复本级再伪祖父 → 仍拒 |
| 16 | 306-321 | 历史缺失/首版伪父不默默忽略 | 伪首版 parentDigest → 拒；删 1.json → 「AUTHORING_HISTORY_BROKEN: 历史修订缺失」 |
| 17 | 323-328 | 老模板服务发布 D1 候选拒 | toThrow「D1 作者态候选尚未经过制度治理」、status 仍 `'draft'` |

## 3. 真实断言

（全部为 `expect` 行，抽样锚；逐条见 §2）：`:54-58` CLI ok/mapping/status/publicationAllowed；`:70-81` exitCode/JSON/classification/二次保存失败；`:89-99` mapping 四元 + verify `[]`；`:105-106` 双错文；`:114-117` 双错文；`:124-132` 三处；`:138-141`；`:151-157` 三段；`:163-168`；`:183-195` 双抛；`:212-228` 修订链 9 断言；`:243-250` 三抛；`:265`；`:276`；`:287-303` 链式 6 断言；`:316-320`；`:326-327`。

## 4. 未覆盖与脆弱点

- 用例 1-2 依赖真实 CLI 进程（`Bun.spawnSync`）与 fixture 文件 `docs/design/review-agent/fixtures/d1-authoring-text-v1.json`（批外数据）。
- describe 2 改共享 `process.env.PROFER_CONFIG_DIR`（`:202`，afterAll 还原，`:203-207`）——串行执行假设。
- 用例 11-16 用真实磁盘篡改注入（readFileSync/writeFileSync 手改 JSON），路径拼写与 store 实现耦合。
- `saveAuthoringCandidateDraft` 的实现面（template-store）批外未读。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 test/2 describe | 已证实 | `:42,199` |
| CLI 链真实执行断言 | 已证实 | `:46-58,66-81` |
| 发布资格不可剥标绕过（3 场景） | 已证实 | `:231-266` |
| 父链递归防篡改 | 已证实 | `:279-304` |
| 跨校/制度候选不可提升 | 已证实 | `:144-158` |
| 测试通过与否 | 未知 | NOT_RUN |
| fixture 数据真实性 | 未知 | 批外文件 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| validate/compile/verify 主面 | §2 | 3-10 | covered |
| CLI validate/candidate/candidate-save | §2 | 1-2 | covered |
| 修订存储/父链/diff | §2 | 11,15,16 | covered |
| 发布隔离（剥标/缺资格/老服务） | §2 | 12-14,17 | covered |
| 其它 CLI 子命令 | §4 | — | unknown |
