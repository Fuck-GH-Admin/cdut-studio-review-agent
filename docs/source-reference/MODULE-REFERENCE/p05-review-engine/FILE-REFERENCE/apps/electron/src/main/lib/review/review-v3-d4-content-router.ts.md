---
path: apps/electron/src/main/lib/review/review-v3-d4-content-router.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a423ace067a12a4d3ea38779bf16e53f80c2de74
sha256: 5cf6f338a3229e8d61a1f7ac31a1fbf9d24ae2740f38a22d1814f59e281a1bef
lines: 135
kind: source
package: p05-review-engine
author: docs-r07-author-nb-01-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-d4-content-router.ts

## 1. 结论与边界

纯函数 L1 业务意图分类器：根据调用方已核实的当前案卷 `DocumentVersion` 文本块，为 D4 50 套候选给出技术候选、命中信号、置信度与是否可自动建议；不做路由决策、不建案、不写盘、不调用模型（文件头 `apps/electron/src/main/lib/review/review-v3-d4-content-router.ts:1-4`）。

边界：

- 不读取文件名、不读磁盘、不校验原件身份；输入必须是调用方已核实归属的文档（`:1-2`）。
- 不把多份材料的词拼在一起凑“对象+动作”；每份原件独立判定（`:80-88,112-126`）。
- 不产生“唯一业务类型”之外的自动资格；多项命中时全部返回且 `autoEligible:false`（`:127-134`）。
- 不负责 20 秒倒计时或最终选择；那在 `review-intake-routing-adapter-v3-b3.ts`。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数、1 个接口；`Candidate` 与 `Signals` 为内部类型。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `D4ContentRouteSuggestion` | 接口（导出） | 8-15 | `{templateId,name,matchedSignals,confidence,autoEligible,evidence}` | `evidence` 仅两种来源：`application-declaration` / `business-content-l1` |
| `classifyD4ApplicationDocuments` | 函数（导出） | 78-135 | `(templates:readonly Candidate[], documents:readonly DocumentVersion[]) => D4ContentRouteSuggestion[]` | 纯函数；无匹配返回 `[]` |
| `Candidate` | 内部接口 | 7 | `{templateId:string;name:string}` | 只依赖 ID 与名称 |
| `Signals` | 内部类型 | 17 | `readonly [readonly string[],readonly string[]]` | 两组信号：业务对象、动作/目的 |
| `D4_L1_SIGNALS` | 内部常量 | 21-72 | `Record<string,Signals>` | 50 个键，与 D4 目录的 50 套一一对应 |
| `normalized` | 内部 | 74-75 | `(value)=>string` | NFKC + 小写 + 去空白/连字符/括号/标点 |

`D4_L1_SIGNALS` 的键分布（逐条计数）：G01 5、G02 3、G03 10、G04 8（键名 `d4-g04-t01..t08`）、G05 6、G06 9、G07 7、G08 2，合计 50（`:21-72`）。

## 3. 内部逻辑与关键流程

### 3.1 归一化

`normalized`：`value.normalize('NFKC').toLowerCase()`，再删除 `\s`、`-`、`—`、`_`、`【】[]（）()<>《》,，。;；:：·|｜`（`apps/electron/src/main/lib/review/review-v3-d4-content-router.ts:74-75`）。只做字符归一，不做同义词扩展；同义词由信号表显式列出。

### 3.2 候选输入过滤

1. `activeApplications = documents.filter(doc => doc.active!==false && doc.role==='application')`（`:83`）。
2. `readable`：只保留有文本块的原件；块必须 `kind==='text'`、`format` 不是 `ocr-text`/`vision-text`、`text.trim()` 非空（`:84-88`）。OCR/视觉文本被明确排除，避免“识别推测”直接进入路由。
3. `readable` 为空 → 返回 `[]`（`:89`）。
4. `allParsed = activeApplications.length>0 && activeApplications.every(doc => doc.parseStatus==='parsed')`（`:90-92`）。注意它看的是**全部 active 申请件**，包括没有可读文本块的原件；因此“全部解析完成”与“全部有可读文本”不是同一条件。

### 3.3 显式标签优先

