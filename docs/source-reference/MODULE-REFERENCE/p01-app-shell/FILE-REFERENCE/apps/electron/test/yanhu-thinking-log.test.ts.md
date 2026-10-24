---
path: apps/electron/test/yanhu-thinking-log.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 04b27f1b8932ef893811fbe0076dabab8d7fc494
sha256: 32953b7ddb3f8989d586521b0e874c26699e2ee4d8b06832ee514bfe9585864b
lines: 112
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---
# apps/electron/test/yanhu-thinking-log.test.ts

## 1. 测试目标

「砚小龙」思考链落盘（`yanhu-thinking-log`）单元测试（`apps/electron/test/yanhu-thinking-log.test.ts:2`）。按文件头声明覆盖三件事（`apps/electron/test/yanhu-thinking-log.test.ts:4`）：思考正文与工具结果的按上限截断、JSONL 单行可还原、追加式落盘（两轮 = 两行）。

被测对象：`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts`（96 行，append-only JSONL 落盘模块，`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:1-12` 说明为何独立成文件：单轮思考链可达数万字符、追加式无竞态、一行一轮便于 grep）。

测试性质：Bun 测试（`bun:test` 导入 `apps/electron/test/yanhu-thinking-log.test.ts:7`），**NOT_RUN**——本轮未执行任何测试运行器，断言为静态阅读所得，不代表「测试通过」。落盘用例（§2 用例 6-7）是**真实文件系统写入**（`node:fs/promises` 的 `readFile, rm` 直接导入 `apps/electron/test/yanhu-thinking-log.test.ts:8`，被测内部真实 `appendFile` `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:14,92`），写在 `os.tmpdir()`（`apps/electron/test/yanhu-thinking-log.test.ts:9,83,104`）。

## 2. 用例清单

用例计数（grep 实测）：`it(` **7** 处（`apps/electron/test/yanhu-thinking-log.test.ts:20,37,47,59,66,82,102`），`test(` **0** 处，`describe(` 3 处（`:19,65,81`）。7 个用例运行时相互独立（每例构造自己的输入/临时路径）；用例 6 内部两轮追加是顺序 `await`（`:85-92`），用例 7 独占另一路径（`:104`）。

mock 边界：**无任何 mock**（`mock.` / `spyOn` / `mock.module` 全文件 0 命中，已 grep 实测）。磁盘 I/O 全部走真实实现：`appendFile`（被测 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:92`）、`readFile`/`rm`（`apps/electron/test/yanhu-thinking-log.test.ts:8,93,98`）；`console.warn` 也是真实输出、未被替换也未被断言（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:94`）。副作用边界：只写 `os.tmpdir()` 下的唯一命名文件（`:83` 含 `Date.now()`+随机串），用例 6 在 `finally` 清理（`:97-99`）；用例 7 预期写入失败（父目录 `yanhu-not-a-dir-<ts>` 不存在，`:103-104`）不留残留。

