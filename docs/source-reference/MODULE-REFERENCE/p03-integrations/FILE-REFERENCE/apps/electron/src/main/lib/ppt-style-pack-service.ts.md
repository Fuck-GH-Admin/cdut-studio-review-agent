---
path: apps/electron/src/main/lib/ppt-style-pack-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a4e9272bfd7789d4ad42888e1e2e44fd5af3531
sha256: 18cbf6793be7fb18ab6df0e9fc418ed5231bc5c0639b31c2e332d343a441a502
lines: 248
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-style-pack-service.ts

## 1. 结论与边界

PPT 样式包服务：从受控资源目录加载**内置白名单**样式包（`academic-editorial`/`profer-cloud-dancer`），经 pack.json 契约校验后注册 opaque 预览 URL。安全要点：白名单加载防任意目录自动暴露（`:219` 注释）、preview.asset 限包内受控文件名（`:177-179`）、编译器入口只读契约不碰用户路径（`:229`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 5 个接口 + 4 个函数 = 10 个导出（类/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PptStylePackId` | type（导出） | 10 | `'academic-editorial'\|'profer-cloud-dancer'`（白名单 `:8`） |
| `PptStylePackTokens` | 接口（导出） | 19-35 | canvas/colors/typography/grid/spacing/lineWidthPt/cornerRadius |
| `PptStylePackMotif`/`PptStylePackDefinition`/`PptStylePack`/`PptStylePackServiceOptions` | 接口（导出） | 37-106 | 母题/完整契约（layoutGrammar/chartLanguage/imageDirection/narrativeRhythm/qaProfile/editorialPolicy/preview）/服务返回/注入选项 |
| `listPptStylePacks` | 函数（导出） | 215-221 | 白名单逐个 buildPack |
| `getPptStylePack` | 函数（导出） | 223-227 | 单查 |
| `getPptStylePackDefinition` | 函数（导出） | 230-240 | **编译器只读**（不注册 preview URL，`:229`） |
| `getPptStylePackPreviewAssetPath` | 函数（导出） | 243-248 | 仅诊断/测试（**不暴露给 Agent**，`:242`） |
| `STYLE_PACK_ID_RE`/`PREVIEW_ASSET_RE`/`EXPECTED_PACK_IDS` | 内部 | 6-8 | id 白名单正则；预览资产正则（webp/png/jpg） |
| `getBuiltinStylePackRoot`/`isPathInside`/`requireString`/`requireRecord`/`validateDefinition`/`readDefinition`/`buildPack` | 内部 | 108-213 | 资源根（packaged/resourcesPath）；win32 大小写归一包含判定；字段校验器；pack.json 校验（schemaVersion 1/编辑策略枚举/preview.asset 白名单+禁绝对+禁 `..`，`:177-179`） |

## 3. 内部逻辑与关键流程

`buildPack`（`:195-213`）：读校验定义→previewPath 包内校验（越界抛 `preview.asset 越界`）+存在性→`registerPreviewPath ?? registerProferFilePath` 注册→**必须返回 `cdut-file://` opaque URL**（否则抛，`:203`）→返回 pack（preview 为 markdown 图片串）。

`validateDefinition`（`:132-181`）：schemaVersion/id 正则/id 与目录一致/白名单；editorialPolicy mode/headlineStyle 枚举校验（`:155-157`）；booleans 严格 `===true`。

## 4. 调用者与调用链

入向：PPT 生成链（layout-engine 消费 `PptStylePackDefinition`）+ 样式包 UI；测试：`ppt-style-pack-service.test.ts`（105 行，本批）。出向：`electron.app`、`node:fs/path`、`./local-file-protocol.ts:4`。

## 5. 数据 I/O、读写与副作用

读：pack.json + 预览图（stat/exists）；副作用：注册 opaque 文件 URL（token 化）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| id 非白名单/格式无效 | 抛 | 136-138,224 |
| pack.json 缺/坏 | 抛（含原因） | 185-191 |
| 字段非法 | 抛（字段名消息） | 122-130 |
| preview 越界/缺 | 抛 | 177-179,198-199 |
| 注册非 opaque URL | 抛 | 203 |
| 资源根缺失 | 抛 | 217 |

## 7. 权限与权威状态

- 白名单权威=`EXPECTED_PACK_IDS`（防任意目录暴露，`:219`）。
- 预览仅 opaque URL（`registerProferFilePath` token 门控，联动 nb-67 local-file-protocol）。
- 编译器入口隔离用户路径（`:229`）。

## 8. 修改影响面

改校验影响样式包供给安全；改契约影响 layout-engine/slide-components。

## 9. 测试证据

直接测试：`ppt-style-pack-service.test.ts`（105 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 白名单加载/防暴露 | 已证实 | `:8,219-220` |
| preview 资产白名单+禁穿越 | 已证实 | `:177-179` |
| opaque URL 强制 | 已证实 | `:203` |
| 编译器只读契约 | 已证实 | `:229-240` |
| 真实资源包内容 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 校验族 | §2,§3 | 108-193 | covered |
| 构建/四 API | §3 | 195-248 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
