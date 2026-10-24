---
path: apps/electron/resources/skins/ocean-light/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 63899fbf4c5572002cf6a5712a9eb5ca800aac12
sha256: b686cb83976653d1f41dc01c9cc27c384c82c28e2e3b28d1db054c83eb037986
lines: 13
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/ocean-light/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「晴空碧海」（ocean-light）的 manifest：v2 契约、light tone、无预览缩放/tooltip。纯 JSON 声明。

### 4. 调用者与边界

同前：`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`；`titlebar` → `titlebar-overlay.ts`。

### 5. 数据 I/O 与副作用

静态资源，无副作用。

### 6. 校验与失败

全字段合法；失败分支由 parser 承担（本文件不触发）。

## 2. 变量与选择器契约

### 2. 字段清单（13 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"ocean-light"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"晴空碧海"` | `name` |
| `tone` | `:4` | `"light"` | `tone` |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"晴空碧海 — 海天晨光"` | `description?` |
| `titlebar.color` | `:9` | `"#e6eef5"` | `titlebar.color` |
| `titlebar.symbolColor` | `:10` | `"#1b2632"` | `titlebar.symbolColor` |
| `contractVersion` | `:12` | `2` | 保留为 2（`:389-391`） |

无 `previewScale`/`previewPosition`/`tooltip`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `tone` | `light` | light 三成员：本、forest-light、slate-light |
| 可选三字段 | 全无 | forest-light/slate-* 有 previewScale；terminal-dark 有 tooltip |
| titlebar 色 | `#e6eef5`/`#1b2632`（浅底深符） | 各自定 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`builtin` 由扫描方传入。

## 4. 修改影响面

### 8. 修改影响面

同前（id/目录名耦合、titlebar、tone 一致性）。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts:43-52`/`:54-58` 覆盖 contractVersion 路径。`NOT_RUN`。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 行 9 字段值如 §2 | 已证实 | 文件全读 |
| 无 preview/tooltip | 已证实 | 全量核对 |
| 视觉效果 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 字段全量 | §2 | covered |
| 差异/消费者/校验 | §3-§6 | covered |
| 测试 | §9 | covered（间接） |
