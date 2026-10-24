---
path: apps/electron/src/main/lib/browser-translate.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2c0fb1d89a2b4538de17f4ad42c76e7777776746
sha256: e3ec65d626f1efa666efaa76bd4087672de947333f7b7e5d71745d209207cb7f
lines: 165
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-translate.ts

## 1. 结论与边界

受管浏览器「整页翻译」用户阅读用途（文件头 `apps/electron/src/main/lib/browser-translate.ts:1-12`）：Electron WebContentsView 不能加载浏览器扩展，故走**主进程注入式翻译**：①CDP 遍历 DOM 文本节点打 tid+备份原文；②主进程 `fetch` 微软免鉴权接口批量翻译（无 CORS）；③CDP 回写译文+`data-profer-translated` 标记；④再点一次从 `data-profer-original` 恢复。**本文件只提供纯函数与可注入脚本字符串**；CDP 调用与状态在 BrowserController。

## 2. 导出与关键符号

`export` 逐条核对：**15 个导出**（11 个常量 + 2 个脚本常量 + 2 个函数/脚本构造）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MICROSOFT_TRANSLATE_ENDPOINT`/`DEFAULT_TRANSLATE_TO`/`MICROSOFT_TRANSLATE_FROM` | 常量（导出） | 15-19 | Edge 免鉴权端点（非公开，可能调整，`:14` 注释）；`zh-Hans`；from 空=自动检测 |
| `TRANSLATE_BATCH_MAX_ITEMS`/`TRANSLATE_BATCH_MAX_CHARS`/`TRANSLATE_SEGMENT_MAX_CHARS`/`TRANSLATE_MAX_NODES` | 常量（导出） | 22-27 | 25 条/5000 字（对齐 Azure 约束）；1800 字拆段；4000 节点上限 |
| `TRANSLATED_FLAG`/`TRANSLATED_TID`/`TRANSLATED_ORIGINAL`/`TRANSLATED_SELECTOR` | 常量（导出） | 30-34 | 节点标记三件套+选择器 |
| `BUILD_COLLECT_SCRIPT` | 脚本常量（导出） | 44-80 | 收集脚本 |
| `buildWriteScript` | 函数（导出） | 86-105 | 写回脚本构造（`\u2028/\u2029` 转义防注入断裂，`:88-89`） |
| `BUILD_RESTORE_SCRIPT` | 脚本常量（导出） | 110-122 | 恢复脚本 |
| `translateTexts` | 函数（导出） | 128-141 | 拆批保序翻译 |
| `translateBatch`/`TID_PREFIX` | 内部 | 143-165,37 | fetch 实现；`__profer_translate__` 命名空间 |

## 3. 内部逻辑与关键流程

- 收集（`:44-80`）：排除 SCRIPT/STYLE/CODE/PRE 等标签与已翻译节点；过滤 <2 字符/纯符号/URL/邮箱/隐藏（display/visibility/opacity/零尺寸）；超 1800 字拆 pieces；打 `data-profer-tid`+`data-profer-original`；节点上限 4000 防卡死（`:26-27`）。
- 写回（`:86-105`）：pid→译文段 join 空格；标记 `data-profer-translated`。
- 恢复（`:110-122`）：原文回填+清三标记。
- 翻译（`:128-165`）：按 25 条拆批；缺译回退原文（`:137`）；`translateBatch` 15s 超时 AbortController；`!response.ok` 抛 `翻译接口返回 <status>`、非数组抛 `翻译接口响应格式异常`（失败交调用方降级，`:126`）。

## 4. 调用者与调用链

入向：BrowserController 翻译流（CDP 调用+状态）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：全局 `fetch`/`URLSearchParams`/`AbortController`。

## 5. 数据 I/O、读写与副作用

网络：POST 微软翻译端点（批量 JSON）；DOM：经注入脚本（由 BrowserController 执行）；本文件本身无状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 空列表 | `[]` | 129 |
| 缺译 | 回退原文 | 137 |
| HTTP 非 2xx/格式异常 | 抛错（调用方降级） | 158-160 |
| 超时 | AbortController abort | 150 |
| 节点超 4000 | 停止收集 | 51 |

## 7. 权限与权威状态

- 端点非公开（`:14` 注释）——失败降级提示为既定语义。
- 脚本命名空间 `__profer_translate__` 防页面全局冲突（`:36-37`）。

## 8. 修改影响面

改脚本/标记影响翻译往返保真；改批量参数影响端点接受率。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 注入式四步契约 | 已证实 | `:1-12` |
| 过滤/拆段/上限 | 已证实 | `:44-80` |
| 恢复可逆（原文备份） | 已证实 | `:110-122` |
| 真实端点行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量族 | §2 | 15-37 | covered |
| 三脚本 | §3 | 44-122 | covered |
| 翻译族 | §3 | 128-165 | covered |
| 断言 | §9,§10 | — | unknown |
