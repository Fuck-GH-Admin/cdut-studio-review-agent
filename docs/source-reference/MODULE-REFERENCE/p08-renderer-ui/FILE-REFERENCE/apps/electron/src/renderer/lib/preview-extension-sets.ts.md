---
path: apps/electron/src/renderer/lib/preview-extension-sets.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9267e050f02099b020fcf813fccf1bc45bfc150f
sha256: 4a9d30d8ad54d2cf95162793c25dc9d5785d7fa859a48c8a1262fdb216004512
lines: 75
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/preview-extension-sets.ts

## 1. 结论与边界

预览扩展名分类的**单一来源**（纯常量模块，运行时无逻辑分支）：5 个 `Set<string>` 常量按「谁来渲染」划分文件扩展名——不支持、OFV 也不可预览的纯二进制、静态图、面板可编辑纯文本、必须留在预览面板（`preview-extension-sets.ts:1-10`）。本文件从 `DiffTabContent` 抽出供各预览路由共用（`:2`）。

边界：不做扩展名解析（解析在 `ofv-extensions.ts:69-73` `fileExtension`）、不做任何渲染与 I/O；OFV 承担范围的最终并集在 `ofv-extensions.ts:58-63` `OFV_EXTS` 组装；`.md` 富文本编辑器、HTML 双模式、docx/pptx Silurus 契约等专属渲染器不在本文件。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `UNSUPPORTED_EXTS` | 导出常量 | 12-29 | `Set<string>` | 明确不支持预览的格式：可执行/库、归档、字体、编译产物、数据库/映像/安装包、二进制数据、多媒体、设计/3D（`":13-28` 注释分组） |
| `NON_PREVIEWABLE_BINARY_EXTS` | 导出常量 | 35-39 | `Set<string>` | 连 OFV 也无法有意义预览的纯二进制/映像，保留「不支持」提示，不交给 OFV 试（`:31-34`） |
| `IMAGE_PREVIEW_EXTS` | 导出常量 | 49-52 | `Set<string>` | Chromium `<img>` 自解的位图/SVG 13 个扩展名（`:44-47` 收录口径） |
| `EDITABLE_TEXT_EXTS` | 导出常量 | 59 | `Set<string>` | 面板可直接编辑纯文本 `.txt/.text/.log`（`.md` 另有富文本编辑器，`:55-57`） |
| `PANEL_ONLY_PREVIEW_EXTS` | 导出常量 | 73-75 | `Set<string>` | 必须留在预览面板的 `.md/.markdown/.html/.htm/.docx/.pptx/.pdf`（逐项理由 `:62-71`） |

导出计数：5（常量 5，函数 0，类型 0）；无内部函数（全文件仅常量与注释）。

## 3. 内部逻辑与关键流程

本文件不适用（纯常量声明，无执行流程），依据：全文 75 行由 1 个文件头注释（`preview-extension-sets.ts:1-10`）、4 段常量注释和 5 个 `new Set([...])` 字面量组成，无 import、无语句级逻辑（`:12-75`）。

## 4. 调用者与调用链

入向（全冻结树字符串检索 `preview-extension-sets` 及 5 个常量名，命中 3 个真实 importer + 1 处注释提及）：
- `components/diff/DiffTabContent.tsx:34` 导入 `EDITABLE_TEXT_EXTS, IMAGE_PREVIEW_EXTS, UNSUPPORTED_EXTS`；消费点 `:303`（`isPlainTextEditable = previewOnly && EDITABLE_TEXT_EXTS.has(ext)`）、`:313`（`isImageExt = IMAGE_PREVIEW_EXTS.has(ext)`）、`:316`（`isUnsupported = previewOnly && UNSUPPORTED_EXTS.has(ext)`）。
- `components/diff/SidebarFilePreview.tsx:20` 导入 `IMAGE_PREVIEW_EXTS`；消费点 `:163`（`isImagePreview = IMAGE_PREVIEW_EXTS.has(ext)`）。
- `renderer/lib/ofv-extensions.ts:14` 导入 `NON_PREVIEWABLE_BINARY_EXTS, IMAGE_PREVIEW_EXTS, UNSUPPORTED_EXTS`；消费点 `:59-60`（`OFV_EXTS` = `OFV_OFFICE_EXTS` ∪ `OFV_EXTRA_EXTS` ∪ `IMAGE_PREVIEW_EXTS` ∪（`UNSUPPORTED_EXTS` − `NON_PREVIEWABLE_BINARY_EXTS`））。
- 注释提及（非代码消费）：`components/file-browser/ofv-preview/OfvPreview.tsx:6`。

