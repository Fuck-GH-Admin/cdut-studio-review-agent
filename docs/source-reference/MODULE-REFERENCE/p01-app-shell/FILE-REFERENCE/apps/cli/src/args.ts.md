---
path: apps/cli/src/args.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d59fac3b135a06e5f57b27646fe72075dfa1b8b0
sha256: e91720b5f4da6d169a2341a32fb5b6548a72ebddc91011fe06e77352412fa974
lines: 74
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/args.ts

## 1. 结论与边界

极简零依赖参数解析（CLI 纯函数）：`--flag`→true、`--key value`/`--key=value`→string、其余为 positionals；数值/区间语义由命令自解析（文件头 `apps/cli/src/args.ts:1-11`）。不引入 yargs/commander（`:4-5` 注释：减体积与解析歧义）。

边界：不做校验（命令层用 `UsageError`）；不识别短横线组合（`-abc` 会进 positionals，`:37-38`）。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 5 函数 = 6 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ParsedArgs` | 接口（导出） | 12-15 | `{positionals: string[], flags: Record<string, string\|boolean>}` | |
| `parseArgs` | 函数（导出） | 17-43 | `(argv: string[]) => ParsedArgs` | 主解析 |
| `strFlag` | 函数（导出） | 46-52 | `(flags, ...names) => string \| undefined` | 仅 string 值 |
| `boolFlag` | 函数（导出） | 55-57 | `(flags, ...names) => boolean` | 存在即真（含字符串 `'true'`） |
| `numFlag` | 函数（导出） | 60-65 | `(flags, ...names) => number \| undefined` | Number+isFinite |
| `parseRange` | 函数（导出） | 68-74 | `(s?) => [number, number] \| undefined` | `"A-B"` 闭区间；`"N"`→[N,N] |

无内部函数。

## 3. 内部逻辑与关键流程

`parseArgs`（`:21-40`）：`--` 前缀进 flags——含 `=` 取等号两侧（`:25-27`）；否则看下一参：非 `--` 开头则作值并跳过（`:29-32`），否则 boolean true（`:33-35`）。注意：值以 `--` 开头会被判为 boolean（`--key --x` → key=true，`:30`）。

辅助：`strFlag` 多别名取首个 string（`:46-52`）；`boolFlag` `===true || ==='true'`（`:56`）；`numFlag` 失败 undefined（`:63-64`）；`parseRange` 正则 `^(\d+)-(\d+)$`/`^\d+$`（`:70-73`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`apps/cli/src/index.ts:17,64-69`（parseArgs/strFlag/boolFlag）；`commands/list.ts:7`、`commands/outline.ts:10`、`commands/search.ts:10`、`commands/export.ts:18`（各辅助函数）。测试：`args.test.ts`（本批 12 用例）。

出向：无（纯函数模块）。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O/状态/副作用（依据：全文读）。幂等。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| `--k=v` | 含等号 | 25-27 |
| `--k v` | 下参非 -- | 29-32 |
| `--k`（true） | 下参是 -- 或缺 | 33-35 |
| positional | 非 -- 前缀 | 37-38 |
| 数值失败 | Number 非有限 | 63-64 |
| 区间失败 | 格式不符 | 70-73 |

无异常路径（不抛）；无取消/恢复概念，依据：纯函数。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；flag 语义权威在各命令解释。

## 8. 修改影响面

- index.ts + 4 个 commands 消费（§4）；改解析规则影响全部命令行。
- `--key --x` 判 true 的边界行为被测试锚定（`args.test.ts:21-25`）。
- 需同步的测试：`args.test.ts`（12 用例，本批）。

## 9. 测试证据

直接测试：`apps/cli/src/args.test.ts`（本批，12 用例，逐条见该手册）。真实断言：`--key value`/`=value`/裸 flag/相邻 flag 四形态（测试 `:5-25`）；strFlag/boolFlag/numFlag 五例（`:28-35`）；parseRange 三例（`:37-43`）。

未覆盖：`--key --x` 边界（仅间接，`:21-25` 覆盖「后跟 --flag」）、空值 `--key=`、负数。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出 + 解析语义 | 已证实 | `:12-74` 逐行读 |
| `--key --x`→true 边界 | 已证实 | `:29-35` + 测试 `:21-25` |
| 5 消费文件 | 已证实 | §4 行号 |
| 空值/负数行为 | 推断 | 由解析逻辑推（未测） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ParsedArgs`/`parseArgs` | §2-3 | 12-43 | covered |
| 4 个辅助 | §2-3 | 46-74 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
