---
path: apps/electron/src/renderer/components/settings/primitives/SettingsUIConstants.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 06bbd80c9d451cb41ab5c99787e84705855f9351
sha256: 1eeafb3333ed35e250e0dec50369619b72d95cb8cb7d07ea0b81dadd6b44b980
lines: 27
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsUIConstants.ts

## 1. 结论与边界

**设置界面统一样式 token**（`:1-6` 注释）：集中 Tailwind class，保证所有设置页一致视觉语言。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `LABEL_CLASS` | const | `:9` | 标签 |
| `DESCRIPTION_CLASS` | const | `:12` | 描述文字 |
| `SECTION_TITLE_CLASS`/`SECTION_DESCRIPTION_CLASS` | const | `:15/:18` | 区块标题/描述 |
| `CARD_CLASS` | const | `:21` | 卡片容器（`rounded-xl settings-card`；**只有默认深色主题用透明** `:20`） |
| `ROW_CLASS` | const | `:24` | 卡片内行 |
| `DIVIDER_CLASS` | const | `:27` | 分隔线 |

## 3. 内部逻辑与关键流程

纯常量；`settings-card` 类交全局主题（`:20` 注释）。

## 4. 调用者与调用链

入向：primitives 全家（同批）+各设置页。出向：无。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

不适用（样式 token）。

## 8. 修改影响面

- 改 class token → 全设置页视觉一致性。
- 改 `CARD_CLASS` → 主题适配面（`settings-card` 全局类耦合）。
- 删导出 → primitives 编译面。
- 无测试锁定（§9）：改动需人工验证设置页视觉。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsUIConstants` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 常量 | 已证实 | 逐行读 `:1-27` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 常量 | §2 | `:9-27` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
