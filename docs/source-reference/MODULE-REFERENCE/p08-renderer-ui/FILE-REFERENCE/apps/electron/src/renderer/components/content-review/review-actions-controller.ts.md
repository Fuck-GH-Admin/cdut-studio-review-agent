---
path: apps/electron/src/renderer/components/content-review/review-actions-controller.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 707476905b16fff963b78ea1751ebfe3b2282b13
sha256: 4df7cf880276e063babf5e4c7c2c2bf5fe682d1bcdb18b1e53c50321ccd6c28c
lines: 1228
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-actions-controller.ts

## 1. 结论与边界

**审核动作控制器**（`apps/electron/src/renderer/components/content-review/review-actions-controller.ts`，1228 行，本批最大源）：渲染层所有审核写动作的唯一调度中枢（`use-review-actions` 的底座）——**按案写入、并发隔离、选择代次、互斥守卫**（test 主题「M0/H05 并发与按案写入」锁定）。所有写经 reviewAPI（Main CAS）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewActionsApi` | interface | `:87-138` | 控制器 API（全动作方法集） |
| `CreateCaseInput` | interface | `:139-147` | 建案输入 |
| `REVIEW_DOCUMENT_ROLE_LABELS` | const | `:193-198` | 角色→中文标签 |
| `ReviewRunMode` | type | `:199` | `'update' \| 'restart'` |
| `createReviewActionsController` | 函数 | `:206-1228` | 工厂（Jotai store 注入） |

内部：`JotaiStore`（`:20`）、`LAST_SELECTED_CASE_KEY='cdut-studio.review.last-selected-case'`（`:72`）、`readLastSelectedCaseId`/`saveLastSelectedCaseId`（`:74-85`，localStorage）、`buildFocus`（`:148-161`）、`hasIncompleteReviewCoverage`（`:162-169`）、`executionStateFromRun`/`FromWorkspace`（`:170-192`）、`reviewErrorMessage`（`:202-205`）。

## 3. 内部逻辑与关键流程

`createReviewActionsController`（`:206-1228`）核心语义（test 全面锁定）：

- **按案写入/并发隔离**（K05）：A 审核中切 B，A 返回只落 A、不污染 B、不切回；交错操作（慢大纲/快识别）互不覆盖；**选择代次**：慢 `selectCase(A)` 不把界面切回。
- **互斥守卫**（M0/H05）：同案审核进行中拒绝再发起，切走后守卫不解除；同类第二次点击被拒。
- **错误按案隔离**：失败时已切走则不污染当前视图；领域包切换按案落位。
- **选择恢复**（UI-09/H09）：恢复上次明确选择的案卷；**无恢复目标时不把列表首案自动设为当前案卷**；`selectCase` 拉回最近运行与过期标记。
- **过期核验**：导入/切领域不切案且即时核验过期；审核中输入变化→旧快照结果仍标过期。
- **一键审核**：复用已有中间产物只调一次最终审核；Pi 启动前先识别申报事项；自动重解析迁移的旧 HTML/EML；提交同 ID V2 案卷+主结果写 V2 run；**无审核依据不启动**；大纲失败如实显示不伪装缺材料；人工复核/覆盖缺口标部分完成。
- **Main 后台接线**：ACK 前不显示已受理；ACK 后释放前台等待；新页面从持久 V2 回读 running/failed。
- **辅助审核设置**按案保存；规则摘要可改写即时入缓存；人工修正 AI 申报事项按案落缓存。

## 4. 调用者与调用链

- 消费方：`use-review-actions` → 全部 content-review 组件（nb-84 各件的 `actions`）。
- 出向：`window.reviewAPI`/`window.electronAPI`（全部写 IPC）、Jotai store。

## 5. 数据 I/O、读写与副作用

IPC 写动作全集；localStorage（`LAST_SELECTED_CASE_KEY`）；Jotai 状态。

## 6. 分支、失败、取消与恢复

并发/代次/互斥/错误隔离四大面（第 3 节）；`reviewErrorMessage` 统一错误文案（`:202-205`）；`executionStateFromRun/FromWorkspace` 状态归一。

## 7. 权限与权威状态

渲染层唯一写入口（`use-review-actions` 底座）；写经 Main CAS（reviewAPI）；无渲染层直写存储。

## 8. 修改影响面

- `ReviewActionsApi` 是全部组件的动作合同。
- 代次/互斥/按案隔离语义改动会破坏 M0/H05/K05 边界（test 锁定）。

## 9. 测试证据

`review-actions-controller.test.ts`（1055 行，27+ 用例/2 describe）全面覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出、并发/代次/互斥/按案隔离 | 已证实 | `:87-1228` |
| UI-09 不自动设首案 | 已证实（test 锁定） | 测试 `:238` |
| Main 侧 CAS/受理 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:87-1228` | covered |
| 按案/并发/代次/互斥 | `:206-1228` | covered |
| 状态归一/选择恢复 | `:74-205` | covered |
