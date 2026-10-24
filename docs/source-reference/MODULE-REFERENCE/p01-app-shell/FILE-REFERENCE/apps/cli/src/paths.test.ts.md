---
path: apps/cli/src/paths.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ec4e9c33993eb2c98086e43f56b0422be0917521
sha256: 069fb654003fcd09f0aed89adaee61c8c8a1fc0862a2cab8c9b0ceb09fd1b524
lines: 36
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/paths.test.ts

## 1. 测试目标

验证 `paths.ts` 的 `resolveConfigDir`：①默认生产目录 `~/.profer`；②`--dev`/`PROFER_DEV`/`PROMA_DEV` 三途径到 `~/.profer-dev`；③显式 `configDir` 最高优先。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 3 个（`describe` 1 个；`it(` 0 个）。夹具：保存/恢复 `PROFER_DEV`/`PROMA_DEV` 环境变量（`:6-14`，afterEach 还原）。

| # | 用例 | 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | defaults to the Profer production directory | 17-21 | 删除两环境变量 | `join(homedir(), '.profer')` |
| 2 | --dev 与两环境变量均到 dev 目录 | 23-30 | `{dev:true}`、PROFER_DEV='1'、PROMA_DEV='1' | 三次均 `join(homedir(), '.profer-dev')` |
| 3 | 显式 configDir 优先 | 32-35 | PROFER_DEV='1' + `{configDir:'D:/custom-profer'}` | `'D:/custom-profer'` |

## 3. 真实断言

`:20` `expect(resolveConfigDir()).toBe(join(homedir(), '.profer'))`；`:24-29` 三处 `toBe(join(homedir(), '.profer-dev'))`；`:34` `toBe('D:/custom-profer')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`PROFER_CONFIG_DIR`（CLI 不支持，无断言）、与主应用 `config-paths.ts`（`~/.cdutai`）的一致性——**本测试以 `~/.profer` 为期望值，恰好锚定了与主应用不一致的口径**（矛盾见 `paths.ts.md` §8，测试不构成其回归防护）。
- 脆弱点：依赖真实 `homedir()`；环境变量全局共享（afterEach 只还原两个，其它测试并行污染风险低——bun 默认同文件串行，推断）。
- mock 边界：无 mock；纯函数直测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例与断言行号 | 已证实 | `:6-35` 逐行读 |
| 三途径 dev + 显式优先 | 已证实 | 用例 2-3 |
| 测试口径与主应用 config-paths 不一致 | 已证实 | `:20,24-29` vs `config-paths.ts:23-45` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 默认目录 | 1 | covered |
| dev 三途径 | 2 | covered |
| configDir 优先 | 3 | covered |
| 与主应用一致性 | - | unknown（无断言且存在矛盾） |
