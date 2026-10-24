---
path: apps/electron/src/renderer/components/agent/image-attachment-marker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a3780bd118f2d13bde2f4198ab24a9b10088bcca
sha256: 11ee7ccd3062a26fac213f7629c2fdc6d6eaf3bcbe6c1a1e908c4f56d35c4311
lines: 87
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/image-attachment-marker.ts

## 1. 结论与边界

历史本地图片附件协议标记解析（仅兼容旧会话，`:1`）+结构化工具结果图片提取。安全契约（`:63-66` 注释）：**无效/伪造/不支持 MIME 的标记绝不进图片加载器**；标记形文本一律从展示文本移除。renderer 仅接受已知非执行型位图 MIME（`:19`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个常量 + 1 个 type + 1 个接口 + 2 个函数 = 5 个导出（类 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `IMAGE_ATTACHMENT_MARKER_PREFIX` | 常量（导出） | 2 | `'[PROMA_IMAGE_ATTACHMENT:'` |
| `AgentImageAttachmentMediaType` | type（导出） | 4 | png/jpeg/gif/webp 四种 |
| `ParsedAgentImageAttachment` | 接口（导出） | 6-10 | `{localPath,filename,mediaType}` |
| `parseAgentImageAttachmentDetails` | 函数（导出） | 36-50 | 从 details 提取（兼容 `send_local_image`/`generate_image`：`image`/`output.image`/`imageAttachments[]`，`:39-43`；按 localPath 去重） |
| `parseAgentImageAttachmentMarkers` | 函数（导出） | 67-87 | 提取合法标记+**移除全部标记形 token**（`:84`）；压缩 ≥3 空行 |
| `SUPPORTED_MEDIA_TYPES`/`MARKER_REGEX`/`isSupportedImageMediaType`/`parseImageValue`/`isParsedAgentImageAttachment` | 内部 | 12-61 | 白名单 Set；全字段严格校验（缺字段拒，`:29-31`） |

## 3. 内部逻辑与关键流程

`parseAgentImageAttachmentMarkers`（`:67-87`）：正则循环 `JSON.parse`→`isParsedAgentImageAttachment` 严格形状校验（localPath/filename 非空+MIME 白名单）；**畸形/类标记文本刻意忽略**（`:78-80`）；最后无条件替换所有标记形 token 得 cleanText。

## 4. 调用者与调用链

入向：renderer 消息文本/工具结果渲染；测试：`image-attachment-marker.test.ts`（55 行，本批）。出向：无 import（纯解析）。

## 5. 数据 I/O、读写与副作用

纯解析；无 IO。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 非对象/缺字段/MIME 拒 | 不产出图片 | 26-33,52-61 |
| JSON 坏/类标记文本 | 忽略（仍移除） | 78-80,84 |
| 重复 localPath | 去重 | 47 |
| 非对象 details | `[]` | 37 |

## 7. 权限与权威状态

MIME 白名单权威=`SUPPORTED_MEDIA_TYPES`（防 SVG 等执行型，`:19`）；标记来自受控主进程工具但 renderer 仍二次校验。

## 8. 修改影响面

改校验影响旧会话图片回放安全；影响测试。

## 9. 测试证据

直接测试：`image-attachment-marker.test.ts`（55 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 伪造/不支持拒入加载器 | 已证实 | `:63-66,78-80` |
| 标记形文本全移除 | 已证实 | `:84` |
| details 三形态兼容 | 已证实 | `:39-43` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 五导出+校验族 | §2,§3 | 2-87 | covered |