| # | 用例（it 标题语义） | 设置 | 动作 | 真实断言 | 依赖 |
| --- | --- | --- | --- | --- | --- |
| 1 | 正常输入组装保留提问/思考/工具时间线（`:20`） | 完整输入：`messageId`/`userText`/`reasoning`/1 条 tool（label/status/result）/`at: 1792148000000`（`apps/electron/test/yanhu-thinking-log.test.ts:21-27`） | `buildYanhuThinkingRecord`（`:21`） | `:28` `at` 原值、`:29` `messageId`、`:30` `userText`、`:31` `reasoning`、`:32-34` `tools` `toEqual` 完整对象 | 无 |
| 2 | 超长思考按上限截断并标记原始长度（`:37`） | `reasoning: 'x'.repeat(MAX_THINKING_REASONING_CHARS + 500)`，其余精简（`:38-42`） | 同上（`:38`） | `:43` `reasoning.length` `toBeGreaterThan(MAX)`；`:44` 含 `` `已截断：原始 ${MAX + 500} 字符` `` | 无 |
| 3 | 工具结果超长逐条截断、思考本体不受影响（`:47`） | `reasoning: 'ok'`，1 条 tool result `'y'.repeat(2000)`、status `error`（`:48-52`） | 同上（`:48`） | `:54` `reasoning` `toBe('ok')`；`:55` `tools[0].result` `startsWith('y'.repeat(MAX_THINKING_TOOL_RESULT_CHARS))`；`:56` 含 `'已截断'` | 无 |
| 4 | 缺省工具时间线为空数组而非 undefined（`:59`） | 不传 `tools`，仅 `messageId/userText/reasoning`（`:60`） | 同上（`:60`） | `:61` `record.tools` `toEqual([])` | 无 |
| 5 | 序列化恰好一行且 JSON.parse 完整还原（`:66`） | 记录含换行 `userText`（`'换行\n与"引号"'`）/换行 `reasoning`/1 条 tool/`at: 1`（`:67-73`） | `serializeYanhuThinkingRecord`（`:74`） | `:75` `line.endsWith('\n')` `true`；`:76` `trimEnd().split('\n')` `toHaveLength(1)`；`:77` `JSON.parse(line)` `toEqual(record)` | 无 |
| 6 | 连续两轮追加→文件两行且各自可解析（`:82`，async） | 唯一临时路径（`:83`）；两轮记录 `m1@at=1`、`m2@at=2`（`:86-91`） | 两次 `appendYanhuThinkingRecord` 顺序 `await`（`:85-92`）→ `readFile`（`:93`） | `:94` `lines` `toHaveLength(2)`；`:95` `lines[0]` 的 `messageId` `toBe('m1')`；`:96` `lines[1]` 的 `reasoning` `toBe('r2')`；`:98` `finally` 中 `rm` 清理 | 无 |
| 7 | 目标路径不可写→静默告警绝不抛错（`:102`，async） | `broken = join(tmpdir(), 'yanhu-not-a-dir-<ts>', 'x.jsonl')`，父目录不存在（`:103-104`） | `appendYanhuThinkingRecord`（`:106-109`） | `:105-110` `expect(...).resolves.toBeUndefined()`（不 reject、无返回值） | 无 |

## 3. 真实断言

按用例引用真实 `expect` 行（均在 `apps/electron/test/yanhu-thinking-log.test.ts` 112 行内）：

- 用例 1：`apps/electron/test/yanhu-thinking-log.test.ts:28`（`record.at` 精确等值，`at` 由输入原样传入 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:69`）、`:29`（`messageId`）、`:30`（`userText`）、`:31`（`reasoning` 未截断原样保留）、`:32-34`（`tools` 逐字段 `toEqual`：label/status/result 三字段，对应落盘映射 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:63-67`）。
- 用例 2：`apps/electron/test/yanhu-thinking-log.test.ts:43`（长度大于上限——因截断后缀被追加，`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:47`）、`:44`（含 `已截断：原始 <原始长度> 字符` 标记，模板 `` `已截断：原始 ${raw.length} 字符，超出上限 ${limit}]` `` `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:47`）。
- 用例 3：`apps/electron/test/yanhu-thinking-log.test.ts:54`（`reasoning` 不受工具截断影响，两条截断独立走 `clipText` `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:45-48`）、`:55`（前缀恰为 `MAX_THINKING_TOOL_RESULT_CHARS`=400 个 `y`，常量 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:21`，切片 `:66` 经 `clipText` `:47`）、`:56`（后缀含 `已截断`）。
- 用例 4：`apps/electron/test/yanhu-thinking-log.test.ts:61`（`tools` 缺省走 `(input.tools ?? [])`，`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:63`）。
- 用例 5：`apps/electron/test/yanhu-thinking-log.test.ts:75`（序列化输出以 `\n` 收尾，`` `${JSON.stringify(record)}\n` `` `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:79`）、`:76`（换行/引号被 JSON 转义后恰好一行）、`:77`（`JSON.parse` 与原记录深等——往返无损）。
- 用例 6：`apps/electron/test/yanhu-thinking-log.test.ts:94`（两轮追加 = 两行，真实 `appendFile` 不加锁的追加语义 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:92`）、`:95`（第 1 行可解析出 `m1`）、`:96`（第 2 行可解析出 `r2`）；清理断言外副作用：`:98`。
- 用例 7：`apps/electron/test/yanhu-thinking-log.test.ts:105-110`（`resolves.toBeUndefined()`——`appendYanhuThinkingRecord` 内部 `try/catch` 吞掉 `appendFile` 异常仅 `console.warn`，返回 `Promise<void>`，`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:87-96`）。

