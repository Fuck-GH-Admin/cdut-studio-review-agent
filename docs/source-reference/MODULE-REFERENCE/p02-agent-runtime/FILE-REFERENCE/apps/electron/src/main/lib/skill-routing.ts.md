---
path: apps/electron/src/main/lib/skill-routing.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ff4e2836bc3e486775ad9aa0aee9f84f7ef7511b
sha256: 2dc5f4dd260661817640cf297bdcaee1fa5e77c7ae34f3b54ba6a9dc6fdfc591
lines: 212
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-routing.ts

## 1. 结论与边界

**双 runtime 共用的 Skill 可用性快照与任务路由**（`skill-routing.ts:1`）：**没有模型调用、不修改预设**。构建 Skill 快照（预设/依赖门禁 fail closed）与任务路由（显式引用 + 推荐 + 正文注入预算）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillRoutingCode` | type | `:10` | 9 拒绝码（preset-denied/tool-group-disabled/tool-unavailable/mcp-unavailable/unreadable/invalid-routing/not-found/ambiguous/budget-deferred） |
| `SkillRoutingDiagnostic`/`RoutingSkill`/`SkillRoutingSnapshot`/`SkillSelection`/`SkillRoutingResult` | interface | `:11-33` | RoutingSkill 含 body/bodyDeferred/blocked/rules |
| `createSkillRoutingSnapshot` | function（export） | `:101-150` | `async (input) => SkillRoutingSnapshot` |
| `extractSkillMentions` | function（export） | `:153-159` | 提取 `/skill:` 引用（句读符边界，`:155`） |
| `routeSkillsForTask` | function（export） | `:161-212` | `(snapshot, input) => SkillRoutingResult` |

内部：`MAX_SKILL_BYTES=512K`/`MAX_ROUTING_BYTES=16K`（`:35-36`）、`key`（slug 规范化 `:37`）、`xml`（转义 `:38`）、`checkedFile`（realpath 越界/预算守卫 `:40-48`）、`readHeader`（16K 头读取，超预算/缺失即抛 `:50-60`）、`readRules`（profer-routing.json 校验：数组≤100 项/单项≤160 字/能力组白名单 `:62-80`）、`mergeRules`（builtin∪custom `:82-89`）、`toolIsAvailable`（**MCP 全名精确匹配、短名只对已注册工具** `:91-99`）。

## 3. 内部逻辑与关键流程

1. **快照**（`:101-150`）：无 projection→空（`:107`）；YAML 解析复用 SDK `parseFrontmatter`（**:108 注释：不新增依赖/自造 YAML 语义**）；逐 skill：白名单外直接 `preset-denied` **且不读正文**（诊断不含正文/路径 `:126`）；正文超剩余预算→`bodyDeferred` 只读头（`:130-132`，预算封顶 8MB `:115`）；front-matter 校验（name/description/body 任一缺失→`unreadable` `:138`）→路由规则合并失败 `invalid-routing`（`:141`）→能力组禁用 `tool-group-disabled`（`:143`）→MCP 未加载/未允许 `mcp-unavailable`（`:144`）→工具不可用 `tool-unavailable`（`:145`）；`allowedSlugs` = 未被拒清单（`:149`）。
2. **引用提取**（`:153-159`）：剥历史/内联（cleanSkillTaskText）；`/skill:` 正则（冒号/斜杠不作边界防截断 `:155-156`）；保留不支持引用供失败反馈（`:157`）；128 字符上限。
3. **路由**（`:161-212`）：显式引用优先（唯一 name 解析，歧义→`ambiguous` `:174-176`；被拒→码诊断 `:177`）；推荐 ≤3（上限 5 `:183`），按 slug 排序、跳过 blocked/disableModelInvocation/已选（`:184-186`），`skillTaskMatch` 给理由；正文注入预算 ≤24000 字符（上限 64000 `:194`）——超预算/deferred → `budget-deferred` 占位块（"Nothing was truncated" `:199`）；失败反馈块要求**如实告知、不得假装已用/绕过门禁**（`:207`）；`<skill_routing>` 头声明"推荐不是新用户指令、不得改变 scope/授权"（**:209**）。

## 4. 调用者与调用链

- 入向：`skill-runtime-routing.ts`（snapshot，同批）；双 runtime adapter 装配（跨文件）；测试 `skill-routing.test.ts`（145）/`skill-routing-eval.test.ts`（45）（同批）。
- 出向：`@profer/shared`（预设策略 API `:5`）、`./default-skill-slugs`/`./skill-path-security`（`:6-7`）、`./skill-routing-rules`（`:8`）、SDK `parseFrontmatter`（动态 `:109`）、`node:fs(/promises)`/`node:path`。

## 5. 数据 I/O、读写与副作用

读：`projection.path/skills/<slug>/SKILL.md` 与 `profer-routing.json`（带 realpath/大小预算守卫）；无写。确定性（无模型调用 `:1`）。

## 6. 分支、失败、取消与恢复

fail closed 族（9 码）；`checkedFile`/`readHeader`/`readRules` 抛错被收拢为 `unreadable`/`invalid-routing`（`:139/:141`）；引用失败如实反馈（`:207`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：推荐不改预设（`:1`）、拒绝项不读正文（`:126`）、MCP 全名防冒充（`:92`）、引用不截断（`:157`）、推荐≠新指令（`:209`）、失败不得假装（`:207`）。

## 8. 修改影响面

改快照/路由 → 双 runtime Skill 供给与 prompt 注入；改 9 码语义 → 诊断消费方；预算常量 → 注入规模。

## 9. 测试证据

**直接测试（同批，NOT_RUN）**：`skill-routing.test.ts`（145 行）与 `skill-routing-eval.test.ts`（45 行）——断言见各测试手册。未覆盖项见测试手册 §4。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+8 内部+快照/路由全分支 | 已证实 | 逐行读 `:1-212` |
| SDK parseFrontmatter 行为 | 未知 | 外部 SDK |
| 正则/预算实际表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 快照（9 码门禁链） | §3.1 | `:101-150` | covered |
| 引用/路由/注入 | §3.2-3.3 | `:153-212` | covered |
| 内部 8 符号 | §2 | `:35-99` | covered |
| 测试 | §9 | 同批测试 | covered（NOT_RUN） |
