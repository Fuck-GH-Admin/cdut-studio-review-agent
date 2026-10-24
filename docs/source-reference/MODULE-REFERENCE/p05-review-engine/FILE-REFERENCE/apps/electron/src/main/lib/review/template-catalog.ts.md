---
path: apps/electron/src/main/lib/review/template-catalog.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d0fa9a6a8d1d3601775583a7f6f3fbf63debebb
sha256: 687e2d09d24e8ae322f1ebda92afd60dad53dcd7e3819d93e8ade54dab1dd01c
lines: 93
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/template-catalog.ts

## 1. 结论与边界

模板目录索引（头注 :1）：用户可排序/移出（归档）模板库的轻量索引 `review-templates/catalog.json`；**模板版本本体保持不可变可追溯**（本文件不触碰模板内容）。

边界：不含模板校验/发布（`template-store`）；只管 order/archived 两个列表。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `initializeTemplateCatalog` | fn | 40-56 | 初始化/升级目录（v1→v2 一次性升级） |
| `isTemplateArchived` | fn | 58-60 | 是否已移出 |
| `orderTemplateIds` | fn | 62-66 | 按目录秩排序（未登记者排尾、按 id 字典序） |
| `reorderTemplateCatalog` | fn | 68-77 | 显式重排（去重/防归档项/保留未提及可见项） |
| `archiveTemplateInCatalog` | fn | 79-82 | 移出（幂等追加） |
| `restoreTemplateInCatalog` | fn | 84-89 | 恢复（从 archived 移除、order 缺则补尾） |
| `listArchivedTemplateIds` | fn | 91-93 | 归档列表 |

内部：`TemplateCatalog`（:6-10，`schemaVersion: 1|2`、order/archived）、`catalogPath`（:12-14）、`readCatalog`（:16-30）、`writeCatalog`（:32-38）。

## 3. 内部逻辑与关键流程

1. `readCatalog`（:16-30）：缺文件 → 默认 `{schemaVersion:2, order:[], archived:[]}`；解析失败 → `console.warn` + 默认（:27-28）；逐字段过滤非法项（:22-24）。
2. `writeCatalog`（:32-38）：mkdir + tmp + rename 原子写。
3. `initializeTemplateCatalog`（:40-56）：不存在则写默认顺序（Set 去重，:43）；存在则把 `defaultOrder` 中未登记者补进 order（:47）；**v1→v2 升级**（:48-52）：v1 时把 `initiallyArchived` 并入 archived（隐藏历史薄兼容模板，保留显式恢复）；有变化才写盘（:53-55）。
4. `reorderTemplateCatalog`（:68-77）：重复 id → throw `模板顺序包含重复模板`（:71）；含归档 id → throw `已移出模板库的模板不能调整顺序`（:73）；未提及的原可见项按序插在新列表后、归档项垫底（:74-76）。
5. `archiveTemplateInCatalog`/`restoreTemplateInCatalog`（:79-89）：幂等写。

## 4. 调用者与调用链

入向（生产）：`template-store.ts:17`（6 个函数全量：archive/isArchived/listArchived/order/reorder/restore）；`builtin-templates.ts:7/:347`（`initializeTemplateCatalog`，内置模板注册时初始化）。测试：无专属测试（经 `template-store`/`builtin-templates`/`template-asset-contract.test.ts` 间接）。出向：`../config-paths getConfigDir`（:4）、`node:fs/path`（:2-3）。

## 5. 数据 I/O、读写与副作用

- 读写 `{configDir}/review-templates/catalog.json`（tmp+rename，无 fsync）。
- 副作用：`console.warn`（:27）；mkdir（:34 + getConfigDir 自身）。
- 无网络/窗口。

## 6. 分支、失败、取消与恢复

- 读失败 → 默认结构（不抛）；写失败 → rename 抛错传播。
- `reorderTemplateCatalog` 两 throw（:71/:73）。
- 无取消概念；升级幂等（有变化才写，:53）。

## 7. 权限与权威状态

无 sender/role 分支。权威边界：只改目录索引，模板版本本体不可变（头注 :1）；归档 ≠ 删除，`restoreTemplateInCatalog` 可恢复（历史显式恢复语义 :48-49 注释）。

## 8. 修改影响面

- `template-store` 的模板列表/排序/归档 IPC 面；`builtin-templates` 初始化。
- schemaVersion 迁移逻辑改动影响旧用户目录升级。
- 无专属测试；回归面在 `template-store.test.ts`（他批）。

## 9. 测试证据

无直接测试文件（全树 glob）；间接：`template-asset-contract.test.ts`（经 template-store）触及模板验证路径但未断言目录行为。缺口：v1→v2 升级、reorder 两 throw、restore 补尾均无直接用例。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 读失败回默认/原子写/幂等归档 | 已证实 | :16-38/:79-89 |
| v1→v2 一次性升级语义 | 已证实 | :48-55 |
| 生产接线 template-store+builtin-templates | 已证实 | grep |
| 运行行为 | 未知 | 无直接测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readCatalog`/`writeCatalog` | §3.1-3.2 | 16-38 | covered（未测） |
| `initializeTemplateCatalog` 升级 | §3.3 | 40-56 | covered（未测） |
| `reorderTemplateCatalog` 校验 | §3.4 | 68-77 | covered（未测） |
| 归档/恢复/查询 5 函数 | §3.5 | 58-93 | covered（未测） |
