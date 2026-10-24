---
path: scripts/check-boundaries.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7d1f80633d57a51f2693bdbcf6845ae516d03cc2
sha256: 3db03c4a700f79a18dfd088a68bdc357a3030206064babd34adceb868f72a7d3
lines: 97
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/check-boundaries.test.ts

## 1. 测试目标

验证边界检查的路径工具（`check-boundaries-paths.ts`）与实际入口（`check-boundaries.ts`）：①workspace 定位与 within 判定跨 POSIX/Windows-C/Windows-D 三平台语义；②fixture 端到端（空格+中文路径）验证 R5/R2/R3 违规与通过路径的真实退出码/输出。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 8 个定义（`describe` 3 个；`it(` 0 个）；其中 3 个在三平台循环（`POSIX`/`Windows C`/`Windows D`，`:8-12`）中各执行一次 → **14 次执行**。

| # | 用例 | 行 | 平台执行 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 定位 packages 和 apps 的所属 workspace | 16-21 | ×3 | ui/src→ui、apps/cli/src→apps/cli、scripts→root |
| 2 | 允许根目录及内部导入，含 `..cache` 两开头目录名 | 23-27 | ×3 | within 三例 true |
| 3 | 拒绝父目录越界和同名前缀相邻目录 | 29-34 | ×3 | 父目录/`ui-extra`/`apps-extra` false |
| 4 | Windows 跨盘路径不属于根目录 | 38-41 | 1 | C 根 vs D 文件 false |
| 5 | Windows 同盘按本机语义忽略大小写 | 43-46 | 1 | 大小写混用 true |
| 6 | 合法的内部引用通过 | 78-82 | 1 | fixture `./lib/cn` → status 0 + "无边界违规" |
| 7 | 跨 workspace 相对引用被 R5 和 R2 拒绝 | 84-89 | 1 | `../../../apps/cli/src/index` → status 1 + `[R5]`+`[R2]` |
| 8 | 未声明共享依赖被 R3 拒绝 | 91-96 | 1 | `@profer/core` → status 1 + `[R3]` + 未声明文案 |

## 3. 真实断言

`:17-20` 三处 `toBe(uiRoot/…/root)`；`:24-26` 三处 `toBe(true)`；`:30-33` 三处 `toBe(false)`；`:39-40` `toBe(false)`；`:44-45` `toBe(true)`；`:80-81` `toBe(0)`+`toContain('无边界违规')`；`:86-88` `toBe(1)`+`toContain('[R5]')`+`('[R2]')`；`:93-95` `toBe(1)`+`('[R3]')`+`('@profer/ui 未在 dependencies 声明')`。

## 4. 未覆盖与脆弱点

- 未覆盖：R1/R4/R6/R7 端到端 fixture、动态 import、`..cache` 之外的特殊目录、坏 package.json 失败路径。
- 脆弱点：`runFixture`（`:48-75`）真实 spawnSync `process.execPath`（bun）执行 10s 超时（`:68`），临时目录名含空格+中文（`profer boundaries 中文 `，`:49`）专测路径健壮性；fixture package.json 的 `exports:{'.':'./src/index.ts'}` 供 R4 语境；断言含中文输出文案耦合（`:81,95`）。
- mock 边界：无 mock——真实 fs/真实 spawnSync 子进程；仅被测函数注入 pathOps（posix/win32）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 定义/14 执行与断言行号 | 已证实 | `:8-96` 逐行读 |
| 三平台循环执行语义 | 已证实 | `:8-12` for-of |
| fixture 真实子进程 | 已证实 | `:65-69` |
| 无 mock | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测行为 | 用例 | 状态 |
| --- | --- | --- |
| `workspaceRootOf` | 1（×3） | covered |
| `isPathWithin` 合法/越界/同名前缀 | 2,3（×3）、4、5 | covered |
| 入口 R5/R2 | 7 | covered |
| 入口 R3 | 8 | covered |
| 入口通过路径 | 6 | covered |
| R1/R4/R6/R7 端到端 | - | unknown（未覆盖） |
