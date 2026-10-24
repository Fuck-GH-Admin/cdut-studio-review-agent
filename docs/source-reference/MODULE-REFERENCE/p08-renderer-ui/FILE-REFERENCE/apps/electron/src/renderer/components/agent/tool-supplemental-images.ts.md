---
path: apps/electron/src/renderer/components/agent/tool-supplemental-images.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0836ff2776a47603165d5423f20d6d35a0c5e813
sha256: 6c34138803ab773a95866f0c04291ed63ede55de9e62a0d9c7a9d0b56018c929
lines: 30
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-supplemental-images.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

工具补充图片来源注册表（30 行，头注 :1-7）：某些工具图片不在结果里（CDUT 学籍档案证件照字段只回占位符 `(base64-embedded)`）但本地已存——本注册表把「已知本地图源」接入通用图片渲染，**不改任何工具源码**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `useToolSupplementalImages` | hook | 18-30 | 工具调用→本地补充图片 |

## 3. 内部逻辑与关键流程

`cdut_academic_profile` 且 action 为 `get_profile`/空 → 用登录时已保存的头像 `dataUrlImage(avatar,'证件照')`（注释 :23「不联网抓取，也不改工具」）；其余→`[]`。`React.useMemo` 按 [toolName,action,avatar] 缓存。

## 4. 调用者与调用链

入向：工具结果图片渲染（`agent-renderable-image` 族）。出向：`@/atoms/cdut-account-atoms`（jotai）、`./agent-renderable-image`（:13）。

## 5. 数据 I/O、读写与副作用

读 jotai 原子（本地状态）；无网络/写盘。

## 6. 分支、失败、取消与恢复

单分支；不抛。

## 7. 权限与权威状态

- 隐私/网络边界：头像仅用本地已存数据、不联网抓取（:23）。无 sender/role 检查。

## 8. 修改影响面

学籍档案工具卡片证件照：工具结果图片渲染管线的补充图源注册表。
- 波及面：`agent-renderable-image` 通用图片渲染能力、`cdutAccountAtom` 头像数据；新增注册表条目会扩展其他工具补图。
- 回归关注：仅用本地已存头像不联网抓取（隐私边界）、不改任何工具源码的约定。
- 无专属测试文件（全树检索确认）；回归须靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出/行号 | 已证实 | 逐行核对 |
| 本地数据不联网 | 已证实 | :23 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useToolSupplementalImages` | §3 | 18-30 | covered（未测） |
