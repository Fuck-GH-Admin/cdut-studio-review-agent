---
path: apps/electron/resources/skins/slate-dark/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b3ac2c0a1a5ab31526ad41860838e3b5a90f0f74
sha256: c4cae80f4bf2ecffd7947bc2bfe0a74823a9b1724a321c0505771f2078351b35
lines: 15
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/slate-dark/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「莫兰迪夜」（slate-dark）的 manifest：v2 契约、dark tone、**唯一同时带 `previewScale` 与 `previewPosition` 的皮肤**（预览取景双参数）。纯 JSON 声明。

### 4. 调用者与边界

`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`。`previewPosition` 消费者：设置页皮肤预览的 CSS `background-position` 取景（字符串原样传给预览图渲染；`previewPosition` **无格式校验**，`skin-service.ts:398` 只判 typeof string）。

### 5. 数据 I/O 与副作用

静态资源，无副作用。

### 6. 校验与失败

`previewScale` 非 >0 → 丢弃；`previewPosition` 任意字符串通过（包括非法 CSS 值——渲染层兜底未知，见 §10）。

## 2. 变量与选择器契约

### 2. 字段清单（15 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"slate-dark"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"莫兰迪夜"` | `name` |
| `tone` | `:4` | `"dark"` | `tone` |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"莫兰迪夜 — 莫兰迪灰紫"` | `description?` |
| `previewScale` | `:8` | `1.15` | >0 数字（`:397`）✓ |
| `previewPosition` | `:9` | `"44% 58%"` | 字符串原样传递（`:398`，无格式校验） |
| `titlebar.color` | `:10` | `"#1f1c21"` | `titlebar.color` |
| `titlebar.symbolColor` | `:11` | `"#e9e6e3"` | `titlebar.symbolColor` |
| `contractVersion` | `:13` | `2` | 保留为 2（`:389-391`） |

无 `tooltip`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `previewPosition` | `"44% 58%"` | **8 内置唯一** |
| `previewScale` | `1.15` | forest-light 1.45、slate-light 1.3 |
| `tooltip` | 无 | 仅 terminal-dark |
| 行数 | 15 | 内置最长（多两个可选字段） |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；字段归一权威在 `readManifest:397-398`。

## 4. 修改影响面

### 8. 修改影响面

改预览双参数影响设置页预览取景；`previewPosition` 无校验意味着错误值的失败模式是"预览取景异常"而非拒绝（推断，未运行验证）。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts` 只覆盖 contractVersion 路径（`:43-52`/`:54-58`）。`previewScale`/`previewPosition` 归一**无测试断言**。`NOT_RUN`。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 行 11 字段值如 §2 | 已证实 | 文件全读 |
| `previewPosition` 唯一且无格式校验 | 已证实 | 8 manifest 比对；`skin-service.ts:398` |
| 非法 previewPosition 的渲染表现 | 推断 | 无校验+原样传递 |
| 预览取景效果 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 11 字段全量 | §2 | covered |
| 逐文件差异 | §3 | covered |
| 消费者/校验 | §4/§6 | covered |
| 测试/缺口 | §9 | covered |
