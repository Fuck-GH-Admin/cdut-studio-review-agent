---
path: apps/electron/resources/skin-template/manifest.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 605a7375e89f55864ad233d1fe1b95a4d66f36d8
sha256: d86468f63a92f61e545207cbbde89672849d74e04ef7f75ba68f2cb75ee76168
lines: 13
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skin-template/manifest.json

## 1. 作用域与加载者

### 1. 结论与边界

皮肤**模板包**的 manifest（用户自制皮肤的样板；`skin-template/` 目录整体是"新建皮肤"的起手内容，不进内置皮肤注册表——`scanSkins` 只扫 `skins/` 与用户目录）。声明一个 v2 契约（Skin Surface Contract v2）示例皮肤。

不做的事：不参与皮肤注册/加载（无消费者遍历本目录）；无运行时逻辑（纯 JSON）。

### 4. 调用者与边界

- 本模板**有** 4 个消费者（全冻结树检索 `skin-template`）：`skin-manager-service.ts:207` `getSkinTemplateDir`（新建皮肤时复制源，打包在 `process.resourcesPath/skin-template`）；`SkinManager.tsx:9-10` 以 `?raw` 导入本文件与 css 作为模板文本；`check-skin-surface-contract.mjs:16`（契约门禁，校验 `contractVersion===2`/tone/34 token，`:111-139`）；`electron-builder.yml:94-96`（打包拷贝）。**不入** `scanSkins` 皮肤注册表。
- 契约消费者（同批内置皮肤的）：`skin-service.ts` `parseSkinManifestText:327-346`（BOM 剥离 + JSON + id/tone 校验）、`readManifest:349-401`（符号链接拒绝 `:354`、id==目录名 `:372`、字段归一）、`scanSkins:408`（内置优先）。
- renderer 端经 preload `getSkins:2513`（`skins:get-list`）拿 SkinInfo 列表。

### 5. 数据 I/O 与副作用

纯静态资源，无 I/O、无副作用；被拷贝（安装向导/文档示意）时才产生写操作（由调用方发起）。

### 6. 校验与失败

运行时由 `readManifest` 校验（§2 映射列）；本文件自身无分支。若按模板建包：`id` 必须改成与目录名一致的 kebab-case（`skin-service.ts:372-374` 否则跳过），`tone` 必须 light/dark（`:342-344` 否则拒绝）。

## 2. 变量与选择器契约

### 2. 字段清单（13 行全量）

| 字段 | 行 | 值 | SkinInfo 映射（`apps/electron/src/types/settings.ts:178-192`） |
| --- | --- | --- | --- |
| `id` | `:2` | `"my-skin"` | `id`（kebab-case，`SKIN_ID_RE` `skin-service.ts:113`） |
| `name` | `:3` | `"我的皮肤"` | `name` |
| `tone` | `:4` | `"dark"` | `tone: 'light'\|'dark'`（`parseSkinManifestText` 校验 `skin-service.ts:342-343`） |
| `version` | `:5` | `"1.0.0"` | `version?` |
| `contractVersion` | `:6` | `2` | `contractVersion`（整数 ≥2 才保留，否则归一 1，`skin-service.ts:389-391`） |
| `author` | `:7` | `"你的名字"` | `author?` |
| `description` | `:8` | `"我的第一款 Profer 皮肤"` | `description?` |
| `titlebar.color` | `:10` | `"#172033"` | `titlebar.color`（缺失则整个 titlebar 为 undefined，`skin-service.ts:376-383`） |
| `titlebar.symbolColor` | `:11` | `"#f8fafc"` | `titlebar.symbolColor`（缺省兜底 `'#ffffff'`） |

### 3. 与内置 manifest 的差异（逐文件差异表口径）

| 差异点 | 本文件 | 内置 8 个 |
| --- | --- | --- |
| `contractVersion` 键位置 | `:6`（author 之前） | 文件末（`titlebar` 之后）——JSON 键序无语义，parser 不关心 |
| `id`/`author`/`description` | 示例占位（`my-skin`/`你的名字`/`我的第一款 Profer 皮肤`） | 真实皮肤 |
| `previewScale`/`previewPosition`/`tooltip` | 无 | forest-light/slate-dark/slate-light 有 previewScale；slate-dark 有 previewPosition；terminal-dark 有 tooltip |
| 注释 | 无（JSON 不支持注释） | 同 |

## 3. 层叠

本文件为纯 JSON 声明，无 CSS 层叠/优先级概念；解析归一与校验链见下（字段非法时的降级/跳过即本文件的“失败层叠”）。

### 7. 权限与权威状态

无权限语义；`SkinInfo` 的字段权威在 `readManifest` 的归一（缺省/非法值降级），manifest 只是声明。

## 4. 修改影响面

### 8. 修改影响面

改模板字段会改变新皮肤起手内容（`SkinManager.tsx` 内嵌文本与 `skin-manager-service` 复制源随之变化）；受 `check-skin-surface-contract.mjs:111-139` 门禁（`contractVersion` 必须 2、tone 必须 light/dark）。与 `skin-template/skin.css`（同批）配套——`contractVersion: 2` 对应其 Skin Surface Contract v2 token 组。

## 5. 已证实

### 9. 测试证据

- 无直接测试（模板不被加载）。
- 契约校验由 `apps/electron/src/main/lib/skin-service.test.ts` 覆盖（间接保证本模板格式合法）：`:29-41` 无 contractVersion → 归一 1；`:43-52` contractVersion 2 → 传入注册表（`toMatchObject({contractVersion:2, builtin:true})`）；`:54-58` `test.each([0,1,-1,1.5,'2',null])` 无效值 → 1。mock：`mock.module('electron')`（`:7-10`），夹具 `withSkinManifest`（`:14-26`）。
- `NOT_RUN`：本轮未执行测试/typecheck/build/GUI。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 行 9 字段值如 §2 | 已证实 | 文件全读 |
| `contractVersion: 2` 声明 | 已证实 | `:6` |
| 模板不入皮肤注册表但被 4 处消费 | 已证实（全冻结树检索 `skin-template`） | `skin-manager-service.ts:207`、`SkinManager.tsx:9-10`、`check-skin-surface-contract.mjs:16`、`electron-builder.yml:94-96`；`scanSkins` 只扫 `skins/`/用户目录（`skin-service.ts:270-287`） |
| 键序与内置不同、无语义差异 | 已证实 | `skin-service.ts:338` 按字段解析，不依赖键序 |
| 用户拿模板建包后 id 与目录名关系 | 推断 | 校验规则 `:372`；模板注释未提示（manifest 无注释能力） |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 字段全量 | §2 | covered |
| 与内置差异 | §3 | covered |
| 契约校验映射 | §2/§6 | covered |
| 消费者/边界 | §4 | covered |
| 测试 | §9 | covered（间接） |
