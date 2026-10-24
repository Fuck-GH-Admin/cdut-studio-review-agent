---
path: apps/electron/src/renderer/components/agent/agent-renderable-image.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b57d31b9843d825a8ea146d05f20f4269c467f59
sha256: b4429f9bcf31f1ee4f712f09c0e4a8fad3fcfcc6b3cffa3ba84366810594ffe4
lines: 161
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/agent-renderable-image.tsx

## 1. 结论与边界

通用图片渲染（文件头 `apps/electron/src/renderer/components/agent/agent-renderable-image.tsx:1-10`）统一三来源：`local`（IPC `readAttachment` 读 base64）/`dataUrl`（内嵌）/`remote`（**主进程确认是图片后返回 data URL，渲染层不直连外网**，`:7`）。仅渲染受支持位图（PNG/JPEG/GIF/WebP）；**无法确认来源的远程地址自动不渲染**（`:9`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 6 个函数/组件 = 7 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentRenderableImage` | type（导出） | 17-20 | 三态联合 |
| `toRenderableFromAttachment` | 函数（导出） | 26-33 | 结构化附件→local 模型 |
| `dataUrlImage` | 函数（导出） | 36-39 | **正则拒 SVG 等**（`:22-23` 仅位图前缀），不合格→null |
| `remoteImageSource` | 函数（导出） | 42-44 | 候选（渲染由主进程确认决定，`:41`） |
| `imageKey` | 函数（导出） | 47-56 | 稳定去重键（dataUrl 用长度+前 64 字符，`:52`） |
| `dedupeImages` | 函数（导出） | 59-71 | 多组合并去重 |
| `AgentImageThumb` | 组件（导出） | 82-161 | 缩略图+lightbox+本地另存 |

## 3. 内部逻辑与关键流程

`AgentImageThumb`（`:82-161`）：`resolveSource` 分型（local→`readAttachment`；dataUrl 直用；remote→`resolveImageUrl` **非 ok 即失败** `:102-103`）；失败**静默不显示**（`:127-128`）；加载中骨架屏（`:130-132`）；点击开 ImageLightbox；本地图片另存（`saveImageAs`，`:123-125`）；`active` 旗标防卸载后 setState（`:92,118-120`）。

## 4. 调用者与调用链

入向：消息内联图片（`inline-image-sources` 消费本文件工厂）、图片附件渲染；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@profer/ui/primitives/image-lightbox`、`./image-attachment-marker`（类型）、`window.electronAPI`（readAttachment/resolveImageUrl/saveImageAs）。

## 5. 数据 I/O、读写与副作用

IPC：`readAttachment`/`resolveImageUrl`/`saveImageAs`；本地状态（imageSrc/failed/lightbox）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| dataUrl 非位图 | null | 36-39 |
| remote 未确认 | 静默不显示 | 102-103,127-128 |
| 解析失败 | failed→null | 112-116 |
| 加载中 | 骨架屏 | 130-132 |
| 卸载竞争 | active 旗标 | 92,118-120 |

## 7. 权限与权威状态

远程渲染权威=主进程确认（渲染层不直连外网，`:7`）；位图白名单=`DATA_URL_RE`（`:22-23` 拒 SVG）。

## 8. 修改影响面

改来源解析影响图片渲染安全面；影响 inline-image-sources 与消息渲染。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三来源/渲染层不直连外网 | 已证实 | `:1-10,96-104` |
| SVG 拒/静默不显示 | 已证实 | `:22-23,127-128` |
| 去重键稳定性 | 已证实 | `:46-56` |
| 渲染行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | 17-71 | covered |
| 缩略图组件 | §2,§3 | 82-161 | covered |
| 断言 | §9,§10 | — | unknown |