出向：无（无 import，`preview-extension-sets.ts:1-75`）。

## 5. 数据 I/O、读写与副作用

无任何 I/O 与副作用，依据：全文件仅模块常量构造（`preview-extension-sets.ts:12-75`），无 fs/网络/进程/全局可变状态；`Set` 只在模块加载时构造一次，消费方只读 `.has()`/展开（`DiffTabContent.tsx:303,313,316`、`ofv-extensions.ts:59-60`）。

## 6. 分支、失败、取消与恢复

无分支无失败路径，依据：`preview-extension-sets.ts:12-75` 无 if/throw/return。消费方的分支（如 `DiffTabContent.tsx:316` 的 `isUnsupported` 短路）在消费方手册记载。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/权限检查，纯数据常量；扩展名分类的「权威」即本文件字面量本身（单一来源，`preview-extension-sets.ts:2`）。

## 8. 修改影响面

- 增删任一扩展名会同时改变：`DiffTabContent` 预览面的可编辑/图片/不支持三分支（`DiffTabContent.tsx:303,313,316`）、`SidebarFilePreview` 的图片预览判定（`:163`）、`OFV_EXTS` 的 OFV 承担并集（`ofv-extensions.ts:58-63`）。
- 从 `UNSUPPORTED_EXTS` 移除某扩展名而不加入 `OFV_EXTRA_EXTS`/`IMAGE_PREVIEW_EXTS`：该格式将落到默认文本渲染路径（`ofv-extensions.ts:1-13` 注释描述的分界原则）。
- `NON_PREVIEWABLE_BINARY_EXTS` 必须是 `UNSUPPORTED_EXTS` 的子集才有意义（`:60` 用差集），误配会把纯二进制交给 OFV textPlugin 渲成乱码（`:5-6` 注释自述风险）。
- 无专属测试文件（见 §9）；改动后需人工核对三个消费点分支。
- `UNSUPPORTED_EXTS` 内 `.bin` 重复列出两次（`preview-extension-sets.ts:14` 与 `:24`）——`Set` 去重后无行为差异，如实记录。

## 9. 测试证据

- 直接测试：无。全冻结树检索 `preview-extension-sets` 命中文件中无 `.test.`/`.spec.`（检索范围：baseline/source 全树全扩展名，2026-10-24）。
- 间接证据：无（`ofv-extensions`/`DiffTabContent` 亦无直接测试引用本常量）。
- NOT_RUN：本轮未运行任何测试（`bun test`/typecheck/build/Electron GUI 均未执行）；以上为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出常量的成员清单与行号 | 已证实 | `preview-extension-sets.ts:12-75` 逐行读 |
| 3 个 importer 与全部代码消费点 | 已证实 | `DiffTabContent.tsx:34,303,313,316`、`SidebarFilePreview.tsx:20,163`、`ofv-extensions.ts:14,59-60` |
| `PANEL_ONLY_PREVIEW_EXTS` 全冻结树无任何代码消费者（仅 `:73` 自身定义与 `:9` 注释） | 已证实（检索） | 全树 grep `PANEL_ONLY_PREVIEW_EXTS` 仅 2 处命中且同属本文件 |
| `.md`/HTML/docx/pptx/pdf「必须留面板」的具体契约（ProseMirror、silurus slideCount 等） | 推断 | 仅 `preview-extension-sets.ts:62-71` 注释自述，未读对应渲染器实现 |
| `PANEL_ONLY_PREVIEW_EXTS` 疑似预留未接线 | 推断 | 由「零消费者」检索结果推断其当前为死数据/预留清单 |
| 各格式「历史上直接给不支持提示」的历史行为 | 未知 | 仅注释陈述（`:4`），未核对历史版本 |

NOT_RUN：未运行测试/构建/GUI。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `UNSUPPORTED_EXTS` | §2/§4/§8 | 12-29 | covered |
| `NON_PREVIEWABLE_BINARY_EXTS` | §2/§4/§8 | 35-39 | covered |
| `IMAGE_PREVIEW_EXTS` | §2/§4 | 49-52 | covered |
| `EDITABLE_TEXT_EXTS` | §2/§4 | 59 | covered |
| `PANEL_ONLY_PREVIEW_EXTS` | §2/§4/§10 | 73-75 | covered（零消费者已注明） |
| `.bin` 重复项 | §8 | 14,24 | covered |
