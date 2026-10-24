---
path: apps/electron/src/main/lib/skill-routing.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 20624bf24d9452cbc1eed7e75c9c91eb577dfa5d
sha256: cc792630e09d5a5688e7e019bcaffcf8f57ce07d5e56bd8f0a329f23ba15476b
lines: 145
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-routing.test.ts

## 1. 测试目标

`skill-routing.ts` 的快照+路由全链，describe 主题即断言纲领：**权限先于相关性**（`:25`）。被测逻辑见同组 `skill-routing.ts.md`。

## 2. 用例清单

1 个 describe + **14 个 `test()`**（`:26-144`）：

| 用例 | 行 |
| --- | --- |
| undefined 保留目录、[] 全禁；推荐不扩权不泄正文 | `:26-36` |
| 相同 name 不吞 slug，歧义别名不选第一个 | `:37-44` |
| 显式数组与文本引用合并去重，不扫历史/quoted_context | `:45-49` |
| 不存在/未能读取明确反馈且不阻塞 | `:50-56` |
| 禁用 automation 组白名单命中也不进目录 | `:57-63` |
| 单工具禁用/MCP 白名单/工具缺失同样裁剪 | `:64-72` |
| 侧车关键字驱动、反例不触发、allowed-tools 不是依赖 | `:73-81` |
| disable-model-invocation 禁自动推荐但显式可展开 | `:82-88` |
| 队列复用快照，磁盘编辑不改本轮 | `:89-97` |
| qualified 引用不截断为另一 slug | `:98-104` |
| 中英文标点结束技能名；qualified/路径不截断 | `:105-119` |
| 短工具名歧义关闭；MCP 全名通过 | `:120-127` |
| 聚合预算不足保留 catalog 仅延后正文 | `:128-136` |
| 正文超预算不截断半份规则，返回读取指引 | `:137-144` |

夹具：`fixture()`（6 skill、shared-name 双胞胎、真实 `createEffectiveAgentPresetPolicy`，`:10-20`）。

## 3. 真实断言（代表性）

- `:31-35` `[]` → allowedSlugs `toEqual([])`、recommended 空、prompt 含 'preset-denied'、**不含 'BODY_pdf' 与 '/skills/'**（不泄正文/路径）。
- `:41-43` `/skill:shared-name` → 诊断含 `ambiguous`、prompt 不含 BODY_；`/skill:beta` → 含 BODY_beta。
- `:47-48` 合并去重 selected `toEqual(['pdf'])`、BODY_pdf 恰 1 次。
- `:55` 删除 SKILL.md 后诊断含 `unreadable`/`not-found`。
- `:59-62` disabledToolGroups → allowedSlugs 空、prompt 含 'tool-group-disabled'、不含正文。
- `:68/:71` disabledTools/MCP 缺失/工具缺失均裁剪。
- `:79-80` 关键字推荐/反例排除；`:86-87` disable-model-invocation 双向。
- `:94-96` 磁盘改 'CHANGED' 后 prompt 仍 BODY_pdf、不含 CHANGED/BODY_alpha。
- `:102/:116` qualified 引用诊断 `{slug:'alpha:daily', code:'not-found'}` 精确匹配。
- `:109-111` 14 标点逐个 selected=['beta']、diagnostics 空、含 BODY_beta。
- `:124-126` 短名歧义裁剪、`mcp__a__fetch_report` 通过。
- `:130-135/:140-143` 预算不足 → body 空/bodyDeferred true、prompt 含 'budget-deferred'/SKILL.md 指引、不含 BODY_pdf、allowedSlugs 保留。

## 4. 未覆盖与脆弱点

- 未覆盖：`extractSkillMentions` 单独断言（经路由间接）；真实 SDK parseFrontmatter（projection 在 policy-projection 测试）。
- 脆弱点：诊断码字符串精确断言；夹具与正则耦合。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例断言如 §3 | 已证实 | 逐行读 `:1-145` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 权限门禁（preset/组/工具/MCP） | 5 | covered |
| 引用解析（歧义/qualified/标点） | 4 | covered |
| 预算/快照复用/推荐语义 | 5 | covered |
