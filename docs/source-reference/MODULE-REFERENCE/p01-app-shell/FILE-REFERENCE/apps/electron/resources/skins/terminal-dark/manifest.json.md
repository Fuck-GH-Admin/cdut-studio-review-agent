---
path: apps/electron/resources/skins/terminal-dark/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2bd0074c32c734e9d4f6169dbffd0e470493aaeb
sha256: 4d94a65256213c0dd1f40d4773896c84b95a950ed3f537b2305c9f988f3b5c28
lines: 14
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/terminal-dark/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「旧屏微光」（terminal-dark，CRT 终端）的 manifest：v2 契约、dark tone、**唯一带 `tooltip` 的皮肤**（"该主题包含轻微闪烁动画"——对应其 skin.css 的 CRT 闪烁动画，前庭敏感/光敏用户提示）。纯 JSON 声明。

### 4. 调用者与边界

`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`。`tooltip` 消费者：设置页皮肤卡片的提示气泡（字符串直传 UI；8 内置中唯一非空）。动画本体在其 `skin.css`（`crt-flicker:123-135`、`indicator-flicker:201-211`、`terminal-cursor-blink:324-327`，均带 `prefers-reduced-motion` 降级 `:137-149`/`:213-217`/`:334-338`）。

### 5. 数据 I/O 与副作用

静态资源，无副作用。

### 6. 校验与失败

`tooltip` 无校验（`:399` 只判 typeof string）；全字段合法。

## 2. 变量与选择器契约

### 2. 字段清单（14 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"terminal-dark"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"旧屏微光"` | `name` |
| `tone` | `:4` | `"dark"` | `tone` |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"CRT 终端 — 暖磷光"` | `description?` |
| `tooltip` | `:8` | `"该主题包含轻微闪烁动画"` | `tooltip?`（字符串原样，`:399`，无校验） |
| `titlebar.color` | `:9` | `"#0d0e0c"` | `titlebar.color` |
| `titlebar.symbolColor` | `:10` | `"#acb09f"` | `titlebar.symbolColor` |
| `contractVersion` | `:12` | `2` | 保留为 2（`:389-391`） |

无 `previewScale`/`previewPosition`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `tooltip` | 闪烁动画提示 | **8 内置唯一** |
| `previewScale`/`previewPosition` | 无 | forest-light/slate-* 有 |
| titlebar 色 | `#0d0e0c`/`#acb09f`（近黑底暖绿符） | 内置最暗 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`builtin` 由扫描方传入。

## 4. 修改影响面

### 8. 修改影响面

`tooltip` 文案与 css 动画行为应保持一致（人工维持，无机器校验）；删除 tooltip 会失去闪烁警示。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts:43-52`/`:54-58` 覆盖 contractVersion 路径；`tooltip` 归一无断言。`NOT_RUN`。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 行 10 字段值如 §2 | 已证实 | 文件全读 |
| `tooltip` 唯一非空 | 已证实 | 9 manifest 全读比对 |
| tooltip 与 css 动画一致（"轻微"程度） | 推断 | 文案 vs `crt-flicker` 等；实际观感未运行 |
| tooltip 消费端展示位置 | 未知 | 未逐处检索 UI |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 10 字段全量 | §2 | covered |
| 差异/消费者/校验 | §3-§6 | covered |
| 与 css 动画的关联 | §4 | covered |
| 测试 | §9 | covered（间接） |
