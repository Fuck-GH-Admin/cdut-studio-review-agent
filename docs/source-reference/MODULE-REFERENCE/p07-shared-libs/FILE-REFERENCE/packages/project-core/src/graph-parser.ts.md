---
path: packages/project-core/src/graph-parser.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c73e9376931020eaf93818f6f024ff13e6f91305
sha256: 99b81b9b69f0c48d73442b403d36884a1da48a58db32970beeb55b770e036872
lines: 120
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/project-core/src/graph-parser.ts

## 1. 结论与边界

任务描述**元标记解析**（运行时纯函数）：解析 TaskCreate/TaskUpdate description 中的 `dependsOn`/`artifact`/`usage`/`forkFrom`/`abandon` 标记，支持 `@` 前缀与无前缀两种格式（向后兼容）；「所有函数均为纯函数，无副作用，浏览器安全」（`packages/project-core/src/graph-parser.ts:1-7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `parseDependsOn` | 导出函数 | 31-38 | `(text): string[]` | 逗号分割任务 ID 列表 |
| `parseArtifact` | 导出函数 | 44-51 | `(text): string[]` | 逗号分割产物路径 |
| `parseUsage` | 导出函数 | 57-74 | `(text): {totalTokens?, toolUses?, durationMs?} \| null` | `tokens=/tools=/duration=` 键值 |
| `parseForkFrom` | 导出函数 | 81-84 | `(text): string \| null` | 分叉来源任务 ID |
| `parseAbandon` | 导出函数 | 91-94 | `(text): string \| null` | 放弃原因（图上留枯枝） |
| `stripMetaTags` | 导出函数 | 106-120 | `(text): string` | 去除全部元标记留纯净描述 |

内部正则：`DEPENDS_ON_RE:12`、`ARTIFACT_RE:15`、`USAGE_RE:18`、`FORK_FROM_RE:21`、`ABANDON_RE:24`（均 `(?:@)?` 可选前缀、大小写不敏感）；`META_TAG_PATTERN:97`。

## 3. 内部逻辑与关键流程

- 各 parse：`text.match(RE)` 取 `match[1]`，逗号分割 trim 去空（`parseUsage` 按 `k=v` 解析 `parseInt`，键仅认 `tokens/tools/duration`，无有效键返回 null，`:61-73`）。
- `stripMetaTags`（`:106-120`）：逐行——行首标记（`^\s*(?:@)?(dependsOn|artifact|usage|forkFrom|abandon):`）**整行移除**（`:111-113`）；行内标记只移除标记段并压缩空白（`:115`）；空行过滤 join+trim。

## 4. 调用者与调用链

入向：`packages/project-core/src/graph-query.ts:24`（6 个函数全部导入，`deriveGraph:198-207` 与 `formatTaskContext:604-636` 使用；QA F-NB41-04 校正符号名）。出向：无 import。

## 5. 数据 I/O、读写与副作用

无（纯函数；`parseUsage` 的 `parseInt` 容错 NaN 跳过）。

## 6. 分支、失败、取消与恢复

无 throw；不匹配返回 `[]`/`null`；`stripMetaTags` 恒返回字符串。不适用错误恢复。

## 7. 权限与权威状态

无权限分支（纯文本解析）。

## 8. 修改影响面

改标记语法影响 `graph-query.deriveGraph` 的 dependsOn/分叉/枯枝识别与 UI 元标记写入方（renderer 任务描述约定）。

## 9. 测试证据

无专属测试（冻结树 glob `**/graph-parser*test*` 零命中）；间接由 `graph-query` 消费方测试覆盖（未读）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+5 正则+strip 双规则 | 已证实 | `:12-120` |
| `@` 双格式兼容 | 已证实 | 各 RE `(?:@)?` |
| 无测试 | 已证实（静态） | 冻结树 glob 零命中 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 状态 |
| --- | --- | --- |
| 全部 6 函数 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