- 遍历 `readable` 的每个块，按行（`/\r?\n/`）取前 100 行；匹配 `^\s*(申请事项|业务类型|办理事项|审核模板|模板名称|模板编号)\s*[:：]\s*(.{2,100}?)\s*$`，把捕获值归一化后放入集合（`:94-103`）。
- 标签数 >1 → 直接返回 `[]`，不猜（`:104`）。
- 标签数 ===1：在 `templates` 中找 `normalized(name)===value` 或 `normalized(templateId)===value`；恰好 1 个才返回 `confidence:1`、`autoEligible:allParsed`、`evidence:'application-declaration'` 的建议（`:105-110`）。若 0 个或多个匹配，则**继续**走正文信号路径（不返回空）。

### 3.4 正文信号（逐原件）

- 对每份 `readable` 原件：把所有文本块各截前 6000 字符、以换行拼接，再整体截前 30000 字符，归一化（`:114-116`）。
- 对每个模板：取 `D4_L1_SIGNALS[templateId]`；无表项则跳过（`:118-119`）。
- 每组信号必须至少命中一个别名（`aliases.find(alias => text.includes(normalized(alias)))`）；两组都命中才记为该原件支持该模板（`:120-121`）。
- 同一模板可在多份原件中出现；命中的别名去重后并入 `signals` 集合（`:122-125`）。
- 候选的 `confidence` 固定 `0.96`、`evidence:'business-content-l1'`、`autoEligible:false`（`:127-131`）。
- 最终 `autoEligible = allParsed && candidates.length===1`（`:132-134`）。即：只有“全部申请件已解析 + 唯一候选”才可自动建议；多个候选一律人工选择。

### 3.5 返回顺序

`byTemplate` 是 `Map`，插入顺序取决于“首次命中的原件顺序 + 模板顺序”；返回值按该顺序映射（`:113-131`）。调用方不应依赖特定排序（测试对结果做了 `sort()`，见 `review-v3-d4-content-router.test.ts:48`）。

## 4. 调用者与调用链

入向（冻结树 grep，排除测试）：

- `apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:27` 导入；`:196` 在 `evaluate` 中用于 B3 自动建议；`:234` 在 `read` 中生成 `routeCandidates` 供展示。
- 无其它生产调用者。

出向：仅 `@profer/shared` 的 `DocumentVersion` 类型（`:5`）；无 I/O、无其它模块调用。

动态/字符串调用：无。

## 5. 数据 I/O、读写与副作用

- 输入：`templates`（至少 `templateId/name`）与 `DocumentVersion[]`；使用字段 `active`、`role`、`blocks[].kind/format/text`、`parseStatus`（`:83-92,114-115`）。
- 输出：`D4ContentRouteSuggestion[]`；字段见 §2。
- 无磁盘/网络/缓存/全局状态写入；无日志；纯函数，可重复调用（相同输入相同输出，除 `Map` 插入顺序由输入决定）。
- 不做原子性/并发处理，因为没有共享状态。

## 6. 分支、失败、取消与恢复

| 分支 | 结果 | 行 |
| --- | --- | --- |
| 无可读申请件 | `[]` | 89 |
| 显式标签 >1 | `[]` | 104 |
| 显式标签唯一且精确匹配唯一模板 | 1 条，`confidence:1`，`autoEligible=allParsed` | 105-110 |
| 显式标签唯一但匹配 0/多模板 | 继续正文信号 | 107-110 |
| 正文无任何模板两组命中 | `[]` | 127-134 |
| 多模板命中 | 全部返回，`autoEligible:false` | 132-134 |
| 全部申请件已解析且唯一候选 | `autoEligible:true` | 134 |
| 任一申请件未解析 | `autoEligible:false` | 91-92,134 |

- 不抛业务错误；唯一潜在运行时错误是 `doc.blocks` 缺失/非数组（类型层要求数组，函数未防御）。
- 无取消/超时/恢复语义；调用方每次重新调用即可。

## 7. 权限与权威状态

