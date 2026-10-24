---
path: apps/electron/src/renderer/components/content-review/MaterialDropZone.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ec26af164a5b83f36f1049f6f6fc8e9c8ed0ccd7
sha256: abbd8232ae61b0d0df3a72c59846b3365b7cbb238e0514d637f82e73cacd58ae
lines: 107
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/MaterialDropZone.tsx

## 1. 结论与边界

**材料拖放/点击导入框**（`apps/electron/src/renderer/components/content-review/MaterialDropZone.tsx:1-8`）：点击走系统对话框（多选）、拖入取本地路径登记；拖入路径经 `webUtils.getPathForFile`（渲染层拿不到 `File.path`）；槽位守卫与「登记材料」按钮一致。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MaterialDropZone` | 组件 | `:21-107` | `{caseId, slotId, hasSlots, slotLabel?, onRegistered}` |

内部：`guard`（`:26-29`，槽位守卫）、`registerPaths`（`:32-41`，逐个 `registerMaterialPathV2`）、`onDrop`（`:43-…`，拖入）。

## 3. 内部逻辑与关键流程

- `guard`（`:26-29`）：模板含槽且未选槽位→提示。
- 拖入（`:43-…`）：`window.electronAPI.getPathForFile(file)` 取路径（失败项忽略，`:56-58`）→ 全部取不到则提示改用点击（`:60`）→ `registerPaths`。
- `registerPaths`（`:32-41`）：逐个 `window.reviewAPI.registerMaterialPathV2({caseId, sourcePath, role:'evidence', materialSlotId})`；**0 成功→`toast.error('没有登记成功的材料')`**（`:38`）；成功 toast+`onRegistered(versionIds)`。
- 点击路径：`window.reviewAPI.pickRegisterMaterialV2({caseId, role:'evidence', materialSlotId})`（`:74`）——与拖入走同一主进程 `registerMaterial` 服务（`:7` 注释）。

## 4. 调用者与调用链

- 消费方：材料面板（V2 案卷）。
- 出向：`window.reviewAPI`（`registerMaterialPathV2`/`pickRegisterMaterialV2`）、`window.electronAPI.getPathForFile`（webUtils）。

## 5. 数据 I/O、读写与副作用

IPC 登记材料（主进程读文件副本）；toast 反馈。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 槽未选 | `:26-29` | toast 拒 |
| 路径取不到 | `:56-60` | 提示改点击 |
| 0 份登记成功 | `:38` | toast error |
| 部分成功 | `:39` | toast 成功数 |

## 7. 权限与权威状态

`role:'evidence'` 固定（`:35`、`:74`）；路径经 webUtils 官方接口获取（非 `File.path` 私有字段）。

## 8. 修改影响面

- `registerMaterialPathV2`/`pickRegisterMaterialV2` 是 IPC 合同（对应 `REGISTER_MATERIAL_PATH_V2` handler）。
- 槽位守卫文案与「登记材料」按钮一致性（`:6` 注释）。

## 9. 测试证据

无专属测试（全树检索 `MaterialDropZone` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、双路径登记/守卫 | 已证实 | `:21-107` |
| 0 成功显式报错 | 已证实 | `:38` |
| 主进程登记行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `MaterialDropZone` | `:21-107` | covered |
| 守卫/登记链 | `:26-74` | covered |
