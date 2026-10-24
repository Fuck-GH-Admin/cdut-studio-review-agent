---
path: apps/electron/resources/skins/ocean-dark/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6855af0fa569eb279d77db34fd9e2eefb6b6f42c
sha256: a683b89c47c2a2413032f94de3ac9444ef91a47c066dfc1a13a26c4ce16a20d7
lines: 13
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/ocean-dark/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「远山暮霭」（Ocean Dark）的 manifest：v2 契约、dark tone、无预览缩放/tooltip。纯 JSON 声明。

### 4. 调用者与边界

同前：`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`；`titlebar` → `titlebar-overlay.ts`。

### 5. 数据 I/O 与副作用

静态资源，无副作用。

### 6. 校验与失败

全字段合法；`name` 允许任意非空字符串（缺省才回退 `id`，`skin-service.ts:386`）。

## 2. 变量与选择器契约

### 2. 字段清单（13 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"ocean-dark"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"Ocean Dark"` | `name`（英文名，与其余中文名不同风格） |
| `tone` | `:4` | `"dark"` | `tone` |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"远山暮霭 — 深海玻璃"` | `description?`（中文描述） |
| `titlebar.color` | `:9` | `"#131c26"` | `titlebar.color` |
| `titlebar.symbolColor` | `:10` | `"#e7ebef"` | `titlebar.symbolColor` |
| `contractVersion` | `:12` | `2` | 保留为 2（`:389-391`） |

无 `previewScale`/`previewPosition`/`tooltip`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `name` | `"Ocean Dark"`（英文） | 其余内置为中文名 |
| 可选三字段 | 全无 | 同 mist-paper-dark |
| titlebar 色 | `#131c26`/`#e7ebef` | 各自定 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`builtin` 由扫描方传入。

## 4. 修改影响面

### 8. 修改影响面

同 mist-paper-dark 手册 §8（id/目录名耦合、titlebar、tone 一致性人工维持）。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts:43-52`/`:54-58` 覆盖 contractVersion 路径。`NOT_RUN`。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 行 9 字段值如 §2 | 已证实 | 文件全读 |
| `name` 为英文唯一性（8 内置中） | 已证实 | 8 个 manifest 全读比对 |
| 视觉效果 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 字段全量 | §2 | covered |
| 差异/消费者/校验 | §3-§6 | covered |
| 测试 | §9 | covered（间接） |
