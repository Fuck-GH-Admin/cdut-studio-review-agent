---
path: apps/electron/src/main/lib/review/semantic-module-demo.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2cdb1c44c57721f69f93f0fb1fd1e9dc2d92dc2b
sha256: 547cc0dc5c7d8f8041ca7e931adef4b856f71a9386a640ef5ee44b1f85d62230
lines: 368
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/semantic-module-demo.test.ts

## 1. 测试目标

D0.5 Agent-first 语义模块（BDD 15 用例）：投影/事务原子/情景与参数隔离/覆盖回执指纹门禁/不得发布/规则 ID 防漂移/CLI 真实链路/回归 1-2。

## 2. 用例清单

15 用例 / 1 describe。夹具 `synthetic/task/moduleOf/templateOf/setup`（:12-37）；mock 边界：**无 mock**——真 `template-store`（mkdtemp 配置隔离 :172-188）、真 `resolveEffectiveRules`（:60-70）、真 CLI `Bun.spawnSync`（:243-255）、真 fixtures（`docs/design/review-agent/fixtures`）。

| # | 用例（行） |
| --- | --- |
| 1 | 简单文本责任→TemplateVersion/RuleSpec 投影（41-71） |
| 2 | 固定引用版本切换、历史不变、VERSION_CONFLICT（73-88） |
| 3 | 错误引用/越权参数/自环/official-policy 原子拒绝（90-108） |
| 4 | 双情景互不引入资格规则（110-133） |
| 5 | 同档双实例（objectKey）覆盖与权限隔离（135-158） |
| 6 | 覆盖账本漏项/无来源/失败拒绝完成（160-170） |
| 7 | D0.5 草稿发布必须拒绝（172-192） |
| 8 | 无关顺序调整规则 ID 不漂移（194-215） |
| 9 | 复合模块+本地任务稳定展开（217-233） |
| 10 | CLI fixture 预览/编辑/投影真实落盘（235-265） |
| 11 | 回归 1a 隐藏子情景拒绝投影（267-288） |
| 12 | 回归 1b 隐藏 objectKey/when 拒投影（290-311） |
| 13 | 回归 1c 父子情景冲突显式报错（313-321） |
| 14 | 回归 2 指纹变更旧回执过期（323-350） |
| 15 | 参数优先级显式>继承>默认（352-368） |

## 3. 真实断言

- 1：preview 1 任务、requirement 含文本；draft `status 'draft'`、outputs 无 approval、validateTemplate 无 error、规则 `execution 'semantic'` + requirement 含 checkId + `confirmation 'confirmed'`（注释「不等同校规权威已确认」，:70）。
- 2：原对象/旧引用/旧 preview fingerprint 不变（:81-83）；新要求含 `签署日期`（:84）；旧版本任务文本保留（:85）；`toThrow('VERSION_CONFLICT')`（:86）。
- 3：`VALIDATION_FAILED`（:96）/`不允许传入未开放参数`（:101）/`循环`（:104）/`不支持在 D0.5 中认证正式校规`（:107）；`revision` 不变（:97）。
- 4：无情景 blocked（`需要明确业务情景`，:121-122）；family 3 任务/temporary 2 任务（:126-127）；`关系证明` 只在 family（:128-129）；投影 throw `复杂业务情景只能预览`（:132）。
- 5：2 任务 checkId 不同（:150-151）；插值 `查阅`/`复制` 隔离（:152-153）；回执 complete true 注明「不代表两个操作均已获准」（:155）。
- 6：漏项 `审核责任漏项`、无来源 `缺少真实来源引用`、execution-failed/空 reason → complete false；validate `[]`（:163-168）。
- 7：`publishTemplate` `toThrow('D0.5 演示草稿不得发布')`（:187）。
- 8：排序后规则 ID 集 `toEqual`（:213）。
- 9：`module/authority/relation/check` 在 checkId 列表、`moduleRef.moduleId==='relation-proof'`（:231-232）。
- 10：CLI family 3 任务（:250-251）、archive 含 `item-1/copy`（:253）、编辑 `revision:2`（:255）、投影 requirement 含 `标题、摘要、正文及结论`、`status 'draft'`（:258-259）。
- 11：`toThrow('引用未知情景')`（:276）；family 2/temporary 1 任务（:278-279）；无情景 blocked（:280）；legacy 投影 `family-only 存在条件情景`（:285）。
- 12：objectKey 投影 throw `逐对象作用范围`（:302）；`when` throw `未映射的结构化属性：when`（:307）；无条件嵌套 2 criteria（:310）。
- 13：`toThrow('子情景与父情景冲突')`（:320）。
- 14：旧回执 complete true（:333）；改要求后 checkId 相同但 fingerprint 变（:341-342）；旧回执 `fingerprint 不匹配` 拒（:345-346）；新指纹旧条目过（:347）；缺指纹拒（:348）。
- 15：继承 `查阅` 非 `默认复制`（:358-360）；显式 `摘录`（:365）；空绑定不覆盖继承（blocked false，:372）。

## 4. 未覆盖与脆弱点

- 未覆盖：`interpolate` 未绑定文案分支、`revise-module` 三类错误单独断言。
- 脆弱点：CLI 测试耦合 fixtures 文件与 `review-semantic-demo.ts` 脚本路径（:241-242）；`as any`（:348）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 用例断言如 §3 | 已证实 | 本文件逐行 |
| 真链路（无 mock） | 已证实 | §2 mock 边界 |
| 不得发布/指纹门禁/三隔离被固定 | 已证实 | 用例 4-7/14-15 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| validate/apply 事务原子 | §3 | covered |
| preview 展开/插值/指纹 | §3 | covered |
| projectSimpleDemoDraft+发布拒绝 | §3 | covered |
| checkDemoCoverage 门禁 | §3 | covered |
| 回归 1a/1b/1c/2 | §3 | covered |