- 本文件无 sender/actor/role 检查，也不读取权限状态；它是 Main 内部纯函数（依据：全文无 `assert`/`ipc`/`Actor`）。
- 权威性边界由调用方保证：只传“已核实原件身份/归属”的文档（`:1-2`）；本文件不验证 `byteHash`/`assetPath`/案卷归属。
- 输出 `autoEligible` 只是“可进入 20 秒自动建议”的候选资格，不是模板授权；最终授权在 B3 会话（`review-intake-routing-adapter-v3-b3.ts:191-213`）。

## 8. 修改影响面

- 改 `D4_L1_SIGNALS` 会直接影响 B3 自动建议与人工候选展示；新增/改名 D4 母版时必须同步本表（注释 `:18-20`）。
- 改 `autoEligible` 条件会影响 `review-v3-main-local-product-intake.ts:196-200` 的 `solo`/`fromSource` 与 B3 的 `countdown`。
- 改 `confidence` 会影响 B3 的 `confident()` 门槛（`review-intake-routing-adapter-v3-b3.ts:39,101`；当前 0.96/1 均通过）。
- 改 `evidence` 字面量会影响 `D4ContentRouteSuggestion` 消费者与测试（`review-v3-d4-content-router.test.ts:59` 断言 confidence，未断言 evidence）。
- 改块过滤（`ocr-text`/`vision-text`）会改变扫描件/OCR 场景的自动路由能力。
- 共享类型 `DocumentVersion` 在 `packages/shared`；改字段需同步本文件与所有测试夹具。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-d4-content-router.test.ts`（本批，8 个用例，详见该文件手册）。断言覆盖：

- 单份原件唯一候选可自动建议（`:24-31`）。
- 主表 + 无信号附件仍唯一（`:33-41`）。
- 两份材料指向不同业务 → 两个候选且都不自动（`:43-50`）。
- 两份材料同一显式声明 → 唯一、confidence 1、可自动（`:52-61`）。
- 显式声明互相矛盾 → `[]`（`:63-69`）。
- 有申请件未解析 → 唯一候选但不可自动（`:71-78`）。
- 词分散在两份材料 → `[]`（`:80-86`）。
- 非申请角色不参与（`:88-93`）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI；以上为静态阅读断言。

缺口：未覆盖 OCR/vision 文本排除、显式标签匹配 0/多模板后回落正文、`templateId` 精确匹配、同一模板跨多份原件合并信号、100 行/6000/30000 截断、50 个信号键的逐一命中、`doc.blocks` 缺失。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数，无 I/O/副作用 | 已证实 | `:78-135` 无读写调用 |
| 只处理 active 且 role=application 的文档 | 已证实 | `:83` |
| OCR/vision 文本被排除 | 已证实 | `:86-87` |
| 显式标签多值直接放弃 | 已证实 | `:104` |
| 显式标签唯一但匹配不到模板时回落正文 | 已证实 | `:105-110` 后继续 `:112` |
| 每份原件必须独立满足两组信号 | 已证实 | `:114-125` |
| 多候选不自动、唯一且全解析才自动 | 已证实 | `:132-134` |
| 信号表 50 键与 D4 目录 50 套对应 | 已证实（键计数） | `:21-72`；`review-d4-catalog.ts:40` |
| `allParsed` 包含无可读文本块的申请件 | 已证实 | `:90-92` 与 `:83` |
| 无直接测试的截断/OCR 分支 | 已证实（测试检索） | 测试仅 8 例，无 format/长文本用例 |
| 调用方只传已核实文档 | 推断/契约 | `:1-2`；调用点 `review-v3-main-local-product-intake.ts:196,234` |
| `doc.blocks` 缺失时的行为 | 未知 | 无防御分支 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalized` | §3.1 | 74-75 | covered |
| 申请件过滤/可读块过滤 | §3.2 | 83-89 | covered |
| `allParsed` | §3.2 | 90-92 | covered |
| 显式标签解析/多值放弃 | §3.3 | 94-104 | covered |
| 显式标签精确匹配 | §3.3 | 105-110 | covered |
| 正文信号逐原件 | §3.4 | 112-126 | covered |
| 候选与自动资格 | §3.4 | 127-134 | covered |
| 信号表 50 键 | §2 | 21-72 | covered（计数） |
| OCR/vision/截断 | §9 | 86-87,98,115 | partial |
| `blocks` 缺失 | §10 | 84 | unknown |
