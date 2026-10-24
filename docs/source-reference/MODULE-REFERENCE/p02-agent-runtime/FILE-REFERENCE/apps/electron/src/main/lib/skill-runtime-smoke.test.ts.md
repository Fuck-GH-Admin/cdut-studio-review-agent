---
path: apps/electron/src/main/lib/skill-runtime-smoke.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 638a9b5522e0dcc10219d3c9062ca88a86fd7891
sha256: 3e32ea90f0c430f3a9fe57f8aca872de1a22b2c6f69752e60e1212035fb35638
lines: 113
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-runtime-smoke.test.ts

## 1. 测试目标

全局 Skill 新运行时加载链路冒烟（Claude + Pi，`:1-3` 注释）：**两种 runtime 只消费同一 `prepareRuntimeSkills()` 投影，不能再直接扫描旧 master**。被测对象为 `global-skill-manager`（跨文件）与 `adapters/pi-agent-adapter.createPromaSkillsOverride`（re-export）。

## 2. 用例清单

1 个 describe + **4 个 `test()`**：

| 用例 | 行 |
| --- | --- |
| 同一 projection 同时满足 Claude manifest 与 Pi additionalSkillPaths | `:56-71` |
| 兼容路径随 projection 更新并在 Skill 禁用后回收 | `:73-91` |
| 两 workspace 默认/禁用/替换时 projection 不重复加载 | `:93-103` |
| Pi skillSlugs=[] 在有效 projection 上得 0 个 skill | `:105-112` |

夹具：`setup()`（builtin demo SKILL.md + `__setGlobalSkillRoots` + `seedBuiltinGlobalSkills`，`:25-36`）；afterEach 重置+清理（`:50-53`）。

## 3. 真实断言

- `:63-70` `.claude-plugin/plugin.json` 与 `piRoot/demo/SKILL.md` 均 `existsSync` `toBe(true)`；**兼容符号链接** `projection.path/../demo` 是 symlink 且 `readlinkSync` `toBe(join(projection.path,'skills','demo'))`、经其可读 SKILL.md；override 结果 names `toEqual(['demo'])`。
- `:77-90` alias 指向 first 投影；bump 版本重 seed 后 `second.path` `not.toBe(first.path)`、alias 重指 second；`setGlobalSkillEnabled(false)` 后 alias `existsSync` `toBe(false)`（回收）。
- `:99-102` ws-default/ws-replaced 各 `toHaveLength(1)`、ws-disabled `toHaveLength(0)`、`resolveEffectiveSkills('ws-replaced')` 亦 1（不重复加载）。
- `:111` `skillSlugs:[]` → skills `toEqual([])`。

## 4. 未覆盖与脆弱点

- 未覆盖：`copyGlobalSkillToWorkspace` 内容面（仅用作替换夹具）；真实 Claude 侧消费。
- 脆弱点：内部测试钩子 `__setGlobalSkillRoots`/`__resetGlobalSkillRoots` 与实现耦合。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 逐行读 `:1-113` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 双 runtime 同投影/兼容链接 | 1 | covered |
| 更新/禁用回收 | 1 | covered |
| 多 workspace 去重 | 1 | covered |
| 空 skillSlugs | 1 | covered |
