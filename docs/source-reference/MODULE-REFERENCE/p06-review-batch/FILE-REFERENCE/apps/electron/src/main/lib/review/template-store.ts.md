---
path: apps/electron/src/main/lib/review/template-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d77fcd289db11c3a31aa6207e655793ce87f9d7a
sha256: 4907533fdf6e101b19a3ced30f3558f580f02bf1dd752da871df55cde6872abc
lines: 604
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/template-store.ts

## 1. 结论与边界

审核**模板仓库**（M1，运行时代码）：模板版本的草稿保存、发布（不可变版本）、校验（02 §5.6 发布检查）、停用、归档/排序。文件头 `apps/electron/src/main/lib/review/template-store.ts:1-8`：存储 `{configDir}/review-templates/{templateId}/versions/{version}.json`；draft 可改、publish 生成不可变版本；纯 Node 无本地数据库。

边界：政策引用校验委托 `./policy-store`（`validatePolicyRef`，`:15`）；模板目录（排序/归档）委托 `./template-catalog`（`:17`）；T01 类型规则与 authored 计数委托 `@profer/shared`（`:14`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TEMPLATE_SCHEMA_VERSION` | 常量 | 19 | `2` | schema 版本 |
| `isSafeTemplateId` | 函数 | 23-25 | `(value): value is string` | `/^[\p{L}\p{N}_-]{1,120}$/u`（中文允许、点号/分隔符拒绝） |
| `readRetirement` | 函数 | 202-211 | `(templateId, version): RetirementRecord \| undefined` | 停用 sidecar 读取 |
| `isTemplateVersionRetired` | 函数 | 212-214 | `(…): boolean` | 停用判定 |
| `getTemplate` | 函数 | 253-260 | `(templateId, version?): TemplateVersion \| undefined` | 读取（停用投影 deprecated） |
| `listTemplates` | 函数 | 263-275 | `(): TemplateVersion[]` | 每模板最新版本（排除归档，目录序） |
| `listTemplateVersions` | 函数 | 278-299 | `(): TemplateVersion[]` | 全部版本（版本倒序） |
| `listArchivedTemplates` | 函数 | 302-307 | `(): TemplateVersion[]` | 已移出模板（恢复用） |
| `reorderTemplates` | 函数 | 310-318 | `(templateIds): TemplateVersion[]` | 保存用户排序 |
| `removeTemplateFromLibrary`/`restoreTemplateToLibrary` | 函数 | 321-331 | | 移出/恢复（发布版本与历史保留） |
| `isAuthoringCandidateDraft` | 函数 | 358-362 | `(templateId, version): boolean` | 候选草稿判定（服务端资格） |
| `saveDraft` | 函数 | 365-367 | `(template): TemplateVersion` | 保存草稿（不授予候选资格） |
| `saveAuthoringCandidateDraft` | 函数 | 372-374 | `(template): TemplateVersion` | D1 作者态入口（强制 candidate-held） |
| `TemplateValidationIssue` | 接口 | 376-379 | `{level:'error'\|'warning', message}` | 校验问题 |
| `validateTemplate` | 函数 | 386-544 | `(template): TemplateValidationIssue[]` | 发布检查 |
| `publishTemplate` | 函数 | 547-583 | `(templateId, version): TemplateVersion` | 发布（不可变） |
| `deprecateTemplate` | 函数 | 589-604 | `(templateId, version, reason?): TemplateVersion` | 停用（sidecar） |

内部：`templatesRoot`/`versionPath`/`writeAtomic`（`:27-41`，tmp+rename）；发布资格 `PublicationClass`/`PublicationControl`（`:53-59`，`regular-draft|candidate-held`）、`controlDir/controlPath/readPublicationControl/registerPublicationControl`（`:60-96`，损坏/不合法抛「拒绝发布」；candidate-held 不可被普通 saveDraft 降级 `:93`）、`isCandidateDraft`（`:78-83`，sourceNote 前缀 `D0.5_DEMO_ONLY:`/`D1_AUTHORING_CANDIDATE:` 或 semantic-tasks 含 `demo-` 准则）；版本锁 `VersionLockRecord`（`:97-104`）、`VERSION_LOCK_STALE_MS=30min`/`LEGACY_LOCK_STALE_MS=10min`（`:107-109`）、`processAlive`（`:111-116`，`process.kill(pid,0)`+EPERM）、`readVersionLock`（`:118-122`）、`acquireVersionLock`（`:131-169`，TAR-17：同主机死 pid 或超时→隔离 `.lock.stale-<ts>-<pid>` 留证据后重试；活进程→抛「模板版本正在被其他进程保存/发布…」）、`releaseVersionLock`（`:171-176`，核对 token，绝不删后来者锁）、`withTemplateVersionLock`（`:178-186`）；停用 `RetirementRecord`/`retirementPath`（`:192-201`，`<version>.retired.json` sidecar）；`readTemplateBody`（`:217-246`，含 `comprehensive-assessment-v2` 的 `requiredAt` 迁移：certificates→decision 其余→submission，`:232-240`）。

## 3. 内部逻辑与关键流程

### 3.1 保存 `saveDraftControlled`（`:334-353`）

status 必须 `'draft'`；版本锁内：已存在 published → `版本 N 已发布不可覆盖；请提升版本号`；已停用 → `版本 N 已停用，历史内容不可覆写`；**先 `registerPublicationControl` 再写正文**（`:345-347` 注释：中途失败只可能拒绝旧草稿发布，不会放行候选）；`writeAtomic` 写版本 JSON。

### 3.2 校验 `validateTemplate`（`:386-544`）

error 级：字段/材料槽/分项/复合规则 ID 重复（TAR-14：`section-<sid>-<cid>` 整体唯一防拼接撞车，`:400-411`）；分项缺 ID/名称、order 无效/重复、必需分项零准则（`:412-421`）；准则缺 id/title/requirement、重复编号（`:423-428`）；dataCheck 校验（须 deterministic、材料槽存在、firstDataRow 正整数、列名 `/^[A-Z]{1,3}$/i`、停止标签需标签列、sheet-sum-match 需案卷级数字字段+数量/单价列成对，`:429-443`）；字段/槽指向不存在分项、分项字段须 subject scope（`:446-452`）；number min>max（`:456-458`）；条件树引用字段存在（`condFields`，`:461-474`）；requiredWhen 引用、minCount>maxCount（`:476-481`）；政策引用 `validatePolicyRef` 失败（`:498-501`）；流程重复阶段 ID/空流程/next/return 指向不存在/首阶段不可达或成环（`:503-529`）；量表 min>=max/权重和≤0/缺缺评策略（`:531-540`）。warning 级：auto-check 无政策引用（`:486-488`）、零内置标准标记仅材料/人工（TAR-13，`:492-496`）、无输出（`:542`）。

### 3.3 发布 `publishTemplate`（`:547-583`）

版本锁内：不存在/已停用抛错（`:550-554`）；已 published 幂等返回（`:555`）；**服务端资格核验**（`:557-563`）：`readPublicationControl` 缺失/非 `regular-draft`/`isCandidateDraft` → 按 sourceNote 前缀给专属文案（D0.5「演示草稿不得发布」/D1「作者态候选尚未经过制度治理」），否则 `'模板发布资格未获允许：候选/演示草稿或未登记版本不得正式发布'`；`validateTemplate` error 清零（`:564-568`）；TAR-08 重跑 `validateT01TypedCriteria`（`:569-573`，Renderer 校验不是可信门禁）；派生 `executionScope`（`material-manual-only`|`rules`，`:574-575`）；写 published 版本（`publishedAt`）。

### 3.4 停用 `deprecateTemplate`（`:589-604`）

仅 published 可停用；已停用幂等返回 deprecated 投影；写 `<version>.retired.json` sidecar，**正文逐字节不变**（`:585-588` 注释：`templateId@version` 内容哈希永久不可变）。读取投影：`getTemplate` 对已停用 published 返回 `status:'deprecated'`（`:256-258`）。

## 4. 调用者与调用链

入向：直接测试 `template-store.test.ts:11`（12 个符号）；`./builtin-templates`（`ensureBuiltinTemplateDrafts({getTemplate, saveDraft})` 注入，测试 `:132/:172`）；其它消费方（模板服务/路由目录/T07 批次新鲜度——`getTemplate` 注释 `:251` 自述，具体调用行未逐一读，推断）。出向：`node:fs`/`node:crypto`/`node:os`/`node:path`（`:10-13`）、`@profer/shared`（`:14`）、`./policy-store`（`:15`）、`../config-paths`（`:16`）、`./template-catalog`（`:17`）。

## 5. 数据 I/O、读写与副作用

- 读写：`review-templates/{id}/versions/{n}.json`（tmp+rename 原子写 `:37-41`）；`review-template-controls/{id}/{n}.json`（发布资格）、`{n}.lock`（版本锁）、`{n}.retired.json`（停用 sidecar）；`template-catalog` 的 catalog.json（排序/归档）。
- 并发：版本锁（`wx` 创建 + token 释放核对 + 崩溃隔离）；资格登记与草稿写在同一锁内（`:51` 注释）。
- 副作用：`console.warn`（隔离锁 `:162`、解析失败 `:243`）、`console.log`（发布/停用 `:580/:601`）。

## 6. 分支、失败、取消与恢复

- 保存失败矩阵（§3.1）；发布失败矩阵（§3.3）；锁冲突可读文案（`:154-157`，含 pid/持有时长/建议）。
- TAR-17 恢复：死锁按 pid/时限**隔离留证据**（`.lock.stale-*`），不静默删除；活进程锁拒绝恢复。
- 停用不可逆（同版本不可重新发布 `:552-554`、不可覆写 `:342-344`）；恢复路径=提升版本号。

## 7. 权限与权威状态

- 发布资格权威=`review-template-controls` 服务端记录（`:44-52` 注释：独立于可编辑 sourceNote）；`candidate-held` 永不由普通草稿编辑解锁（`:93/:364`）；`isAuthoringCandidateDraft` 拒绝缺失/损坏资格（`:355-357`）。
- 版本正文权威=已发布 JSON（不可变）；停用权威=sidecar（不改正文）。
- 无 sender/role（Main 侧存储层；调用方负责授权）。

## 8. 修改影响面

改发布门禁影响模板 UI/服务与所有 `getTemplate` 消费方（模板库/路由目录/T07 批次新鲜度）；改 validate 规则影响发布成功率与 `template-store.test.ts` 19 用例；`comprehensive-assessment-v2` 迁移分支（`:232-240`）删改会影响旧模板读取。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/template-store.test.ts`（305 行、4 describe、19 用例；NOT_RUN）。关键断言：TAR-08 发布拒绝缺确认的确定性规则（`:41-42`）；TAR-13 `executionScope==='material-manual-only'`+warning（`:52/:62-64`）；TAR-17 崩溃锁隔离留证据+活锁拒绝（`:78-89`）；ID 中文/穿越（`:95-97`）；comprehensive-assessment-v2 requiredAt 迁移（`:111-112`）；内置+参考模板校验零 error（`:125-128`）；必需分项无标准拒发布（`:154-155`）；版本历史（`:165-166`）；内置草稿幂等+已发布不可覆盖（`:174-182`）；排序/移出/恢复（`:188-197`）；停用正文逐字节不变+读取投影 deprecated+不可复活（`:206-221`）；悬空引用/重复阶段/链断/循环/量表非法（`:233-272`）；D12 纯配置建业务（`:297-303`）。未覆盖：`readPublicationControl` 损坏分支、`reorderTemplates` 不一致抛错、`saveAuthoringCandidateDraft`、`LEGACY_LOCK_STALE_MS` 旧空锁分支、并发锁竞争实测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 导出与行号 | 已证实 | `:19-604` |
| 发布资格服务端权威+候选不可解锁 | 已证实 | `:44-96/:355-374/:557-563` |
| TAR-17 锁隔离（stale 证据+token 释放核对） | 已证实 | `:124-176` + test:67-90 |
| 停用正文不可变+投影 deprecated | 已证实 | `:585-604/:256-258` + test:200-222 |
| TAR-08 发布重跑 T01 校验 | 已证实 | `:569-573` + test:30-43 |
| `getTemplate` 消费方（路由/T07）清单 | 推断 | `:251` 注释自述，未逐一读调用行 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| saveDraft/saveDraftControlled | §3.1 | 334-374 | covered |
| validateTemplate 全规则 | §3.2 | 386-544 | covered |
| publishTemplate 门禁 | §3.3 | 547-583 | covered |
| deprecateTemplate/投影 | §3.4 | 202-260/589-604 | covered |
| 版本锁 TAR-17 | §2 | 97-186 | covered |
| 测试断言（19 用例） | §9 | test:30-303 | covered |
| 资格损坏/旧空锁/并发 | §9 | — | partial |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
