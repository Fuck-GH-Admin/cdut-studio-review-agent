---
path: apps/electron/src/main/lib/skill-routing-rules.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 29346bdc7c10ffd7efb88ce1471d11b45a6c57a1
sha256: a14b788c2ebfea755cbc62e8da3926f1093febed3425d4155df3d2a8904fe048
lines: 58
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-routing-rules.ts

## 1. 结论与边界

**确定性任务信号规则**（`skill-routing-rules.ts:1` 注释红线）：**只用于推荐，不用于扩大预设权限或删掉合法 catalog**。定义 Skill 路由规则形状、内置依赖表与 `skillTaskMatch` 可解释推荐判定。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillRoutingRules` | interface（export） | `:4-10` | keywords/excludeKeywords/requiredTools/requiredMcpServers/requiredToolGroups（全可选） |
| `BUILTIN_SKILL_DEPENDENCIES` | const（export） | `:12-18` | 5 skill 的依赖规则（automation/agent-collaboration/in-app-browser/pptx/guizang-ppt-skill，各 requiredToolGroups+requiredTools） |
| `cleanSkillTaskText` | function（export） | `:24-28` | 剥 `<quoted_context\|referenced_sessions\|skill\|skills\|available_skills>` 块与代码围栏 |
| `skillTaskMatch` | function（export） | `:40-58` | `(slug, message, rules) => 理由字符串 \| undefined` |

内部：`ACTION`/`CODE`/`NOT_CODE` 三正则（`:20-22`，中英混合）、`containsKeyword`（`:30-37`：`[a-z0-9_-]` token 词边界匹配，其余子串）。

## 3. 内部逻辑与关键流程

`skillTaskMatch`（`:40-58`）顺序：

1. 剥历史引用/内联 Skill 正文（**:25 注释：只看本次原始用户意图**）。
2. `excludeKeywords` 命中 → undefined（**:42**）。
3. `keywords` 命中 → `'configured-keyword'`（`:43`）。
4. `ACTION` 不匹配 → undefined（`:44`，动作词闸门）。
5. 按 slug 九分支（`:45-56`），每分支=正向特征+否定保护：code-honor（CODE 且非 NOT_CODE）、brainstorming（设计/新功能）、writing-plans（计划）、agent-collaboration（并行且非"不要并行" `:49`）、automation（周期且非"一次性" `:50`）、in-app-browser（浏览器且非"不用浏览器"）、pdf/docx/xlsx/pptx（文件型特征+否定保护）；default → undefined。

## 4. 调用者与调用链

入向：`skill-routing.ts`（`createSkillRoutingSnapshot` 消费，同批）；`skill-routing-eval.test.ts`/`skill-routing.test.ts`（同批测试）。出向：`@profer/shared`（`AgentPresetToolGroup` 类型 `:2`）。

## 5. 数据 I/O、读写与副作用

纯函数/常量；无 I/O；确定性。

## 6. 分支、失败、取消与恢复

排除/关键词/动作闸门/九 slug 分支；不抛错。不适用取消/恢复。

## 7. 权限与权威状态

红线（`:1`）：推荐≠扩权/删 catalog——`skillTaskMatch` 只产推荐理由，权限由策略层另定。

## 8. 修改影响面

改正则/规则 → Skill 推荐命中率（`skill-routing.ts` 快照）与测试断言；`BUILTIN_SKILL_DEPENDENCIES` → 能力门禁校验。

## 9. 测试证据

**间接测试**（同批）：`skill-routing-eval.test.ts`（45 行）与 `skill-routing.test.ts`（145 行）经 `skill-routing`/eval 层覆盖本文件判定（断言见各自测试手册）。无独立测试文件。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+3 正则+九分支+红线 | 已证实 | 逐行读 `:1-58` |
| 正则实际命中率 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+九分支 | §2/§3 | `:4-58` | covered |
| 测试 | §9 | 同批测试 | covered（间接，NOT_RUN） |
