---
path: apps/electron/src/renderer/components/agent-skills/SkillDetailSheetFrame.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2db2b135c812812f5b52711aaa1b999e73eb04e
sha256: 80c45059f0c9fad4f65482a1cce2a8230268abda0ee24ec6fdd141b1b873f206
lines: 34
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/SkillDetailSheetFrame.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Skill 详情统一抽屉承载层（34 行，头注 :10-13）：不同作用域只在正文能力/操作插槽变化，**尺寸、可访问性、关闭行为统一**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillDetailSheetFrame` | 组件 | 15-34 | Sheet 承载（children 注入） |

内部：`SkillDetailSheetFrameProps`（:5-11）。

## 3. 内部逻辑与关键流程

`Sheet`（side=right，`hideClose`）→`SheetContent` 宽 `62vw/min 680/max 1100`→`SheetTitle` sr-only（无障碍）→children。`aria-describedby={undefined}` 消除无描述告警。

## 4. 调用者与调用链

入向：各作用域 Skill 详情抽屉（builtin-meta/user-global/workspace 版本）。出向：`@profer/ui/primitives/sheet`。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

无逻辑分支；onOpenChange 透传。

## 7. 权限与权威状态

- 一致性权威：三作用域详情抽屉尺寸/关闭行为同源（头注 :10-13）。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：全部 Skill 详情抽屉实例。
- 回归关注：宽度断点（62vw/680-1100px）与隐藏关闭按钮约定。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/行号 | 已证实 | 逐行核对 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SkillDetailSheetFrame` | §3 | 15-34 | covered（未测） |
