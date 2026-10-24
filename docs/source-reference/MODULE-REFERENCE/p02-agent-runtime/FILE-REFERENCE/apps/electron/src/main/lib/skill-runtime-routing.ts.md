---
path: apps/electron/src/main/lib/skill-runtime-routing.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b510f98690fac8fdb0a77440ae1dc94178f00c4b
sha256: db2e7d35aa257b943b4c3f3a509cbff2f3408c5021b1a66426a58172b911e848
lines: 43
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-runtime-routing.ts

## 1. 结论与边界

**Skill 路由结果 → adapter 运行时选项的单点装配**（`skill-runtime-routing.ts:11/:32` 注释红线）：**两端使用同一份策略投影**（catalog 保留合法非推荐项、推荐不影响权限 `:11`）；`buildSkillRuntimeOptions` **必须用于实际 adapter query**，避免两端字段各自拼装漂移（`:32`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/说明 |
| --- | --- | --- | --- |
| `PreparedSkillRouting` | interface（export） | `:6-9` | `{ snapshot: SkillRoutingSnapshot; projection?: RuntimeSkillsProjection }` |
| `prepareAgentSkillRouting` | function（export） | `:12-30` | `async (input) => PreparedSkillRouting` |
| `buildSkillRuntimeOptions` | function（export） | `:33-43` | `(routing) => {skills, skillSlugs, skillMentions, additionalSkillPaths, plugins}` |

## 3. 内部逻辑与关键流程

1. `prepareAgentSkillRouting`（`:12-30`）：`createSkillRoutingSnapshot(input)` 生成快照（`:17`）；无 projection 直接返回（`:18`）；有则 `preparePolicyRuntimeSkills(projection, allowedSlugs)` 落运行时目录（`:19`）并把 `skills[].filePath` 重写到 `projection.path/skills/<slug>/SKILL.md`（**:26**）；快照与 skill 对象 `Object.freeze`（`:22-27`）。
2. `buildSkillRuntimeOptions`（`:33-43`）：`skills`/`skillSlugs` 均 `[...allowedSlugs]`；**`skillMentions: []`**（**:38 注释：共享路由已处理原始用户引用，不允许 adapter 从历史/内部上下文再扫描**）；`additionalSkillPaths`/`plugins` 仅 projection 存在时给（`{type:'local', path}` 注释：SDK local plugin API 发现工作区 Skills，非第三方插件宿主 `:40-41`）。

## 4. 调用者与调用链

入向：Pi adapter 装配链（两端共享，跨文件）；测试 `skill-runtime-smoke.test.ts`（113 行，同批）。出向：`./global-skill-manager`（getRuntimeSkillsPath/preparePolicyRuntimeSkills `:2`）、`./skill-routing`（`:3`）、`@profer/shared` 类型、`node:path`。

## 5. 数据 I/O、读写与副作用

`preparePolicyRuntimeSkills` 写运行时 skills 目录（经 global-skill-manager，跨文件）；本文件无直接 I/O。

## 6. 分支、失败、取消与恢复

projection 有/无两分支；不抛错（下游可能抛）。不适用取消/恢复。

## 7. 权限与权威状态

红线：推荐不影响权限（`:11`）、mentions 归零防越权扫描（`:37-38`）、plugin 仅 local（`:40`）。

## 8. 修改影响面

改装配 → Pi/Skill 两端运行时一致性；`skillMentions:[]` 变化会重开历史扫描面。

## 9. 测试证据

**直接测试 `skill-runtime-smoke.test.ts`（113 行，同批，NOT_RUN）**，断言见测试手册。无其他测试（负向：冻结树检索本文件 3 符号 → 仅该测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+两分支+红线 | 已证实 | 逐行读 `:1-43` |
| global-skill-manager 落盘行为 | 未知 | 跨文件未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2/§3 | `:6-43` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
