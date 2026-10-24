---
path: apps/electron/src/main/lib/adapters/pi-skills-override.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 56b0c23d02b382395424df65d896d5926a697458
sha256: 6ef2b3340cec701f238b1e7b52bced74acce8a53f09ab185adb5afa0a6d436b3
lines: 192
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-skills-override.test.ts

## 1. 测试目标

`createPromaSkillsOverride` 的 **skillSlugs 三语义**（`:2-8` 注释：undefined 不裁剪 / [] 全隐 / 非空白名单）+ 路径守卫；以及真实 `DefaultResourceLoader` 下的 Skill 门禁（SDK 去重恢复、alias 歧义、显式引用语义）。被测函数源在 `pi-skill-resources.ts`（经 `./pi-agent-adapter` re-export 导入，`:15`）。

## 2. 用例清单

2 个 describe + **14 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| createPromaSkillsOverride skillSlugs 语义（6） | undefined 全量 / [] 全隐 / 白名单 / 根外过滤 / 历史 Coach 新旧目录只注新副本 / synthetic name 不扩白名单 | `:70-104` |
| 真实 DefaultResourceLoader Skill 门禁（8） | SDK 按 name 吞后恢复仅允许项 / 同 name 允许目录恢复 / 全量保留目录 slug 唯一 / 仅 override 根也保 SDK 行为 / alias 歧义关闭无路径诊断 / [] 不扫 undefined 保扫描 / 同 label 两 canonical 都展开 / 歧义与不存在引用安全诊断 | `:123-191` |

夹具：`makeSkill`/`makeBase`（`:23-42`）；`skillsRoot`（synthetic）与 `realSkillsRoot`（真实 SKILL.md：same-a/same-b 共 name 'shared'、ambiguous/ambiguous-copy 共 name 'alias'，`:44-62`）；`makeLoader`（真实 SDK+override，`:107-120`）。

## 3. 真实断言

- `:73` undefined → names `toEqual(['alpha','beta'])`；`:79` `[]` → `toEqual([])`；`:85` `['alpha']` → `['alpha']`；`:91` 根外 `outside`（name 冒充 'alpha'）被过滤；`:97-98` `['proma-coach']` → 只注 `['profer-coach']`（新副本）；`:103` synthetic name='alpha' 但目录非规范 → `toEqual([])`。
- `:132-137` SDK 基线 name 吞并只留 same-a 且有 collision 诊断；override `['same-b']` 恢复 `['same-b']`。
- `:143-146` 恢复项 filePath 指向 realSkillsRoot/same-b；JSON 结果 `not.toContain('same a')`、诊断 `not.toContain('same-a')`（不泄露碰撞方）。
- `:152-153` 全量 → 4 目录 slug 都保留（`sort()` `toEqual`）。
- `:159` 仅 override 根仍 `['same-b']`。
- `:165-167` alias 歧义 → skills 空+诊断非空+不含 realSkillsRoot。
- `:173-174` `[]` → `toBe(prompt)`；undefined → 含 `<skill name="same-b"`（旧扫描）。
- `:180-181` 同 label 两 canonical 都展开（不吞其一）。
- `:187-190` 歧义+缺失引用 → 含'Skill 引用'、保留'继续任务'、不含路径、不含 `<skill name=`。

## 4. 未覆盖与脆弱点

- 未覆盖：Windows 平台差异；`preparePromptForPiSkillQueue`（在 pi-skill-resources.test.ts 间接覆盖）。
- 脆弱点：name/slug 夹具耦合 SDK 去重语义（SDK 升级需复核）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例与断言如 §3 | 已证实 | 逐行读 `:1-192` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| skillSlugs 三语义+路径守卫 | 6 | covered |
| 真实 loader 门禁/恢复/歧义/引用 | 8 | covered |
