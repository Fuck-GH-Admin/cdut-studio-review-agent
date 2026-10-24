---
path: apps/electron/src/main/lib/cslab/cslab-mol.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5154ec0b96d6f09d3db9aea3a727ac50629db58
sha256: a41ba7579d5a4778a4752b8392ab93cd0c1414f0cabcd4be3b71d43747e8862f
lines: 236
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-mol.ts

## 1. 结论与边界

CSLab 分子/晶体资产（CIF/PDB + 体数据）（文件头 `apps/electron/src/main/lib/cslab/cslab-mol.ts:1-8`）。红线：①结构与仪器原件同等对待——复制进 `vault/figures` 后只读锁定，登记为 `mol` 实体；②读取只接受已登记 URI，路径必须落在实验室沙箱内；③文本上限 32MB（体数据 256MB）超出**明确报错绝不静默截断**。

## 2. 导出与关键符号

`export` 逐条核对：6 个函数 = 6 个导出（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getMolFormat` | 函数（导出） | 60-62 | 扩展名→`cif/pdb/poscar/xyz`（`.cif/.pdb/.ent/.vasp/.poscar/.contcar/.xyz`，`:40-48`） |
| `getVolumeFormat` | 函数（导出） | 65-67 | `cube/chgcar/locpot`（`:50-55`） |
| `ingestMolAsset` | 函数（导出） | 93-155 | 只读入笼（复制+锁定+登记） |
| `getMolAsset` | 函数（导出） | 158-183 | 读文本供 Mol*（>32MB 抛 `结构文件超过 32MB 文本上限`） |
| `getVolumeAsset` | 函数（导出） | 186-211 | 体数据（>256MB 抛 `体数据文件超过 256MB 文本上限`） |
| `getTableSeries` | 函数（导出） | 214-236 | 数据表序列（XRD/拉曼联动，≤3000 点，失败回退预览） |
| `MOL_EXTENSIONS`/`VOLUME_EXTENSIONS`/`MAX_MOL_TEXT_BYTES`/`MAX_VOLUME_TEXT_BYTES` | 内部 | 40-58 | 32MB/256MB |
| `labDb`/`toAssetSummary` | 内部 | 69-90 | `central_meta.sqlite`；实体→摘要 |

## 3. 内部逻辑与关键流程

### 3.1 入笼（`ingestMolAsset`，`:93-155`）

格式判定（结构/体数据，无则抛 `不是受支持的结构/体数据文件`，`:99-100`）→ `vault/figures/<时间戳>-<nonce>-<safeName>`（`:102-106`）→ `copyFileWithHash`（`./cslab-hash.ts:36`）→ **sha256 去重**：同 sha 同层已有资产→解锁+删副本+复用既有（`相同结构文件已存在，已复用既有资产`，`:111-120`）→ `lockFileReadOnly` 只读锁定 → 事务（`nextLabRevision`+`upsertEntity`，`:142-146`）→ 回读校验（失败抛 `结构实体写入失败`）。

### 3.2 读取（`:158-211`）

`getEntityByUri` 三重校验（`layerType==='mol'`/`labId` 匹配/`relPath` 存在）+格式匹配；`resolveLabRelativePath`（沙箱内）；stat 超限抛错（**明确报错不截断**，`:171-173,199-201`）；读全文本返回。

### 3.3 表序列（`getTableSeries`，`:214-236`）

`getTable` → `columnsJson` 解析（非数组/坏 JSON→null）→ `readDatasetSeries(parquet,columns,maxPoints)`。

## 4. 调用者与调用链

入向：结构/体数据摄取 IPC 与 Mol*/等值面视图；测试：本批**无专属测试**（scope 无 `.test.ts`；`cslab-molstar-math.test.ts` 间接）。出向：`node:fs/path/crypto`、`@profer/shared`（类型）、`./cslab-db.ts`、`./cslab-paths.ts`、`./cslab-uri.ts`、`./cslab-hash.ts`、`./cslab-columnar.ts`。

## 5. 数据 I/O、读写与副作用

写：`vault/figures/` 复制+只读锁定+sqlite 登记（事务）；读：资产文本/parquet 序列；副作用：去重时删副本。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 不支持格式 | 抛错 | 99-100 |
| 同 sha 去重 | 复用既有 | 111-120 |
| 超 32MB/256MB | 抛错（不截断） | 171-173,199-201 |
| 非 mol/跨 lab/无 relPath | null | 164-167,192-195 |
| 写入失败 | 抛 `结构实体写入失败` | 149 |
| 表列坏 | null | 223-233 |

## 7. 权限与权威状态

- 红线权威：已登记 URI+沙箱路径（`resolveLabRelativePath`）；只读锁定与仪器原件同待（`:5`）。
- 事务登记（revision 递增）。

## 8. 修改影响面

改红线影响资产安全；改上限影响 3D/等值面视图；改去重影响磁盘与 URI 稳定性。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三红线 | 已证实 | `:1-8` |
| sha 去重复用 | 已证实 | `:111-120` |
| 超限明确报错 | 已证实 | `:171-173,199-201` |
| 只读锁定+事务 | 已证实 | `:122,142-146` |
| Mol* 解析行为 | 未知 | 文件外 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 格式判定 | §2 | 40-67 | covered |
| 入笼 | §3.1 | 93-155 | covered |
| 读取 | §3.2 | 158-211 | covered |
| 表序列 | §3.3 | 214-236 | covered |
| 断言 | §9,§10 | — | unknown |
