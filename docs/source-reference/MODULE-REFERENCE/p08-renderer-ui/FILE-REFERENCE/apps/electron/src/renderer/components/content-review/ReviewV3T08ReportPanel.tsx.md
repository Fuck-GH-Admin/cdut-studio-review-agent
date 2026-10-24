---
path: apps/electron/src/renderer/components/content-review/ReviewV3T08ReportPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 80bcace1096b073656658204ec19211b61d339b1
sha256: a5d9be9b81087ceb36d1650d31a01fa2b6e55d84f807d87365a3c7d6a6c5ec62
lines: 185
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T08ReportPanel.tsx

## 1. 结论与边界

**T08 报告工作台**（`:1` 注释）：**无 Main 写入、无 actor 冒充、无混合历史运行**。受众红线：**Main 授予的受众是上限，组件状态被改成 reviewer 也只能按授权投影**（RUN-31/UI-15 `:13`/`:83-84`）；评分快照缺失如实声明不含评分矩阵（JDG-12 `:15`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T08ReportPanel` | function（export） | `:57-185` | `({aggregate, currentRun, currentStale, template, audienceGrant?, ratingSnapshot?, cycle?})` |

内部：`safeFilename`（`:21-23`）、`htmlReport`（**HTML 转义防注入** `:24-29`）、`saveBlob`（`:30-39`）、`reportBundle`（5 格式+哈希清单 ZIP `:41-55`）。

## 3. 内部逻辑与关键流程

1. 运行列表：currentRun 起步+`listRunsV2` 合并去重（`:66-79`）；`isHistorical`（非当前或 stale `:85`）→报告标记（**:146「未冻结的当前案卷字段及补件不会混入该次报告」**）。
2. **受众闸**（`:82-84/:153-161`）：未授予→仅学生版，下拉禁用并明示「下拉不会提升权限」（`:160`）。
3. 报告（`makeT08CaseReport` `:89-95`，异常→null `:97`）；导出 6 格式（md/json/html/xlsx/pdf/bundle `:100-130`）；**PDF 中文图片页如实提示不可选中**（`:123`）。
4. 头部行：绑定 inputManifest、「模型意见不等于正式决定」（`:145`）；预览 details（`:179-182`）。

## 4. 调用者与调用链

入向：报告区。出向：`./review-v3-t08-case-report`/`-pdf`/`review-v3-f16-report-delivery`、`window.reviewAPI.listRunsV2`。

## 5. 数据 I/O、读写与副作用

纯导出下载（blob）；读 runs。

## 6. 分支、失败、取消与恢复

生成异常→null（`:97`）；导出失败→notice。不适用取消/恢复。

## 7. 权限与权威状态

红线：零 Main 写/零冒充（`:1`）；受众上限（`:83-84`）；历史不混（`:146`）。

## 8. 修改影响面

改面板 → 报告导出与受众合规。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T08ReportPanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+4 内部+受众闸/导出全链 | 已证实 | 逐行读 `:1-185` |
| t08-case-report/pdf 编码 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:57-185` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
