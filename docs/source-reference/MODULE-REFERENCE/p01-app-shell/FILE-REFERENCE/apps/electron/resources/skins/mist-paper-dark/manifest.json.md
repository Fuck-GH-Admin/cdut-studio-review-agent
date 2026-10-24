---
path: apps/electron/resources/skins/mist-paper-dark/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e0a4343afc3f60a5e82b8be4ee28140ca36030db
sha256: 22720e892ba09120ec053a14699f2a7bd1fffab2cacab4e33e0764ee11ba97b0
lines: 13
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/mist-paper-dark/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「雾纸暖灰」（mist-paper-dark）的 manifest：v2 契约、dark tone、无预览缩放/tooltip。纯 JSON 声明；配套 `skin.css` 有本批最重的特例规则（阴影五档/输入表面/prose）。

### 4. 调用者与边界

同森林系：`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`（`skins:get-list`）→ 设置页；`titlebar` 供 `titlebar-overlay.ts` 窗口框架配色。

### 5. 数据 I/O 与副作用

静态资源；读取时 `readManifest` 做 `lstatSync` 符号链接拒绝（`:354`）+ `readFileSync`。

### 6. 校验与失败

全字段合法，走 happy path；失败分支（id/tone/JSON）由 parser 承担（本文件不触发）。

## 2. 变量与选择器契约

### 2. 字段清单（13 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"mist-paper-dark"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"雾纸暖灰"` | `name` |
| `tone` | `:4` | `"dark"` | `tone` |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"雾纸暖灰 — 安静的暖石墨工作台"` | `description?` |
| `titlebar.color` | `:9` | `"#2a2928"` | `titlebar.color` |
| `titlebar.symbolColor` | `:10` | `"#b8b6b3"` | `titlebar.symbolColor` |
| `contractVersion` | `:12` | `2` | 保留为 2（`:389-391`） |

无 `previewScale`/`previewPosition`/`tooltip`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| 可选三字段 | 全无 | forest-light/slate-* 有 previewScale；terminal-dark 有 tooltip |
| `version` | `1.0.0` | 仅 slate-light `1.0.1` |
| titlebar 色 | `#2a2928`/`#b8b6b3`（暖石墨） | 各自定 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`builtin: true` 由 `scanSkins` 传入。

## 4. 修改影响面

### 8. 修改影响面

改 `id` → 与目录名不一致被跳过；改 `titlebar.*` → 影响窗口框架配色；`tone` 与 skin.css 亮暗一致性无自动校验（人工维持）。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts:43-52`（contractVersion 2 → 注册表）与 `:54-58`（`test.each` 6 例无效值 → 1）覆盖解析路径。`NOT_RUN`：未执行测试。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 行 9 字段值如 §2 | 已证实 | 文件全读 |
| 无 preview/tooltip 字段 | 已证实 | 全量核对 |
| tone/titlebar 与 css 的视觉一致性 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 字段全量 | §2 | covered |
| 差异/消费者/校验 | §3-§6 | covered |
| 测试 | §9 | covered（间接） |
