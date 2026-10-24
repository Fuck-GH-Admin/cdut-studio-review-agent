---
path: apps/electron/resources/skins/slate-light/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 48e3f40826a37a714725d9cb29e4a4e4972451ed
sha256: 5a85397ccd4770fb3c06365364ca9009bce4300b739ffcb64c008334cb35ac39
lines: 14
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/slate-light/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「云朵舞者」（slate-light）的 manifest：v2 契约、light tone、**唯一 `version` 为 `"1.0.1"` 的内置皮肤**（其余全为 1.0.0）；带 `previewScale: 1.3`。纯 JSON 声明。

### 4. 调用者与边界

`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`。`version` 只作展示元数据（无升级逻辑依赖它；`skin-manager-service` 安装冲突按 id/目录名判定）。

### 5. 数据 I/O 与副作用

静态资源，无副作用。

### 6. 校验与失败

全字段合法；`version` 无格式校验（任意字符串，`:392`）。

## 2. 变量与选择器契约

### 2. 字段清单（14 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"slate-light"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"云朵舞者"` | `name` |
| `tone` | `:4` | `"light"` | `tone` |
| `version` | `:5` | `"1.0.1"` | `version?`（**唯一非 1.0.0**） |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"云朵舞者 — 温暖灰调"` | `description?` |
| `previewScale` | `:8` | `1.3` | >0 数字（`:397`）✓ |
| `titlebar.color` | `:9` | `"#e6e4df"` | `titlebar.color` |
| `titlebar.symbolColor` | `:10` | `"#312f2a"` | `titlebar.symbolColor` |
| `contractVersion` | `:12` | `2` | 保留为 2（`:389-391`） |

无 `previewPosition`/`tooltip`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `version` | `"1.0.1"` | 其余 8 个（含模板）全 `1.0.0` |
| `previewScale` | `1.3` | forest-light 1.45、slate-dark 1.15 |
| `previewPosition` | 无 | 仅 slate-dark |
| `tooltip` | 无 | 仅 terminal-dark |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`builtin` 由扫描方传入。

## 4. 修改影响面

### 8. 修改影响面

同前；`version` 与 skin.css 的演进（slate-light css 有专属 heatmap 覆盖）无机器关联——版本号只是展示。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts:43-52`/`:54-58` 覆盖 contractVersion 路径。`NOT_RUN`。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 行 10 字段值如 §2 | 已证实 | 文件全读 |
| `version` 唯一 1.0.1 | 已证实 | 9 个 manifest 全读比对 |
| 版本号是否有消费方展示 | 未知 | 未逐处检索 UI |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 10 字段全量 | §2 | covered |
| 差异/消费者/校验 | §3-§6 | covered |
| 测试 | §9 | covered（间接） |
