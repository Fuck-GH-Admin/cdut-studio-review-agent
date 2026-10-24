---
path: apps/electron/resources/skins/forest-light/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d6761ef5f1643e57edb75639e41583712ebd8c0
sha256: 6906f970bbd0adb74f33b7537b0f844c4582ca11929aa4006a69dc59b56831e8
lines: 14
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/forest-light/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「森息晨光」（forest-light）的 manifest：v2 契约、light tone、**带 `previewScale: 1.45`**（预览图放大取景）。纯 JSON 声明。

### 4. 调用者与边界

同 forest-dark：`scanSkins:408` → `readManifest:349` → SkinInfo → preload `getSkins`。`previewScale` 消费者：皮肤预览渲染（`skin-preview-cache.ts`/设置页预览卡，按缩放取景 preview 图）。

### 5. 数据 I/O 与副作用

静态资源，无副作用。

### 6. 校验与失败

同 parser 规则；`previewScale: 1.45` 满足 `>0`（`:397`），若写 0/负数/字符串会被丢弃为 `undefined`（不拒绝皮肤）。

## 2. 变量与选择器契约

### 2. 字段清单（14 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"forest-light"` | == 目录名 ✓（`:372`） |
| `name` | `:3` | `"森息晨光"` | `name` |
| `tone` | `:4` | `"light"` | `tone` |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"森息晨光 — 自然绿调"` | `description?` |
| `previewScale` | `:8` | `1.45` | 须 >0 数字（`:397`）✓ → 预览图缩放 |
| `titlebar.color` | `:10` | `"#ecf1ee"` | `titlebar.color` |
| `titlebar.symbolColor` | `:11` | `"#1d3026"` | `titlebar.symbolColor` |
| `contractVersion` | `:13` | `2` | 保留为 2（`:389-391`） |

无 `previewPosition`/`tooltip`。

### 3. 逐文件差异表（vs 内置 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `tone` | `light` | 8 内置中 4 light（本、ocean-light、slate-light + 无）——实际 light 共 3 个：本、ocean-light、slate-light |
| `previewScale` | `1.45` | slate-dark 1.15、slate-light 1.3；其余无 |
| `previewPosition` | 无 | 仅 slate-dark |
| `tooltip` | 无 | 仅 terminal-dark |
| titlebar 色 | `#ecf1ee`/`#1d3026`（浅底深符） | 各自定 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`previewScale` 归一权威在 `readManifest:397`。

## 4. 修改影响面

### 8. 修改影响面

改 `previewScale` 影响设置页皮肤预览取景；改 `tone` 影响亮暗归类（与 skin.css 亮色 token 组一致性需人工维持，无自动校验）。

## 5. 已证实

### 9. 测试证据

无逐皮肤测试；`skin-service.test.ts:43-52`/`:54-58` 覆盖 contractVersion 解析路径。`previewScale` 归一（`:397`）**无测试断言**。`NOT_RUN`：未执行测试。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 行 10 字段值如 §2 | 已证实 | 文件全读 |
| `previewScale: 1.45` 唯一最高缩放 | 已证实 | 8 内置 manifest 全读比对 |
| 预览取景实际效果 | 未知 | NOT_RUN |
| `previewScale` 归一逻辑无测试 | 已证实 | `skin-service.test.ts` 全文核对 |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 10 字段全量 | §2 | covered |
| 逐文件差异 | §3 | covered |
| 消费者/校验 | §4/§6 | covered |
| 测试/缺口 | §9 | covered |
