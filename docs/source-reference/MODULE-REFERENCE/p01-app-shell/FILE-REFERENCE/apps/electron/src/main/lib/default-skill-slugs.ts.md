---
path: apps/electron/src/main/lib/default-skill-slugs.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca93f38bef241945961c9e9852d0f5906f780783
sha256: a496a804a823afe5683de91330e07617a8be9f06d458f200b4506eba8c69baba
lines: 22
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/default-skill-slugs.ts

## 1. 结论与边界

**默认 Skill 历史 slug 兼容**（22 行）："仅维护应用明确改名过的默认 Skill；**绝不对用户自建 Skill 做模糊替换**"（`:4`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `RENAMED_DEFAULT_SKILLS` | `:6-8` | 白名单映射（仅 `proma-coach`→`profer-coach` 一对） |
| `normalizeDefaultSkillSlug` | `:11-13` | 未知 slug 原样返回 |
| `normalizeDefaultSkillSlugs` | `:19-22` | 归一化+去重（保留 undefined/空数组语义 `:16`） |

## 3. 内部逻辑与关键流程

白名单查表+Set 去重。

## 4. 调用者与调用链

预设/历史消息 Skill 列表归一化；被 `default-skill-slugs.test.ts`（2 个 `test(`）覆盖。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

undefined 透传；未知 slug 原样。

## 7. 权限与权威状态

**白名单红线**（`:4`）：不模糊替换用户 Skill。

## 8. 修改影响面

改白名单影响历史数据迁移；与 seedDefaultSkills 的 slug 迁移（config-paths）联动，是预设/历史消息归一化的单一入口。

## 9. 测试证据

`default-skill-slugs.test.ts`（同批，2 个 `test(`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/白名单红线 | 已证实 | 22 行全读 |
| 行为锁定 | 已证实 | 测试 2 用例 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
