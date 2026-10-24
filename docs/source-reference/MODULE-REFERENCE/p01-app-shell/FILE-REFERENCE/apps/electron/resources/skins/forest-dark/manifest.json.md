---
path: apps/electron/resources/skins/forest-dark/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d6421bbf6a5c89358e12f0c65bf7c4473b46b78
sha256: e267993d7bc818853629f232d838b57e4bf76a33e54c92fa017797ac8eb88b58
lines: 13
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/forest-dark/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「森息夜语」（forest-dark）的 manifest：v2 契约、dark tone、无预览缩放/tooltip。经 `readManifest` 解析进皮肤注册表（`builtin: true`），`titlebar` 两色供原生窗口框架着色。纯 JSON 声明，无逻辑。

### 4. 调用者与边界

- 加载链：`skin-service.ts` `scanSkins:408`（扫描内置目录 `getBuiltinSkinDir:270`）→ `readManifest:349`（本文件解析）→ `SkinInfo` → preload `getSkins`（`skins:get-list`）→ 设置页皮肤列表。
- `titlebar` 消费：`titlebar-overlay.ts` `getWindowFrameColor`/`updateWindowFrameAppearance`（`main/index.ts:511`、`:597` 应用到 BrowserWindow）。
- 配套 `skin.css`（同批）由 `getSkinCss:484` 读取、`handleProferSkinRequest:567` 经 `profer-skin://` 协议供给 renderer。

### 5. 数据 I/O 与副作用

静态资源，无副作用；读取发生在 `readManifest`（`readFileSync` + `lstatSync` 符号链接拒绝 `:354`）。

### 6. 校验与失败

全部校验在 `readManifest`/`parseSkinManifestText`：id/tone 非法 → 皮肤整体跳过（warn 日志）；`contractVersion` 非整数或 <2 → 归一 1（不拒绝）。本文件 9 字段全部合法。

## 2. 变量与选择器契约

### 2. 字段清单（13 行全量）

| 字段 | 行 | 值 | 解析归一（`skin-service.ts:349-401`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"forest-dark"` | 须 == 目录名 `forest-dark` 且匹配 `SKIN_ID_RE`（`:372`）✓ |
| `name` | `:3` | `"森息夜语"` | `name` |
| `tone` | `:4` | `"dark"` | `tone`（`:342-344` 校验） |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `author` | `:6` | `"Profer"` | `author?` |
| `description` | `:7` | `"森息夜语 — 雾林清晨"` | `description?` |
| `titlebar.color` | `:9` | `"#16201b"` | `titlebar.color` |
| `titlebar.symbolColor` | `:10` | `"#e3e8e5"` | `titlebar.symbolColor` |
| `contractVersion` | `:12` | `2` | 整数 ≥2 保留为 2（`:389-391`） |

无 `previewScale`/`previewPosition`/`tooltip`（解析结果对应字段为 `undefined`，`:397-399`）。

### 3. 逐文件差异表（vs 皮肤 manifest 共性）

| 项 | 本文件 | 差异 |
| --- | --- | --- |
| `previewScale` | 无 | forest-light 1.45、slate-dark 1.15、slate-light 1.3 有 |
| `previewPosition` | 无 | 仅 slate-dark（`"44% 58%"`） |
| `tooltip` | 无 | 仅 terminal-dark（闪烁动画提示） |
| `version` | `1.0.0` | slate-light 为 `1.0.1` |
| 键序 | contractVersion 在末（`:12`） | 模板在 `:6`（无语义差异） |
| titlebar 色 | `#16201b`/`#e3e8e5` | 各皮肤自定 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`builtin: true` 由调用方参数给定（`scanSkins` 传内置标志），不由 manifest 声明。

## 4. 修改影响面

### 8. 修改影响面

改 `titlebar.*` 影响原生标题栏/窗口框架配色；改 `id` 会与目录名不一致 → 皮肤被跳过（`skin-service.ts:372-374`）；改 `contractVersion` 影响 v2 token 语义判定（渲染层据 `SkinInfo.contractVersion` 决定按 v2 契约消费）。与 `skin.css`、皮肤预览图（`skin-preview-cache.ts`，无 previewScale 时默认布局）联动。

## 5. 已证实

### 9. 测试证据

- 无逐皮肤测试；契约解析由 `skin-service.test.ts` 覆盖：`:43-52`（contractVersion 2 传入注册表，`toMatchObject({contractVersion:2, builtin:true})`）与 `:54-58`（`test.each([0,1,-1,1.5,'2',null])` 无效 → 1）直接对应本文件 `:12` 的声明路径。
- `skin-manager-service.test.ts`（安装侧保留名/预览体积）与本文件无关。
- `NOT_RUN`：本轮未执行测试。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 行 9 字段值如 §2 | 已证实 | 文件全读 |
| 无 preview/tooltip 三字段 | 已证实 | 文件全量核对 |
| id==目录名、contractVersion=2 均满足 parser | 已证实 | `:2` vs 目录名；`:12` + `skin-service.ts:389-391` |
| `#16201b`/`#e3e8e5` 在真实窗口的显示效果 | 未知 | NOT_RUN |
| titlebar.symbolColor 缺省分支（`'#ffffff'`）未被本文件走到 | 已证实 | `:10` 显式提供 |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 字段全量 | §2 | covered |
| 逐文件差异 | §3 | covered |
| 加载链/消费者 | §4 | covered |
| 校验/失败 | §6 | covered |
| 测试 | §9 | covered（间接） |
