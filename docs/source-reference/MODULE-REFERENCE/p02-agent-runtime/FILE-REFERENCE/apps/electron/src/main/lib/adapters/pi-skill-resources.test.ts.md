---
path: apps/electron/src/main/lib/adapters/pi-skill-resources.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 31a5818d9ba537abcd0c9fe923202fe6302f16dc
sha256: a34a7ff26818bad7a6ac126e0aa14b4d7e63bef9ecfafa52cb95a06b02c4bc44
lines: 190
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-skill-resources.test.ts

## 1. 测试目标

`pi-skill-resources.ts` 的 **Skill 安全边界**（describe `:33`）：白名单、symlink 逃逸、诊断脱敏、slug 歧义 fail closed、SDK 原生展开抑制、引用解析边界。被测逻辑见同组手册。

## 2. 用例清单

1 个 describe + **11 个 `test()`**：

| 用例 | 行 |
| --- | --- |
| 真实 loader 不读白名单外损坏文件、不泄露 collision 路径 | `:34-44` |
| realpath 守卫禁目录/SKILL.md symlink 逃逸，循环不挂起 | `:46-59` |
| 缺失/不可读根返回无路径诊断不抛 | `:61-67` |
| 允许文件不可读不保留 stale metadata（win skipIf） | `:69-85` |
| label alias 歧义 fail closed，canonical slug 优先 | `:87-100` |
| 单一 name alias direct 兼容，旧 slug 指向规范目录 | `:102-108` |
| 同目录 slug 跨根冲突不任意选赢家 | `:110-120` |
| SDK steer/followUp 原生展开被受管 queue 转换抑制（streamFn 抛错禁模型请求） | `:122-154` |
| 中英文标点结束引用不吞后续文字（14 标点） | `:156-165` |
| qualified 引用（`/skill:alpha:daily`）不截断为其他 slug | `:167-174` |
| `explicitSkillNames=[]` 不 reload/扫描；reload 失败脱敏保留任务 | `:176-189` |

夹具：`root()` 临时目录（`:9-13`）、`writeSkill`（`:14-21`）、真实 `DefaultResourceLoader`+`createPromaSkillsOverride`（`:22-28`）、afterEach 清理（`:29-31`）。

## 3. 真实断言

- `:41-43` skills `toEqual(['allowed'])`、diagnostics 非空、JSON 化诊断 `not.toContain(path)`。
- `:56-58` skills `toEqual([])`、诊断不含 external/'secret'。
- `:64-66` 缺失根 skills 空+诊断非空+无路径。
- `:75` chmod 0 后 `readFileSync` `toThrow()`（实测覆盖读取失败）；`:78-81` skills 空、诊断非空、prompt 保留。
- `:93-99` canonical 含'正文 common'不含'正文 alpha'；歧义含'多个匹配项'、不含 `<skill name=`、不含 path。
- `:106-107` label '教练' 与 slug 'proma-coach' 均注入 `<skill name="profer-coach"`/正文。
- `:117-119` 跨根冲突 skills 空+诊断非空+无路径。
- `:143` SDK 原生 steer 展开含'正文 alpha'（对照）；`:148-150` 受管路径 steering/followUp 消息 `toBe('\n'+original)` 且不含 `<skill name=`。
- `:162-163` 14 标点各自：注入含'正文 alpha'；`[]` 时 `toBe(prompt)`。
- `:172-173` qualified 引用含'Skill 引用诊断'不含'正文 alpha'。
- `:184-188` `[]` 时 `toBe(prompt)`；reload 抛错含诊断+prompt、`not.toContain('/secret/path')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`preparePromptForPiSkillQueue` 单独断言（仅经 queue 用例间接）；Windows 平台（skipIf）。
- 脆弱点：诊断文案字符串（'多个匹配项'等）与 SDK 行为耦合；`streamFn` 抛错模拟禁网。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例与断言如 §3 | 已证实 | 逐行读 `:1-190` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 白名单/symlink/脱敏/fail closed | 6 | covered |
| 引用解析（alias/标点/qualified/[]） | 4 | covered |
| SDK 展开抑制 | 1 | covered（真实 SDK+禁模型） |
