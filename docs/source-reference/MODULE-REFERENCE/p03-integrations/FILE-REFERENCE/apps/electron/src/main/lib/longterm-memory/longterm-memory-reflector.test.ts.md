---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-reflector.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bb9c6bbd053a90741ef7c26309eccceb700a8922
sha256: bd082c4c8f856b42a8bb3bb9eae7dc01394a80f0540d16cb26509d45d190fcc7
lines: 323
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-reflector.test.ts

## 1. 测试目标

`longterm-memory-reflector.ts` 的静态单测：覆盖偏好句式提取、类别推断、长句/疑问/指代过滤、单轮落盘、重复加权、工具频次、Slash 指令、并发写入、`/compact` 跳过、工具名提取、审核三态/异常、工具与 Slash 不审核、睡眠整合的淘汰/新鲜/衰减不刷新。测试用临时目录 + 显式 `graphPath`，真实调用 store 的读写，但**不经过 IPC、不启动定时器、不 mock Electron**。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

5 个 `describe`，**23 个 `test`**。

**夹具**（`:23-55`）：

- `workDir = mkdtempSync(join(tmpdir(),'ltm-reflect-'))`；`graphPath = workDir/graph.json`。
- `beforeEach`：只 `await resetLongTermMemoryCache()`（`:47-51`），**不**清 RAG 索引（本测试不检索）。
- `afterEach`：`rmSync(workDir,{recursive:true,force:true})`（`:53-55`）。
- `createNode` 默认 `category:'coding_preference'`、`title:'历史节点'`、`content:'历史内容'`、`tags:[]`、`weight:1`、`confidence:0.8`、`source:'auto_inferred'`，可覆盖（`:26-40`）。
- `writeGraph` 直接 `writeJsonFileAtomic(graphPath,{version:1,updatedAt:Date.now(),nodes})`（`:42-45`）。

### 2.1 `describe('偏好候选提取')`（`:57-104`，7 个）

| # | test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | `:58-64` | 消息“以后都用 Jotai 管理状态” | `extractPreferenceCandidates` | `length===1`；category `coding_preference`；content 含 `Jotai` |
| 2 | `:66-71` | “以后查空教室都用 CDUT 专区” | 同上 | `length===1`；category `cdut_special_domain` |
| 3 | `:73-82` | “以后做科研绘图的时候不要用 matplotlib，统一走 CSLab 原生 Origin”（44 字） | `splitPreferenceCandidates` + `extract` | units `length===1`；candidates `length===1`；content 含 `matplotlib` 与 `Origin` |
| 4 | `:84-86` | “把它换掉” | `extract` | `toEqual([])` |
| 5 | `:88-90` | “这个函数是做什么的” | `extract` | `toEqual([])` |
| 6 | `:92-96` | “请记住这个错误日志吗？”、“我们以后统一走 CAS 认证对不对”、“下次怎么才能自动部署？” | `extract` | 三者均 `[]` |
| 7 | `:98-103` | “以后都用 Jotai 吧” | `extract` | `length===1`；content 含 `Jotai` |

### 2.2 `describe('单轮反思落盘')`（`:106-164`，6 个）

| # | test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 8 | `:107-114` | 空图，强偏好 | `reflectOnTurn({userMessage,graphPath})` | `list...length===1`；`source==='auto_inferred'`；category `coding_preference` |
| 9 | `:116-124` | 连续两次同文 | 两次 `reflectOnTurn` | `length===1`；`weight===2`；`confidence` `toBeCloseTo(0.7,5)` |
| 10 | `:126-138` | `toolNames:['read_file','read_file','grep']` | `reflectOnTurn` | tool 节点 2 个；`read_file` 节点存在且 `weight===2` |
| 11 | `:140-147` | `'/goal 跑一个长任务'` | `reflectOnTurn` | `length===1`；category `workflow_habit`；title `常用指令 /goal` |
| 12 | `:149-158` | 两条不同偏好 | `Promise.all` 两轮 | `length===2`；id 唯一 |
| 13 | `:160-163` | `'/compact'` | `reflectOnTurn` | `list...toEqual([])` |

