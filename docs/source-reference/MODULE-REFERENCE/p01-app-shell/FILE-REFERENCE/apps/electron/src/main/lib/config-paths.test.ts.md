---
path: apps/electron/src/main/lib/config-paths.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c5bff18a3b0bf6c74b422e151f2e60bd93c790e5
sha256: 890af9d596e0f4c95adf8ec32d7657dee58d13f64200909b5ded1c373779b903
lines: 220
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/config-paths.test.ts

## 1. 测试目标

直接测试 `config-paths.ts`（2 个 describe `:55`/`:84`）：config 目录解析/展示折叠+`seedDefaultSkills` 种子同步全策略。12 个 `test(`。真实临时目录+PROFER_CONFIG_DIR 隔离。

## 2. 用例清单

**getConfigDir（3 例 `:56-81`）**：显式隔离根返回+创建；`resolveConfigDir` 无副作用不创建；`toDisplayPath` 折叠 home 前缀（`~/.cdutai/...`）。

**seedDefaultSkills（9 例 `:85-219`）**：新安装写受管元 Skill+基线哈希；**未改动受管→升级自动替换**；**用户改 frontmatter/正文/加附属文件→user-owned 不覆盖**（3 例）；机制前已有 Skill→保留 user-owned；**无种子态但哈希精确命中历史内置→接管升级**；历史带用户附属→不接管；**旧版误标 user-owned 的完整历史种子→仍接管升级**。

## 3. 真实断言

`toBe`/`toContain`/`toMatchObject`/`toEqual`/`toBeTruthy`/`existsSync`。真实 fs+sha256 哈希构造（`:178`）；测试注入双钩子。

## 4. 未覆盖

- resolveConfigDir 非 override 场景；toDisplayPath 边缘（Windows 盘符）；并发种子。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个 `test(`、断言如 §2 | 已证实 | 文件全读（220 行） |
| **用户数据防线**（3 个不覆盖用例）+**误标纠正**（`:205-219`） | 已证实 | `:111-154`/`:205-219` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 目录解析/种子全策略 | §2 | covered |
| §4 边缘 | — | — | unknown |
