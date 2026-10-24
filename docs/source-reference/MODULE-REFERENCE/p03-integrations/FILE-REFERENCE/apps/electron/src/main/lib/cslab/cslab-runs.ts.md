---
path: apps/electron/src/main/lib/cslab/cslab-runs.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1dfff8b74e2f251ded5903ccde57334b78fc29ab
sha256: 7105e794809bbaa9589bf239e612476399a098b0d2290881141824c136a8f6d4
lines: 595
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-runs.ts

## 1. 结论与边界

CSLab 实验规程与批次（Protocol/Run）（文件头 `apps/electron/src/main/lib/cslab/cslab-runs.ts:1-8`）。存储契约：①**SQLite 为唯一规范源**（protocols/runs+entities）；②`vault/notes/protocols|runs/*.md` 是**单向**人类可读镜像（Obsidian）；③批次号 `r-YYYYMMDD-nn` 的"查最大号+插入"必须同事务（防并发重复）。

## 2. 导出与关键符号

`export` 逐条核对：8 个函数 = 8 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `listProtocols` | 函数（导出） | 308-311 | 规程列表 |
| `createProtocol` | 函数（导出） | 313-366 | 标题截 120（空抛 `规程标题不能为空`）；事务登记（proto 实体）+镜像 |
| `updateProtocol` | 函数（导出） | 368-413 | 不存在抛 `规程不存在`；**version+1**；事务+镜像 |
| `listRuns` | 函数（导出） | 415-418 | 可按 protocolUri 过滤 |
| `createRun` | 函数（导出） | 420-483 | 批次号同事务生成（`:442-443` 审计注释）；参数缺省取规程默认值（`:430-437`）；status 初始 `running` |
| `updateRun` | 函数（导出） | 485-535 | 不存在抛 `实验批次不存在`；`succeeded/failed/aborted` 定格 `endedAt`（`:493-496`）；字段级保留（undefined=不改） |
| `linkRunAsset` | 函数（导出） | 537-570 | 资产须 `raw/table/fig/mol`（`:544-546`）、关系须 `consumes/produces`（`:547-549`）；同链去重（`:552-553`）；`insertEdge` |
| `unlinkRunAsset` | 函数（导出） | 572-595 | 过滤链+`deleteEdge` |
| `MAX_STEPS`/`MAX_PARAMS` | 内部 | 55-56 | 50/50 |
| `clampText`/`normalizeSteps`/`normalizeParamDefs`/`normalizeRunParams`/`parseJsonArray` | 内部 | 62-132 | 截断；步骤（无 title 跳过、id 兜底 `step-N`）；参数 key 去重；JSON 容错 |
| `protocolToShared`/`runToShared`/`protocolRelPath`/`runRelPath` | 内部 | 134-177 | record→共享型；镜像路径（`vault/notes/protocols/<id>.md`、`vault/notes/runs/<batchNo>.md`） |
| `renderProtocolMarkdown`/`renderRunMarkdown` | 内部 | 179-292 | YAML front matter + 方法/步骤/参数表/观察/结果/关联资产（`[[title]]` wiki 链） |
| `writeProtocolMirror`/`writeRunMirror` | 内部 | 295-305 区段（`:269-293` own） | 镜像写失败仅 warn（**不影响 SQLite 主记录**） |

## 3. 内部逻辑与关键流程

### 3.1 批次号（`nextBatchNo`，`:295-304`）

`r-YYYYMMDD-` 前缀查 `findMaxRunBatchNo`、序号 +1（pad 2）；调用方 `createRun` 在 `withTransaction` 内调用（`:442-443` 注释：查询+插入同事务防并发重复）。

### 3.2 规程（`:308-413`）

create：title/method 截断（120/2000）；steps/parameters 归一（≤50，key 去重）；事务内 `upsertProtocol`+`upsertEntity`（revision 递增）；镜像后返回。update：不存在抛错；`version: existing.version+1`（`:389`）；entity 同步 relPath/revision。

### 3.3 批次（`:420-595`）

create：关联规程不存在抛 `关联的规程不存在`；title 兜底 `"<规程名> · 新批次"`；参数缺省用规程 defaultValue；记录 `status:'running'`+`linksJson:'[]'`。update：状态终局定格 `endedAt`；observations 截 8000/outcome 截 4000。link：layerType 白名单+relation 白名单+去重+`insertEdge(run→asset, relation, {run:batchNo})`；unlink：过滤+`deleteEdge`。每次写后 `writeRunMirror`。

## 4. 调用者与调用链

入向：实验规程/批次 IPC（CRUD/关联资产）；测试：`cslab-runs.test.ts`（154 行，本批）。出向：`node:crypto/fs/path`、`@profer/shared`（类型）、`./cslab-atomic.ts`、`./cslab-db.ts`（含 `findMaxRunBatchNo`/`decodeRunLinks`）、`./cslab-paths.ts`、`./cslab-uri.ts`。

## 5. 数据 I/O、读写与副作用

- 写：sqlite（protocols/runs/entities/edges，事务）；`vault/notes/*.md` 镜像（原子写，`allowInPlaceFallback:false`）。
- 副作用：镜像失败 `console.warn` 不阻塞主流程。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 标题空 | 抛 `规程标题不能为空` | 335 |
| 规程/批次不存在 | 抛 | 378,489,541 |
| 关联规程不存在 | 抛 | 424 |
| 资产/关系非法 | 抛 | 544-549 |
| 重复链接 | 幂等返回 | 552-553 |
| 镜像失败 | warn 继续 | 277-279 区段 |
| 步骤无 title | 跳过 | 72 |
| 参数 key 重复 | 去重 | 94,113 |

## 7. 权限与权威状态

- 规范源权威=SQLite（镜像单向、失败不回写）。
- 批次号并发安全=同事务（审计要求 `:442-443`）。
- 路径沙箱=`resolveLabRelativePath`。

## 8. 修改影响面

改事务/批次号影响审计唯一性；改归一化影响输入契约；改渲染影响 Obsidian 镜像；影响 `cslab-runs.test.ts`。

## 9. 测试证据

直接测试：`cslab-runs.test.ts`（154 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| SQLite 唯一规范源/镜像单向 | 已证实 | `:4-8` |
| 批次号同事务 | 已证实 | `:442-443,295-304` |
| endedAt 定格 | 已证实 | `:493-496` |
| 链接白名单/去重 | 已证实 | `:544-553` |
| 并发批次号实测 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 归一化/映射/渲染族 | §2 | 62-305 | covered |
| 规程 CRUD | §3.2 | 308-413 | covered |
| 批次 CRUD/链接 | §3.3 | 420-595 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