### 2.3 `describe('工具名提取')`（`:166-177`，1 个）

| # | test 行 | 设置 | 断言 |
| --- | --- | --- | --- |
| 14 | `:167-176` | 2 个 assistant `tool_use(read_file)`、1 个 text、1 个 user `tool_use(ignored)` | `extractToolNamesFromMessages(messages)` 精确 `['read_file','read_file']` |

### 2.4 `describe('写入前隔离审核')`（`:179-271`，6 个）

| # | test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 15 | `:180-195` | auditor 记录 candidate 并返回 approved | `reflectOnTurn` | `audited.length===1`；`nodes.length===1`；confidence≈0.65 |
| 16 | `:197-205` | auditor 返回 rejected | 同上 | `list...toEqual([])` |
| 17 | `:207-217` | auditor 返回 unavailable | 同上 | 1 节点；confidence≈0.45 |
| 18 | `:219-231` | auditor 抛 `Error('boom')` | 同上 | 1 节点；confidence≈0.45 |
| 19 | `:233-254` | 第一次 approved 落盘；第二次 auditor 计数并返回 rejected | 两次 | `calls===0`；`length===1`；`weight===2` |
| 20 | `:256-270` | `/goal` + `toolNames:['read_file']`，auditor 计数 | 一次 | `calls===0`；`length===2` |

### 2.5 `describe('睡眠整合')`（`:273-323`，3 个）

| # | test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 21 | `:274-294` | 90 天前 weak auto（weight .1/conf .4）+ 同条件 manual | `consolidate({graphPath})` | `removed===1`；剩余 id `['manual']`；manual weight≈.1 |
| 22 | `:296-305` | 新鲜 auto（weight 2/conf .8） | 同上 | `removed===0`；1 节点；weight 2 |
| 23 | `:307-322` | 40 天前 auto（weight 1/conf .8），同一 `now` 整合两次 | 两次 `consolidate({graphPath,now})` | 第一次 weight<1；`updatedAt` 仍旧；第二次 weight 更小；`updatedAt` 仍旧 |

## 3. 真实断言

- 断言对象是 store 读回的节点数组、`ConsolidateResult` 或纯函数返回值；无 mock 模块、无 spy、无 fake timer。
- #3 的消息长度实测 44 字（源阈值 60，`:78`），因此 `splitPreferenceCandidates` 走“整句 ≤60”分支，**没有触发逗号二次切分**；断言 units=1 不能证明 >60 字场景。
- #4 “把它换掉”不命中 `PRONOUN_ONLY_PATTERN`（该正则只匹配整句“把它”等，源 `:52`）；实际因 `isMeaningful` 去掉标点/停用字后只剩 3 字（<6，源 `:95-100`）而返回空。测试名“纯指代”没有验证指代正则。
- #9 的 confidence 0.7 = 初始 0.65 + 0.05（源 `:271`）；weight 2 = 1+1。
- #10 只断言 `read_file` weight 2；`grep` 节点存在（2 个 tool 节点）但未断言其 weight=1。
- #15-18 只断言 confidence，不检查 auditor 收到的 prompt/参数；审核函数的参数构建由 auditor 测试覆盖。
- #19 的 `calls===0` 证明已存在节点不再审核；`weight===2` 证明仍加权。
- #20 的 `calls===0` 证明工具/Slash 不审核；`length===2` 证明两者都落盘。
- #21 的 manual 节点同条件（90 天、弱）仍保留，证明 `source` 过滤；但它同时被 `consolidate` 的衰减循环跳过（`:423`），所以 weight 保持 .1。
- #23 的第二次 weight 更小，是因为 `touchUpdatedAt:false` 不刷新 `updatedAt`，同一 `now` 下 idleDays 不变、再次乘衰减因子；这证明“可累积”，但不证明真实时间流逝。

## 4. 未覆盖与脆弱点

**未覆盖**：

