---
path: apps/electron/src/renderer/atoms/markdown-font-size.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 693b0900230683d0d9dffc0f6bca6f525bb3d639
sha256: b29bb0438e5429180026871d0687d25b2b64e34e219f76f9b1b01d29dfaf016e
lines: 63
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/markdown-font-size.ts

## 1. 结论与边界

Markdown 预览字号三档偏好（63 行，头注释 `:1-7`）：档位 atom + CSS 变量 `--md-preview-font-size` 写入 + 初始化/更新函数（持久化到 `~/.proma/settings.json` 经 IPC）。驱动 AI 回复（react-markdown）与文件预览（TipTap）根字号。

**边界**：CSS 消费面在样式/组件（跨批）；settings 读写经 `window.electronAPI`（preload 桥，跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `markdownFontSizeAtom` | atom（导出） | 21 | `MarkdownFontSize` 初值 `DEFAULT_MARKDOWN_FONT_SIZE`（`../../types`，跨批） | 字号档位 |
| `applyMarkdownFontSizeToDOM` | 函数（导出） | 29-32 | `(size: MarkdownFontSize) => void` | 写 `:root` CSS 变量 |
| `initializeMarkdownFontSize` | 函数（导出） | 39-51 | `(setSize) => Promise<void>` | 从主进程读设置并写 atom+DOM |
| `updateMarkdownFontSize` | 函数（导出） | 56-63 | `(size) => Promise<void>` | DOM 先改 + IPC 持久化 |

内部：`FONT_SIZE_PX`（`:14-18`，`{small:13, medium:15, large:17}`）。导出合计 4。

## 3. 内部逻辑与关键流程

1. `applyMarkdownFontSizeToDOM`（`:29-32`）：`document.documentElement.style.setProperty('--md-preview-font-size', '<px>px')`（inline code/代码块以 em 跟随，`:26-27` 注释）。
2. `initializeMarkdownFontSize`（`:39-51`）：`await window.electronAPI.getSettings()`，`settings.markdownFontSize ?? DEFAULT`（`:44`）→ `setSize`+apply；catch → `console.error('[Markdown字号] 初始化失败:', error)` 且 apply 默认档（`:47-50`）。
3. `updateMarkdownFontSize`（`:56-63`）：**先 apply DOM（`:57`）再 `updateSettings({markdownFontSize:size})`**（`:59`）；持久化 catch 仅 log（`:60-61`）——**两步非原子**：DOM 已改、持久化可能失败（照实）。

## 4. 调用者与调用链

入向（全冻结树检索 `markdown-font-size`，2 文件）：`renderer/main.tsx:68`（import 块，初始化链）、`components/settings/AppearanceSettings.tsx:31`（import 块，档位切换 UI）。
出向：`jotai`、`../../types`（`DEFAULT_MARKDOWN_FONT_SIZE`/`MarkdownFontSize`，`:10-11`）、`window.electronAPI`（getSettings/updateSettings）。

## 5. 数据 I/O、读写与副作用

- DOM 写：`:root` style `--md-preview-font-size`（`:31`）。
- IPC 读：`getSettings()`（`:43`）；IPC 写：`updateSettings({markdownFontSize})`（`:59`）——持久化到 `~/.proma/settings.json`（头注释 `:6`）。
- 副作用：console.error 两条（`:48`/`:61`）。

## 6. 分支、失败、取消与恢复

- init 失败（IPC/异常）→ 回退默认档 DOM（`:47-50`）；settings 缺字段 → 默认档（`:44`）。
- update 持久化失败 → 仅 log，**DOM 不回滚**（`:60-61`）。
- 无取消机制（async 短任务）。

## 7. 权限与权威状态

无权限分支（不适用，依据：无 sender/role 检查）。权威=主进程 settings（写入经 preload 桥）。

## 8. 修改影响面

- `main.tsx` 初始化链与 `AppearanceSettings` 档位 UI；CSS 变量 `--md-preview-font-size` 的样式消费面（跨批）。
- `FONT_SIZE_PX` 13/15/17 是视觉契约；档位枚举来自 `../../types`（跨批）。
- 非原子语义（§3.3）：持久化失败时 UI 档位与磁盘不一致（重启回旧值）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `markdown-font-size` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/三档 px/init 回退/更新非原子 | 已证实 | `:1-63` 全文逐行 |
| 2 个调用方 | 已证实 | 全树检索（§4） |
| CSS 变量消费面（em 跟随） | 推断 | `:26-27` 注释（样式跨批） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `FONT_SIZE_PX`/`markdownFontSizeAtom` | §2 | 14-21 | covered |
| `applyMarkdownFontSizeToDOM` | §3.1/§5 | 29-32 | covered |
| `initializeMarkdownFontSize` | §3.2/§6 | 39-51 | covered |
| `updateMarkdownFontSize`（非原子） | §3.3/§6 | 56-63 | covered |
