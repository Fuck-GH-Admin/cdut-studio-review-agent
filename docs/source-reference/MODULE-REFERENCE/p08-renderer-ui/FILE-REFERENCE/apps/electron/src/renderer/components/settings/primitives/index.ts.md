---
path: apps/electron/src/renderer/components/settings/primitives/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2133878402defed6dd7a61375d9d721cf8be42ee
sha256: 7b3fb9876b7f7f228f78e3d7a934dc912aae71f7d77f2ce9d8d59e0873a9b6c4
lines: 16
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/index.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

设置组件原语 barrel 导出（16 行，头注 :1-5）：统一导出 10 个设置界面基础组件（SettingsSection/Card/Row/Toggle/Input/Textarea/SecretInput/Select/SegmentedControl/UIConstants）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `export * from …` ×10 | re-export | 7-16 | SettingsUIConstants/Section/Card/Row/Toggle/Input/Textarea/SecretInput/Select/SegmentedControl |

## 3. 内部逻辑与关键流程

纯 barrel；无逻辑。注意 `index.ts` 位于 `settings/primitives/`（与 cdut-science 同批但不同组件族）。

## 4. 调用者与调用链

入向：设置界面组件（`@/components/settings/primitives` 导入方）。出向：10 个同目录模块。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无。

## 7. 权限与权威状态

无（纯导出聚合）。

## 8. 修改影响面

设置界面组件可用面：所有设置页经 `@/components/settings/primitives` 导入 10 个基础组件。
- 波及面：新增/删除 re-export 直接影响全部设置页编译面；barrel 顺序无行为语义。
- 回归关注：10 个 re-export 与同目录实际文件一一对应不悬空。
- 无专属测试文件（barrel 无需专属测试）；回归由各使用组件覆盖。

## 9. 测试证据

直接测试：无（barrel 文件）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 re-export/行号 | 已证实 | 逐行核对 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 re-export | §2 | 7-16 | covered |
