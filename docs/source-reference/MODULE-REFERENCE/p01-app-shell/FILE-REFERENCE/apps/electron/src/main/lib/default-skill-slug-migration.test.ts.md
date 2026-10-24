---
path: apps/electron/src/main/lib/default-skill-slug-migration.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3307be5da11b60337c560fd6e071eaa260b470c2
sha256: df5b3ddde367a6f59665744e89b40aaf6be6f496ad3dd5f9bccaec0bf2184f60
lines: 74
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/default-skill-slug-migration.test.ts

## 1. 测试目标

直接测试 `config-paths.ts` 的 `seedDefaultSkills` **slug 迁移**（proma-coach→profer-coach，1 个 describe `:42`）。2 个 `test(`。真实临时目录+PROFER_CONFIG_DIR 隔离+测试注入钩子（`__setBundledSkillsDirForTest`）。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:43-59` | 旧 master+历史快照+seed 态→新版本种子后：`existsSync('proma-coach') toBe(false)`、profer-coach 含'新版正文'、历史快照迁移、seed 态 `proma-coach toBeUndefined()`+`profer-coach toMatchObject({owner:'managed', bundledVersion})` |
| 2 | `:61-73` | **目标已存在→双保留**：两 master 内容原样不动 |

## 3. 真实断言

`toBe`/`toContain`/`toBeUndefined`/`toMatchObject`。真实 fs+环境变量隔离（afterEach 还原 `:35-40`）。

## 4. 未覆盖

- 迁移与附属文件/历史哈希接管组合（由 config-paths.test 覆盖）；多对映射。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个 `test(`、断言如 §2 | 已证实 | 文件全读（74 行） |
| 双保留防线 | 已证实 | 用例 2 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| slug 迁移/双保留 | §2 | `:43-73` | covered |
| §4 边缘 | — | — | unknown |