## 4. 未覆盖与脆弱点

未覆盖（逐项依据）：

1. `getYanhuThinkingLogPath`（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:40-42`）**无直接测试**：两个落盘用例都显式传 `filePath`（`apps/electron/test/yanhu-thinking-log.test.ts:83,104`），默认参数分支（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:89`）与 `getConfigDir()` 路径拼接（`:16,41`）未被断言。
2. `at: input.at ?? Date.now()` 默认分支（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:69`）未断言：用例 2-4/7 均省略 `at` 但不检查 `record.at`。
3. `reasoning ?? ''` 的空值兜底（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:72`）无用例。
4. 非字符串 `tool.result` 的 `String(tool.result ?? '')` 转换（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:66`）无用例（用例 1/3/5/6 的 result 均为字符串）。
5. `userText` 是否截断无断言（实现为原样透传 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:71`，长 `userText` 行为未验证）。
6. `clipText` 恰等于上限的边界（`raw.length <= limit` 早退，`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:46`）无用例（用例 2 是 MAX+500，用例 3 是 2000→400）。
7. `console.warn` 的输出内容未断言（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:94`；用例 7 只断言 resolve 值）。
8. 并发/交错追加（两进程同写一文件）未测：用例 6 是严格顺序 `await`（`apps/electron/test/yanhu-thinking-log.test.ts:85-92`）。
9. 编码/权限/磁盘满/Windows 路径等 I/O 故障矩阵未测（用例 7 仅覆盖「父目录不存在」一种失败，`apps/electron/test/yanhu-thinking-log.test.ts:103-104`）。

脆弱点：

- 截断标记的中文文案 `已截断：原始 N 字符` 被直接断言（`apps/electron/test/yanhu-thinking-log.test.ts:44,56`），与实现模板（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:47`）强耦合：文案/格式微调即碎。
- 用例 3 的 `:55` 依赖上限常量恰为 400 且实现保留完整前缀（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:21,47`）；改常量或改成「尾部保留」策略即碎。
- 用例 7 依赖 `appendFile` 在父目录缺失时 reject 且实现吞错（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:91-95`）：若日后改为自动建目录或向上抛错，用例语义（`resolves.toBeUndefined()`）会失真而非简单变红。
- 临时文件名含 `Date.now()`+随机串（`apps/electron/test/yanhu-thinking-log.test.ts:83,104`），极端并发碰撞概率非零（当前单文件串行运行无此问题）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| `it(` 7 个调用点、`test(` 0、`describe(` 3 | 已证实 | grep 实测：`apps/electron/test/yanhu-thinking-log.test.ts:20,37,47,59,66,82,102` |
| 测试导入 5 符号：`appendYanhuThinkingRecord` / `buildYanhuThinkingRecord` / `MAX_THINKING_REASONING_CHARS` / `MAX_THINKING_TOOL_RESULT_CHARS` / `serializeYanhuThinkingRecord` | 已证实 | `apps/electron/test/yanhu-thinking-log.test.ts:11-17` |
| 被测模块 8 个导出（2 常量 `:19,:21`、2 接口 `:24,:31`、4 函数 `:40,:56,:78,:87`）+ 1 内部函数 `clipText` `:45` | 已证实 | 逐行读 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:1-96` 全文 |
| 零 mock：真实 `appendFile`/`readFile`/`rm`，真实 `os.tmpdir()`，真实 `console.warn` | 已证实 | `apps/electron/test/yanhu-thinking-log.test.ts:7-10` + 全文件 grep `mock.\|spyOn\|mock.module` 0 命中 |
| 截断双上限：正文 200_000、单条工具结果 400，超出以 `…[已截断：原始 N 字符，超出上限 L]` 收尾 | 已证实 | `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:19,21,45-48` |
| 生产唯一调用者 `yanhu-pi-runtime.ts`：导入 `:49`；成功路径 `:431-437` 与异常/中止路径 `:480-486` 均以 `void appendYanhuThinkingRecord(buildYanhuThinkingRecord({...}))` 落盘（fire-and-forget、默认路径） | 已证实 | `apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts:49,431-437,480-486`（读到行段 415-500）；全冻结树 git grep `yanhu-thinking-log` 仅命中该文件与本测试 |
| `getYanhuThinkingLogPath` 无模块外消费者 | 已证实 | 全冻结树 git grep 仅命中 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:40,89` |
| 其它测试文件均不引用本模块符号（无间接测试证据） | 已证实 | 全冻结树 git grep（`*test*` 限定）`buildYanhuThinkingRecord\|appendYanhuThinkingRecord` 仅命中本测试；`yanhu-pi-runtime.test.ts` 的 describe 只测内存/历史纯函数（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.test.ts:31,55,79,88,162,200`） |
| 用例 2 截断后长度 = 上限 + 后缀长度（故 `> MAX`） | 推断 | `clipText` 先 `slice(0, limit)` 再拼后缀 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:47`；NOT_RUN 未实测数值 |
| append-only 追加天然无竞态、不受记忆窗口裁剪影响 | 推断 | 模块自述 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:5-7` + `appendFile` 追加语义；并发交错未测（§4 未覆盖 8） |
| 测试运行结果（通过/失败、断言数） | 未知 | **NOT_RUN**：本轮未执行 bun test / typecheck / build / GUI，禁止当作「已通过」 |
| `getConfigDir()` 的实际解析（开发版 `~/.cdutai-dev` 等） | 未知 | `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:16,41` 引 `../../config-paths`，其实现本文件未读 |
| 用例 7 运行时 `console.warn` 是否向 stderr 输出噪声 | 未知 | 实现 `apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:94`，NOT_RUN 未观察 |

## 6. 覆盖表

| 符号 / 分支（被测侧） | 手册章节 | 手册行 | 状态 |
| --- | --- | --- | --- |
| `buildYanhuThinkingRecord` 字段保留（`apps/electron/src/main/lib/cdut/yanhu/yanhu-thinking-log.ts:56-75`） | §2 用例 1 / §3 | §2 表 1 行 | covered |
| `reasoning` 截断（`clipText` `:45-48` + `:72`，上限 `:19`） | §2 用例 2 / §3 | §2 表 2 行 | covered |
| 单条工具结果截断（`:66` + `:47`，上限 `:21`） | §2 用例 3 / §3 | §2 表 3 行 | covered |
| `tools` 缺省 `?? []`（`:63`） | §2 用例 4 / §3 | §2 表 4 行 | covered |
| `reasoning ?? ''` 空值兜底（`:72`） | §4 未覆盖 3 | §4 | unknown |
| 非字符串 `result` 的 `String()` 转换（`:66`） | §4 未覆盖 4 | §4 | unknown |
| `at ?? Date.now()` 默认分支（`:69`） | §4 未覆盖 2 | §4 | partial |
| `userText` 透传（`:71`） | §4 未覆盖 5 | §4 | partial |
| `serializeYanhuThinkingRecord` 单行 + 可还原（`:78-80`） | §2 用例 5 / §3 | §2 表 5 行 | covered |
| `appendYanhuThinkingRecord` 成功追加（`:91-92`） | §2 用例 6 / §3 | §2 表 6 行 | covered |
| `appendYanhuThinkingRecord` 失败吞错仅告警（`:93-95`） | §2 用例 7 / §3 | §2 表 7 行 | covered |
| `getYanhuThinkingLogPath` / 默认路径参数（`:40-42,89`） | §4 未覆盖 1 | §4 | unknown |
| `clipText` 恰等上限边界（`:46`） | §4 未覆盖 6 | §4 | unknown |
| 并发交错追加 / I/O 故障矩阵 | §4 未覆盖 8-9 | §4 | unknown |
| `console.warn` 输出（`:94`） | §4 未覆盖 7 / §5 | §4 | unknown |
| `YanhuThinkingToolStep` / `YanhuThinkingRecord` 接口形状（`:24-37`） | §2 用例 1、5（运行时字段）/ §5 | §2 表 1、5 行 | partial（纯类型，仅编译期） |
