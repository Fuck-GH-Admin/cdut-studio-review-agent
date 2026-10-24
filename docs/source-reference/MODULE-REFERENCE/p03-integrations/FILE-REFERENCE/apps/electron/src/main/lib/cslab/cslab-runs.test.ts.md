---
path: apps/electron/src/main/lib/cslab/cslab-runs.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 708f72b4b8792c6b24d75617c3eaa65cf73b0b14
sha256: 7388f51979aad1f80a99d5c8f75fa64db8892b755d62bef14caf01af04b55d4d
lines: 154
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-runs.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab 实验规程与批次（`:1-3`）：创建规程生成 proto 实体+Markdown 镜像；更新规程递增版本且不影响历史批次快照；批次号单调递增且事务内不重复；结束批次记录成败现象+镜像；关联数据表写 links 与血缘并支持解除。

## 2. 用例清单

共 5 个 `test(`（`apps/electron/src/main/lib/cslab/cslab-runs.test.ts:42,65,89,103,127`；describe `:41` 规程 2 个、`:88` 批次 3 个）。夹具：`PROFER_CONFIG_DIR` 临时根+`createLab` 真实实验室（`:14-19`）；afterAll 解锁 raw/关库/清缓存（`:21-39`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 创建规程（`:42`） | `protocol.uri` `toContain('/proto/')`；`listProtocols` 含之；镜像 `vault/notes/protocols/<uuid>.md` `existsSync===true` 且文本含 `'kind: protocol'`/`'装配电池'` |
| 2 | 更新递增版本+历史快照不动（`:65`） | `updateProtocol` 后 `updated.version` `toBe(2)`；历史 run 的 `protocolVersion` `toBe(1)`、`protocolTitle` `'循环寿命测试'`（旧名） |
| 3 | 批次号单调不重复（`:89`） | `Promise.all` 并发两 `createRun`：`batchNo` 均 `toMatch(/^r-\d{8}-\d{2}$/)`、互不相同；`listRuns` 中同号 `toHaveLength(1)` |
| 4 | 结束批次+镜像（`:103`） | `status:'succeeded'` 后 `updated.status==='succeeded'`、`endedAt` `toBeGreaterThan(0)`、outcome 含 `'91.2'`；镜像含 `'status: succeeded'`/`'第 3 圈'` |
| 5 | 关联/解除（`:127`） | 真实 `ingestFiles` CSV→`tableUri` `toBeTruthy()`；`linkRunAsset(consumes)` 后 `linkedAssets` 含之；`unlinkRunAsset` 后不含 |

## 3. 真实断言

逐条见上表（`:54-62,80-84,97-100,116-124,135-152`）。mock 边界：无 mock；真实 sqlite+真实文件镜像+真实摄取（`cslab-iron-cage.ingestFiles`）。

## 4. 未覆盖与脆弱点

未覆盖：`规程标题不能为空`/`规程不存在`/资产白名单/关系白名单拒绝分支、镜像写失败 warn 分支、参数默认值回填。并发批次号用例依赖同事务语义（`:89` 名称即契约）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:42-153` |
| 实体+镜像双写 | 已证实 | `:54-62` |
| 版本递增/快照隔离 | 已证实 | `:80-84` |
| 并发批次号唯一 | 已证实 | `:97-100` |
| 链接血缘解除 | 已证实 | `:135-152` |
| 拒绝分支 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 创建+镜像 | 1 | 42-63 | covered |
| 版本/快照 | 2 | 65-86 | covered |
| 批次号 | 3 | 89-101 | covered |
| 结束+镜像 | 4 | 103-125 | covered |
| 链接/解除 | 5 | 127-153 | covered |
| 拒绝分支 | 无 | — | unknown |
