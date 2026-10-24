---
path: apps/electron/src/main/lib/cslab/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4876fa84865b08f8c78ec58e299167be99f11798
sha256: 5c11906c3fcacd842749bd86644edd22afef11fcc0ad52d138e75dc403ec76bd
lines: 49
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/index.ts

## 1. 结论与边界

CSLab **模块入口**（`apps/electron/src/main/lib/cslab/index.ts:1-6`）：统一出口，导出路由注册、服务单例与类型契约；42 行 `export *` 汇集 42 个兄弟模块（`:8-49`）。

## 2. 导出与关键符号

自身无新符号——`export *` 42 模块清单（`:8-49`，按序）：cslab-types、security、service、router、paths、db、hash、uri、columnar、formats、python、iron-cage、capsule、manuscript、ooxml、events、manager、debounce、literature、zotero-format、zotero-bridge、zotero、python-runtime、plot-digitizer、formula-verifier、dataset-store、literature-index、graphrag-router、atomic、runs、vault-cache、vault-index、canvas-sync、uv、tool-registry、share-db、share-watcher、hpc-db、hpc、mol、track-changes、ai-review。

## 3. 内部逻辑

无（聚合导出）。

## 4. 调用者与调用链

入向：CSLab 消费方（IPC/渲染）。出向：42 兄弟模块（多数不在本批——本批 11 文件仅覆盖其中 types/security 类 8 个的子集；**其余模块未在本批，归属登记**）。

## 5-7. I/O/分支/权限

无；不适用。

## 8. 修改影响面

新增模块需在此登记；`export *` 面=CSLab 公共 API。

## 9. 测试证据

无专属测试；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 42 模块聚合清单 | 已证实 | `:8-49` |
| 各模块导出内容 | 未知 | 非本批（除本批 11 文件） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 聚合清单 | §2 | covered |
| 子模块内容 | §4 | unknown（非本批） |