- 同义合并 `merged`（同类别+同内容指纹的多个 auto 节点）与其 weight/confidence/tags 合并。
- keep 节点同时满足淘汰条件的边界（先合并后被删除）。
- 合并 mutation 与衰减 mutation 同 id 时的最终数值。
- 删除失败（store 抛错）时 `removed` 计数与后续继续。
- `isIdleForConsolidation` 的电池/空闲/非 Electron 分支；`startLongTermMemoryConsolidator` 的启动、停止、重复启动、`unref`。
- >60 字逗号二次切分、第三个片段丢失前文语境。
- `PRONOUN_ONLY_PATTERN` 真正命中（如整句“把它”）。
- 工具名大小写/空格导致同标题双创建，以及 store 按标题去重吞掉新 content。
- Slash 大小写（`/Goal`）、长度边界（`/a`）、`/compact` 带参数。
- 审核多候选并发、单条 reject 不影响其它候选。
- 偏好候选与已有节点同标题不同内容的去重冲突。
- 真实时间衰减（`Date.now`）与定时器。

**脆弱点**：

- #3 的测试名“含逗号的长句”与实际 44 字（未过 60 阈值）不符；它证明的是“短句不被逗号切”，不是长句拼接。
- #4 的测试名“纯指代”与实际过滤原因不符；若未来把 `isMeaningful` 阈值调低，该用例会失败但指代正则仍未覆盖。
- #10 依赖 `title.includes('read_file')` 找节点；标题格式变化会失败。
- #19/#20 的 `calls` 计数依赖 auditor 只在 pending 时调用；若未来审核扩展到已有节点，测试会失败但行为可能是有意变更。
- #23 依赖同一 `now` 两次调用；真实定时器不会同毫秒重复，测试证明的是公式累积性。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个 describe、23 个 test | 已证实 | `:57,106,166,179,273`；`grep -c "test("`=23 |
| 测试使用临时目录，不触碰用户配置 | 已证实 | `:48-49`、`:54` |
| #3 消息 44 字，未触发 60 字阈值 | 已证实 | 测试 `:74`；源 `:78`；实测长度 44 |
| #4 返回空的实际原因是有效字符 <6 | 已证实 | 源 `:95-100`；`PRONOUN_ONLY:52` 只匹配整句 |
| #9 的 0.7 = 0.65+0.05 | 已证实 | 源 `:271`；测试 `:123` |
| #19 已存在节点不审核 | 已证实 | 源 `:269-272`；测试 `:250-251` |
| #20 工具/Slash 不审核 | 已证实 | 源 `:311-345`；测试 `:268` |
| #21 manual 节点不衰减/不淘汰 | 已证实 | 源 `:393`、`:423`；测试 `:292-293` |
| #23 衰减不刷新 updatedAt | 已证实 | 源 `:430`；测试 `:315`、`:321` |
| 合并/定时器/电池行为 | 未知 | 无对应测试；未运行 |

## 6. 覆盖表

| 源符号/分支 | 测试用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 强偏好提取 | #1 | `:58-64` | covered |
| 类别推断（CDUT） | #2 | `:66-71` | covered |
| 短句不切分 | #3 | `:73-82` | partial（未过 60 阈值） |
| 指代过滤 | #4 | `:84-86` | partial（实际走长度过滤） |
| 普通问答/疑问句 | #5、#6 | `:88-96` | covered |
| 句尾“吧” | #7 | `:98-103` | covered |
| 首轮落盘 | #8 | `:107-114` | covered |
| 重复加权 | #9 | `:116-124` | covered |
| 工具频次 | #10 | `:126-138` | covered |
| Slash 指令 | #11 | `:140-147` | covered |
| 并发两轮 | #12 | `:149-158` | covered |
| `/compact` | #13 | `:160-163` | covered |
| 工具名提取 | #14 | `:167-176` | covered |
| 审核通过/拒绝/不可用/异常 | #15-18 | `:180-231` | covered |
| 已存在不审核 | #19 | `:233-254` | covered |
| 工具/Slash 不审核 | #20 | `:256-270` | covered |
| 淘汰/手动保留 | #21 | `:274-294` | covered |
| 新鲜不衰减 | #22 | `:296-305` | covered |
| 衰减不刷新 | #23 | `:307-322` | covered |
| 合并/定时器/电池 | — | — | unknown（未覆盖） |
