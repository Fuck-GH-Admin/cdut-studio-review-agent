---
path: apps/electron/test/yanhu-pet-prompt.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3445025e1323431c8b0200341226d28c0b716aa9
sha256: 6a211af2525ba28b971465ce8b3c6e82f88887c896218179d1415619c73ff9d0
lines: 203
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---
# apps/electron/test/yanhu-pet-prompt.test.ts

## 1. 测试目标

「砚小龙」系统提示词 ↔ 工具清单一致性回归测试（`apps/electron/test/yanhu-pet-prompt.test.ts:2`）。锁死历史故障：提示词曾无条件宣传 `yanhu_eval_script`（开发者级）与视觉类工具，而运行时按开关把它们从工具清单过滤掉，模型「看得见、调不到」，只能凭猜测拼参数（如用 `script` 代替 `expression`）被运行时判「未知工具」（`apps/electron/test/yanhu-pet-prompt.test.ts:4-8`；被测模块自述同一不变式 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:4-11`）。

核心不变式（`apps/electron/test/yanhu-pet-prompt.test.ts:8`）：**提示词中出现的每一个工具名都必须是当次真实挂载的工具**。第二类不变式是「工具行为变了提示词必须同步」的三条契约沉淀（`apps/electron/test/yanhu-pet-prompt.test.ts:136-139`）：控件族→工具映射、回执契约、视觉点击只能依据地标表。

被测对象：`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts`（195 行，纯函数提示词装配模块，无 Electron/主进程依赖，`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:2`）。

测试性质：Bun 测试（`bun:test` 导入 `apps/electron/test/yanhu-pet-prompt.test.ts:11`），**NOT_RUN**——本轮未执行任何测试运行器，所有断言为静态阅读所得，不代表「测试通过」。本文件零 mock（见 §2 mock 边界），不涉及磁盘/网络/进程副作用。

## 2. 用例清单

用例计数（grep 实测）：`it(` 静态调用点 **16** 处（`apps/electron/test/yanhu-pet-prompt.test.ts:54,62,66,76,82,88,94,102,109,118,126,141,150,162,171,194`），`test(` **0** 处，`describe(` 5 处（`apps/electron/test/yanhu-pet-prompt.test.ts:53,75,101,140,182`）。运行时用例 **19** 个：最后一组是表驱动（4 场景 `apps/electron/test/yanhu-pet-prompt.test.ts:183-191` 上的 `for` 循环 `:193` 生成 4 个 `it`，`:194`），16 − 1 + 4 = 19（推断，NOT_RUN 未实测运行器报告数）。

依赖顺序：19 个用例全部相互独立（纯函数、无共享可变状态、无 I/O）；表驱动 4 用例共享只读常量 `scenarios`（`apps/electron/test/yanhu-pet-prompt.test.ts:183-191`）但运行互不影响。

mock 边界：**无任何 mock**（`mock.` / `spyOn` / `mock.module` 全文件 0 命中，已 grep 实测）。工具对象由工厂伪造最小结构：`tool()` 只给 `definition.name/description`（`apps/electron/test/yanhu-pet-prompt.test.ts:40-42`，description 缺省 `` `${name} 的说明` ``），`mounted()` 映射成数组（`:44-46`）；被测函数走**真实实现**（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:156-195`）。运行时真实工具构建/开关过滤（`buildYanhuBrowserTools`，调用点 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts:36`）不在本测试断言范围内。

| # | 用例（it 标题语义） | 设置 | 动作 | 真实断言 | 依赖 |
| --- | --- | --- | --- | --- | --- |
| 1 | 一批工具→逐个列出且数量正确（`:54`） | `mounted(...ALWAYS_MOUNTED)` 7 个常量工具名（`apps/electron/test/yanhu-pet-prompt.test.ts:20-28,55`） | `buildMountedToolsSection`（`:55`） | `:56` 标题含 `## Mounted Gate Tools (7)`；`:57-59` 循环断言每个 `` `name` `` | 无 |
| 2 | 空清单→数量 0 且不抛异常（`:62`） | `[]`（`:63`） | 同上（`:63`） | `:63` 含 `## Mounted Gate Tools (0)`；调用完成即未抛 | 无 |
| 3 | 描述含换行→压缩单行（`:66`） | 单工具，description `'第一行\n   第二行   第三行'`（`:67-69`） | 同上（`:67`） | `:70` 含 `'第一行 第二行 第三行'`；`:71` 含「第一行」的行恰 1 | 无 |
| 4 | 基础人设不含任何受门控工具（`:76`） | `GATED_TOOLS` 6 个门控工具名（`apps/electron/test/yanhu-pet-prompt.test.ts:31-38`） | 对常量 `YANHU_PET_SYSTEM_PROMPT` 逐名 `not.toContain`（`:77-79`） | `:78` | 无 |
| 5 | 基础人设出现的工具全部属于始终挂载集合（`:82`） | `extractToolNames` 正则 `/yanhu_[a-z0-9_]+/g` 提取（`:49-51,83`） | 每个提取名查 `ALWAYS_MOUNTED`（`:83-85`） | `:84` | 无 |
| 6 | 访问范围放开 http/https、仅拦非网页协议（`:88`） | 基础人设常量（`:89`） | `toContain` 三段（`:89-91`） | `:89` `<web_scope>`、`:90` `NOT restricted to the campus intranet`、`:91` `` `mailto:` `` | 无 |
| 7 | 操作流纪律约束冗余重读与手拼 URL（`:94`） | 同上（`:95`） | `toContain` 三段（`:95-97`） | `:95` `Do NOT call \`yanhu_read_page\` again after a successful`、`:96` `instead of hand-crafting URL paths`、`:97` `Bid Self-Healing (STRICT)` | 无 |
| 8 | 默认挂载→不含 developer_tools/visual_perception（`:102`） | `buildYanhuPetSystemPrompt(YANHU_PET_SYSTEM_PROMPT, mounted(...ALWAYS_MOUNTED))`（`:103`） | 组装后 `not.toContain`×3（`:104-106`） | `:104` `<developer_tools>`、`:105` `<visual_perception>`、`:106` `yanhu_eval_script` | 无 |
| 9 | 挂 `yanhu_eval_script`→注入 developer 指引且参数名 `expression`（`:109`） | 7 常量 + `yanhu_eval_script`（`:110-113`） | 组装（`:110`） | `:114` 含 `<developer_tools>`、`:115` 含 `yanhu_eval_script(expression)` | 无 |
| 10 | 视觉工具成对挂载→注入 visual_perception（`:118`） | 7 + `yanhu_capture_visual`+`yanhu_click_visual`（`:119-122`） | 组装（`:119`） | `:123` 含 `<visual_perception>` | 无 |
| 11 | 视觉只挂其一→不注入 visual_perception（`:126`） | 7 + 仅 `yanhu_capture_visual`（`:127-130`） | 组装（`:127`） | `:131` not `<visual_perception>`、`:132` not `yanhu_click_visual` | 无 |
| 12 | 控件族映射：下拉 select/单选 click/输入 fill（`:141`） | 基础人设常量（`:142`） | `toContain`×4（`:142-147`） | `:142` `Control Family -> Tool Mapping`、`:144` `radio "因私请假"`、`:145` `Do NOT call \`yanhu_select\` for a single option`、`:147` `never fall back to guessing pixel coordinates for it` | 无 |
| 13 | 回执契约覆盖值自证/选项清单/空面板（`:150`） | 同上（`:151`） | `toContain`×6（`:151-159`） | `:151` `<result_contract>`、`:153` `including the "页面无变化 / no change" short-circuit`、`:154` `Never doubt whether your earlier actions were applied`、`:156` `the reply carries the RENDERED option list`、`:157` `NEVER fire several guessed synonyms`、`:159` `rendered NO options` | 无 |
| 14 | 视觉契约：看不到截图、只能地标表（`:162`） | 7 + 视觉对（`:163-166`） | 组装后 `toContain`×2（`:167-168`） | `:167` `You CANNOT see the screenshot itself`、`:168` `the click lands exactly at the coordinate you gave` | 无 |
| 15 | 新增控件语义：浮层 [BID]/只读 JS setter（`:171`） | 基础人设常量（`:172`） | `toContain`×4（`:173-178`） | `:173` ``role `option` ``、`:174` ``Click such a row directly with `yanhu_click` ``、`:176` `written through the page's JS value setter`、`:178` `custom dropdowns, tree selectors and date pickers` | 无 |
| 16 | 核心不变式·场景「默认挂载」（`:194`） | 7 常量（`apps/electron/test/yanhu-pet-prompt.test.ts:184`） | 组装→提取全部 `yanhu_*` 名逐个查 `mountedNames.has`（`:195-200`） | `:199` `expect(mountedNames.has(name)).toBe(true)` | 表 `:183-191` |
| 17 | 核心不变式·场景「默认 + 开发者级」（`:194`） | 7 + `yanhu_eval_script`+`yanhu_inspect_element`（`:185`） | 同上 | `:199` | 表 `:183-191` |
| 18 | 核心不变式·场景「默认 + 视觉对」（`:194`） | 7 + 视觉对（`:186`） | 同上 | `:199` | 表 `:183-191` |
| 19 | 核心不变式·场景「全量挂载」（`:194`） | 7 + 6 门控 = 13（`:187-190`） | 同上 | `:199` | 表 `:183-191` |

## 3. 真实断言

按用例引用真实 `expect` 行（均在 `apps/electron/test/yanhu-pet-prompt.test.ts` 203 行内）：

- 用例 1：`apps/electron/test/yanhu-pet-prompt.test.ts:56`（`toContain` 标题计数，7 由 `ALWAYS_MOUNTED.length` 求值，`:20-28`）、`:58`（逐名反引号包裹断言，循环 `:57-59`）。
- 用例 2：`apps/electron/test/yanhu-pet-prompt.test.ts:63`。
- 用例 3：`apps/electron/test/yanhu-pet-prompt.test.ts:70`（单行文本压缩结果）、`:71`（`split('\n').filter(...).length` `toBe(1)`，防清单结构破坏）。
- 用例 4：`apps/electron/test/yanhu-pet-prompt.test.ts:78`（对 6 个门控名逐一 `not.toContain`，循环 `:77-79`）。
- 用例 5：`apps/electron/test/yanhu-pet-prompt.test.ts:84`（`ALWAYS_MOUNTED as readonly string[]` `toContain(name)`，循环 `:83-85`）。
- 用例 6：`apps/electron/test/yanhu-pet-prompt.test.ts:89`、`:90`、`:91`。
- 用例 7：`apps/electron/test/yanhu-pet-prompt.test.ts:95`、`:96`、`:97`。
- 用例 8：`apps/electron/test/yanhu-pet-prompt.test.ts:104`、`:105`、`:106`。
- 用例 9：`apps/electron/test/yanhu-pet-prompt.test.ts:114`、`:115`（`expression` 参数名锁死，对应 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:143` 的 brief 文案）。
- 用例 10：`apps/electron/test/yanhu-pet-prompt.test.ts:123`。
- 用例 11：`apps/electron/test/yanhu-pet-prompt.test.ts:131`、`:132`。
- 用例 12：`apps/electron/test/yanhu-pet-prompt.test.ts:142`、`:144`、`:145`、`:147`。
- 用例 13：`apps/electron/test/yanhu-pet-prompt.test.ts:151`、`:153`、`:154`、`:156`、`:157`、`:159`。
- 用例 14：`apps/electron/test/yanhu-pet-prompt.test.ts:167`、`:168`。
- 用例 15：`apps/electron/test/yanhu-pet-prompt.test.ts:173`、`:174`、`:176`、`:178`。
- 用例 16–19：`apps/electron/test/yanhu-pet-prompt.test.ts:199`（`toBe(true)`；不变式失败时会指出具体越界工具名，提取函数 `:49-51`）。

断言语义与被测实现的对应：文案断言命中 `YANHU_PET_SYSTEM_PROMPT` 字面量（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:29-122`）；条件注入断言对应 `buildYanhuPetSystemPrompt` 的成对视觉门（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:188-190`）与 developer 过滤（`:191-192`，经 `buildDeveloperGuidance` `:167-174` 按实际挂载名过滤 `DEVELOPER_TOOL_BRIEFS` `:141-150`）；清单区块断言对应 `buildMountedToolsSection`（`:156-164`，换行压缩 `:159` 的 `replace(/\s+/g,' ')`）。

## 4. 未覆盖与脆弱点

未覆盖（逐项依据）：

1. `buildDeveloperGuidance`（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:167-174`）**无直接导入**（测试导入清单仅 4 符号，`apps/electron/test/yanhu-pet-prompt.test.ts:12-17`）：仅经用例 8 间接覆盖 `bullets.length===0 → null` 分支（`:102-107` 断言无 `<developer_tools>`）、用例 9 间接覆盖返回非 null 分支（`:109-116`）。
2. `DEVELOPER_TOOL_BRIEFS` 4 条 brief 中 `yanhu_inspect_element` / `yanhu_get_network_logs` / `yanhu_get_console_logs` 3 条文案（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:145-149`）无任何断言（用例 17/19 只查名字越界，不查文案）。
3. `buildMountedToolsSection` 的摘要 `slice(0,140)` 截断与 `description` 缺省 `?? ''` 分支（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:159`）未测（工厂恒给 description，`apps/electron/test/yanhu-pet-prompt.test.ts:40-42`）。
4. `buildYanhuPetSystemPrompt` 的 `basePrompt.trimEnd()`（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:187`）与区块拼接顺序 vision→developer→mounted（`:188-194`）无显式顺序断言（仅 contains 间接保证存在性）。
5. `YANHU_VISION_GUIDANCE` 常量导出（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:133`）无外部导入，仅 `:189` 内部使用；其全部文案只被用例 14 的 2 条 contains（`apps/electron/test/yanhu-pet-prompt.test.ts:167-168`）抽样，未全量锁。
6. 畸形输入（工具名重复、`definition.name` 缺失/空、`definition` 非对象）无用例（工厂恒产出合法形状，`apps/electron/test/yanhu-pet-prompt.test.ts:40-46`）。
7. 真实开关过滤实现（工具按开关挂载/过滤，实现在 `buildYanhuBrowserTools`，调用点 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts:36`）不在断言范围——本测试用伪造工具数组模拟挂载结果，「开关→挂载」这一段无测试衔接（该实现本文件未读全，标 UNKNOWN）。

脆弱点：

- 全部行为断言是对英文/符号文案的 `toContain`（如 `apps/electron/test/yanhu-pet-prompt.test.ts:90,95,153`），而被测是 90 余行字面量模板（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:29-122`）：提示词文案一旦改写（哪怕语义不变）测试即碎——这是有意的「契约沉淀」取舍（`:136-139` 注释明说行为变提示词须同步），但会让纯文案重构误报。
- 用例 3 的 `:71` 依赖 `第一行` 字符串只出现一次的字面巧合；若实现改用其它压缩策略（如删换行而非空格化），语义正确也会碎。
- 用例 16–19 的不变式依赖正则 `/yanhu_[a-z0-9_]+/g`（`apps/electron/test/yanhu-pet-prompt.test.ts:50`）：提示词中若出现非工具含义的 `yanhu_xxx` 字样会被误提取（当前文本内所有 `yanhu_*` 均为真实工具名，`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:29-122` 实测如此）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| `it(` 16 个静态调用点、`test(` 0、`describe(` 5 | 已证实 | grep 实测：`apps/electron/test/yanhu-pet-prompt.test.ts:54,62,66,76,82,88,94,102,109,118,126,141,150,162,171,194` |
| 运行时 19 个用例（16 − 1 + 4 场景） | 推断 | 表驱动循环 `apps/electron/test/yanhu-pet-prompt.test.ts:183-193` 的 JS 循环语义；NOT_RUN 未实测运行器计数 |
| 测试导入 4 符号：`buildMountedToolsSection` / `buildYanhuPetSystemPrompt` / `YANHU_PET_SYSTEM_PROMPT` / `type YanhuPromptTool` | 已证实 | `apps/electron/test/yanhu-pet-prompt.test.ts:12-17` |
| 被测模块 6 个导出（2 常量、1 接口、3 函数）：`YANHU_PET_SYSTEM_PROMPT` `:29`、`YanhuPromptTool` `:125`、`YANHU_VISION_GUIDANCE` `:133`、`buildMountedToolsSection` `:156`、`buildDeveloperGuidance` `:167`、`buildYanhuPetSystemPrompt` `:182` | 已证实 | 逐行读 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:1-195` 全文 |
| 零 mock / 零 spy / 零 `mock.module` | 已证实 | 全文件 grep `mock.\|spyOn\|mock.module` 0 命中 |
| 生产唯一调用者是 `yanhu-pi-runtime.ts`，其中 `:283` 用真实挂载 `tools` 调 `buildYanhuPetSystemPrompt(YANHU_PET_SYSTEM_PROMPT, tools)`，且在多步循环外装配一次 | 已证实 | `apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts:38-40,283`（整轮循环 `:286` 起）；全冻结树 git grep `yanhu-pet-prompt` 仅命中本测试与该文件 |
| `buildDeveloperGuidance` / `YANHU_VISION_GUIDANCE` 无模块外消费者 | 已证实 | 全冻结树 git grep 仅命中 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:133,167,189,191` |
| 其它测试文件均不引用本模块符号（无间接测试证据） | 已证实 | 全冻结树 git grep（`*test*` 限定）`YANHU_PET_SYSTEM_PROMPT` 等符号仅命中本测试；同族 `yanhu-pi-runtime.test.ts` 的 describe 只测内存/历史纯函数（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.test.ts:31,55,79,88,162,200`） |
| 断言行号均在被引文件真实行数内（测试 203 行、被测 195 行） | 已证实 | `wc -l` 实测 + 逐行读毕 `apps/electron/test/yanhu-pet-prompt.test.ts:1-203` |
| 注释所述历史故障（提示词宣传未挂载工具→判「未知工具」）与断言一一对应 | 推断 | `apps/electron/test/yanhu-pet-prompt.test.ts:2-8` 与 `apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:4-11` 双侧自述；故障过程本身未复现（NOT_RUN） |
| `BDD-YANHU-PROMPT-01..05` 编号的规格出处 | 未知 | 全冻结树 git grep `BDD-YANHU-PROMPT` 仅命中本测试文件，未见对应规格文档 |
| 测试运行结果（通过/失败、耗时） | 未知 | **NOT_RUN**：本轮未执行 bun test / typecheck / build / GUI，禁止当作「已通过」 |
| 开关→工具真实挂载/过滤的实现细节 | 未知 | `buildYanhuBrowserTools`（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts:36` 导入）本文件未读全，未断言 |

## 6. 覆盖表

| 符号 / 分支（被测侧） | 手册章节 | 手册行 | 状态 |
| --- | --- | --- | --- |
| `buildMountedToolsSection` 名称逐项 + 计数标题（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts:156-163`） | §2 用例 1-2 / §3 | §2 表 1-2 行 | covered |
| `buildMountedToolsSection` 空清单（`:158-163`） | §2 用例 2 / §3 | §2 表 2 行 | covered |
| `buildMountedToolsSection` 描述换行压缩 `replace(/\s+/g,' ')`（`:159`） | §2 用例 3 / §3 | §2 表 3 行 | covered |
| `buildMountedToolsSection` 摘要 `slice(0,140)` 截断、description 缺省（`:159`） | §4 未覆盖 3 | §4 | unknown |
| `YANHU_PET_SYSTEM_PROMPT` 无门控工具名 + 名字全集约束（`:29-122`） | §2 用例 4-5 / §3 | §2 表 4-5 行 | covered |
| `YANHU_PET_SYSTEM_PROMPT` `<web_scope>` 开放范围（`:66-72`） | §2 用例 6 / §3 | §2 表 6 行 | covered |
| `YANHU_PET_SYSTEM_PROMPT` 操作流纪律 / Bid 自愈（`:45-64,84-85`） | §2 用例 7 / §3 | §2 表 7 行 | covered |
| `YANHU_PET_SYSTEM_PROMPT` 控件族映射（`:53-60`） | §2 用例 12 / §3 | §2 表 12 行 | covered |
| `YANHU_PET_SYSTEM_PROMPT` `<result_contract>` 回执契约（`:100-106`） | §2 用例 13 / §3 | §2 表 13 行 | covered |
| `YANHU_PET_SYSTEM_PROMPT` 浮层 `option` [BID] / 只读 JS setter（`:56-57`） | §2 用例 15 / §3 | §2 表 15 行 | covered |
| `VISION_TOOL_PAIR` 成对门（`:153,188-190`）：成对注入 / 缺一不注入 | §2 用例 10-11 / §3 | §2 表 10-11 行 | covered |
| `YANHU_VISION_GUIDANCE` 文案（`:133-138`） | §2 用例 14（2 条抽样）/ §4 未覆盖 5 | §2 表 14 行 | partial |
| `buildDeveloperGuidance` 过滤分支（`:167-174`） | §2 用例 8-9（间接）/ §4 未覆盖 1 | §2 表 8-9 行 | partial |
| `DEVELOPER_TOOL_BRIEFS` `yanhu_eval_script` 条目（`:142-143`） | §2 用例 9 / §3 | §2 表 9 行 | covered |
| `DEVELOPER_TOOL_BRIEFS` 其余 3 条目（`:145-149`） | §4 未覆盖 2 | §4 | unknown |
| `buildYanhuPetSystemPrompt` 组装顺序 / `trimEnd`（`:187-194`） | §4 未覆盖 4 | §4 | partial |
| 核心不变式「提示词工具名 ⊆ 挂载」×4 场景（`apps/electron/test/yanhu-pet-prompt.test.ts:182-202`） | §2 用例 16-19 / §3 | §2 表 16-19 行 | covered |
| 畸形工具输入（重复名 / 缺 name） | §4 未覆盖 6 | §4 | unknown |
| 开关→真实工具挂载/过滤（`yanhu-browser-tools.ts` 经 `yanhu-pi-runtime.ts:36`） | §4 未覆盖 7 | §4 | unknown |
