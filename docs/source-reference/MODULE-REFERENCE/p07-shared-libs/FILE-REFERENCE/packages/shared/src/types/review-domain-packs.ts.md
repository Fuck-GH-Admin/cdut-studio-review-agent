---
path: packages/shared/src/types/review-domain-packs.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12ab927fad41af829d827983a9f6d4d5053c4f42
sha256: 797637a80b6ed1d748d51b480b3d92b046bfd5248f4eb69c5ddda238c75962ba
lines: 238
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-domain-packs.ts

## 1. 结论与边界

**内容审核领域包（P1/D14）**（`review-domain-packs.ts:1-16` 注释）：把原先写死的"规则类别/问题类型/prompt 角色"抽成数据，支撑换审批领域（综测/合同/报销/自定义）。结构化指令（JSON 字段要求、锚点回引）留在服务层（引擎契约不属领域知识，`:12-13`）。D15 回落策略：未知 findingKind 标签按原字符串、严重度回落 yellow（`:15`）。

## 2. 导出与关键符号（13 条，表 11 行末行合并三函数）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewDomainPackId` | type | `:21` | `string`（内置四+自定义） |
| `BUILTIN_DOMAIN_PACK_IDS` | const | `:24-33` | comprehensiveAssessment/contractReview/expenseReimbursement/custom |
| `DEFAULT_DOMAIN_PACK_ID` | const | `:36` | = comprehensiveAssessment（兼容历史案卷） |
| `ReviewFindingKindSpec` | interface | `:39-48` | `{id,label,defaultSeverity,hint?}` |
| `ReviewDomainPrompts` | interface | `:51-56` | `{role, guideline?}`（仅领域知识） |
| `ReviewDomainPack` | interface | `:59-74` | id/name/description/ruleCategories/findingKinds/constraintKinds/prompts/builtin |
| `FALLBACK_FINDING_KIND` | const | `:77` | `'other'`（任何包应含，`:76`） |
| `BUILTIN_DOMAIN_PACKS` | const | `:187-192` | 4 包数组（顺序=UI 下拉顺序，`:186`） |
| `isKnownDomainPack` | function | `:200-203` | 未声明=合法（`:201`）；M0/H14：未知 ID 阻止默默按综测执行（`:199`） |
| `resolveDomainPack` | function | `:205-208` | 缺省/未命中 → COMPREHENSIVE_ASSESSMENT |
| `findingKindLabel`/`findingKindSeverity`/`isKnownFindingKind` | function | `:216-238` | 标签回原串（`:217`）/严重度回 yellow（`:227`）/成员判定（`:237`） |

内部：4 包常量（`:80-184`，注释"与既有 demo 行为完全一致保证不回归" `:79`）。

## 3. 内部逻辑与关键流程

1. 4 内置包数据（`ruleCategories` 7-9 类、`findingKinds` 8-10 型均含 `other` 兜底、`constraintKinds` 引 `RuleConstraint['kind']`、中英混合 prompts）。
2. **回落三则**：`resolveDomainPack` 回缺省综测（`:206-207`）；`findingKindLabel` 回原字符串（`:217`）；`findingKindSeverity` 回 `'yellow'`（`:227`）。
3. `isKnownDomainPack`（`:200-203`）：`!packId` → true（未声明=显式语义）；否则内置名单核对。

## 4. 调用者与调用链

- 出向：`./review`（`FindingSeverity/RuleConstraint`，`:18`）。
- 入向：经 `@profer/shared` barrel；内容审核专区（review 面板/引擎 mock/约束校验，跨批实现未读）。

## 5. 数据 I/O、读写与副作用

无（数据+纯函数）；确定性。

## 6. 分支、失败、取消与恢复

三分支回落（§3-2）；不抛错。`isKnownDomainPack` 与 `resolveDomainPack` 行为差异（未知 ID 时前者 false、后者回综测）构成"阻断静默"与"兼容降级"双层。

## 7. 权限与权威状态

无权限分支；领域知识边界红线 = 结构化指令不入包（`:12-13`）。

## 8. 修改影响面

改包数据 → 审核面板类别/问题类型/prompt 输出；改回落三则 → 历史案卷兼容（`:35`）与 D15 语义；`FALLBACK_FINDING_KIND` 变动 → 全包。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `BUILTIN_DOMAIN_PACKS|resolveDomainPack|findingKind` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出+4 包数据+回落三则 | 已证实 | 逐行读 `:1-238` |
| 引擎消费方遵守约束 | 未知 | 服务层（跨批）未读 |
| hint 注入效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 导出 | §2 | `:21-238` | covered |
| 4 内置包数据 | §3 | `:80-184` | covered |
| 回落三则 | §3/§6 | `:205-228` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
