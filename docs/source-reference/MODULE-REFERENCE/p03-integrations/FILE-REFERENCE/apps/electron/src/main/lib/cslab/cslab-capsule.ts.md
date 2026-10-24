---
path: apps/electron/src/main/lib/cslab/cslab-capsule.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 338ee537ba43d3d99330eb31c06021c83f2e0cee
sha256: d88b5d8609e62a1c87802781234564964c1becdf4527cd21097e51d33c25dc22
lines: 278
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-capsule.ts

## 1. 结论与边界

CSLab **胶囊（数据引用快照）**（`apps/electron/src/main/lib/cslab/cslab-capsule.ts`，278 行）：绑定表格值为胶囊、陈旧检测、更新与血缘（lineage）。胶囊是「稿件引用的数据快照」，`checkStaleness` 对比源数据变化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BindCapsuleInput` | interface | `:69-77` | 绑定输入（labId/表格/单元格引用等） |
| `bindCapsule` | 函数 | `:87-143` | async，绑定并落库 |
| `listLabCapsules` | 函数 | `:144-159` | lab 全部胶囊 |
| `checkStaleness` | 函数 | `:160-169` | `=> string[]`，返回陈旧胶囊 ID 列表 |
| `UpdateCapsuleResult` | interface | `:170-175` | 更新结果 |
| `updateCapsule` | 函数 | `:176-212` | async，刷新快照 |
| `getCapsuleLineage` | 函数 | `:213-278` | async，血缘链 |

内部：`labDb`（`:33-40`）、`readTableValue`（`:41-61`，读源值）、`getManuscriptUriOf`（`:62-68`）、`toCapsuleStatus`（`:78-86`）。

## 3. 内部逻辑与关键流程

- `bindCapsule`（`:87-143`）：`assertLabId`→`readTableValue` 取当前值→生成 capsuleId→`upsertCapsule`（DB）→结果。
- `checkStaleness`（`:160-169`）：逐胶囊对比 `readTableValue` 当前值与快照——不等即陈旧（返回 ID 列表）。
- `updateCapsule`（`:176-212`）：重读源值刷新快照（`UpdateCapsuleResult` 标注变化）。
- `getCapsuleLineage`（`:213-278`）：沿引用链回溯（表格→源数据→上游）。

## 4. 调用者与调用链

- 消费方：稿件引用面板/陈旧提示。
- 出向：`cslab-db`（upsertCapsule/getCapsule 系）、表格读取。

## 5. 数据 I/O、读写与副作用

DB 读写（capsules 表）；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 源值缺失 | `:41-61` | `readTableValue` 返回空（绑定按语义失败） |
| 陈旧 | `:160-169` | 列入返回 |

## 7. 权限与权威状态

无身份语义；快照=数据引用的权威锚。

## 8. 修改影响面

- `checkStaleness` 对比口径（值相等）影响误报。
- DB capsules 表与 `cslab-db` 耦合。

## 9. 测试证据

`cslab-capsule.test.ts`（132 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+类型、绑定/陈旧/血缘语义 | 已证实 | `:69-278` |
| 血缘链细节 | 未知 | `:213-278` 结构核对 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:69-278` | covered |
| 内部读值/状态 | `:33-86` | covered |
