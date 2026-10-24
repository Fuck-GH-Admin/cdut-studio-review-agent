---
path: apps/electron/src/renderer/lib/file-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 97322d10739c6a34130efa477406f256877bacf9
sha256: 0e32e35c00882c76c97414962bec95021c4459a15f05b92deaca7e489dea9af0
lines: 108
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/file-utils.ts

## 1. 结论与边界

**文件处理工具函数**（108 行）：renderer 层路径处理的**统一收敛点**（R1/R2/R4/R5 收敛注释 `:13`/`:21`/`:54`/`:43`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `formatFileNames` | `:7-10` | 名单拼接（>3 显示"等 N 个文件"） |
| `getFileBaseName` | `:16-18` | 兼容 `/`与`\`（全层唯一实现 R1） |
| `isAbsoluteFilePath` | `:34-40` | 盘符/UNC/Unix/`~/`主目录缩写（Agent 输出常用 `:27-29`）；**仅前缀归类**，消息文本检测需调用方叠加保守校验（`:31-32`） |
| `getLastPathSegments` | `:47-51` | 面包屑末 n 段（R5） |
| `resolveRelativeToAbsolute` | `:61-80` | 候选 base 解析（R4）：首段命中 base 目录名不重复嵌套（`:57-58`）→退化首候选；反斜杠统一正斜杠（`:64-65`） |
| `getFileParentPath` | `:82-90` | 父目录（根/盘符边界处理） |
| `fileToBase64` | `:93-108` | FileReader 转 base64；**>100MB 拒绝**（`MAX_ATTACHMENT_SIZE` `:95-97`） |

## 3. 内部逻辑与关键流程

七函数纯工具（除 fileToBase64 异步读文件）。

## 4. 调用者与调用链

file-path-chip/message 等路径消费者；被 `file-utils.test.ts`（23 个 `test(`）覆盖。出向 `@profer/shared`（MAX_ATTACHMENT_SIZE）。

## 5. 数据 I/O、读写与副作用

fileToBase64 读 File 对象；其余纯函数。

## 6. 分支、失败、取消与恢复

超限 reject；FileReader.onerror→reject；空路径→''/原串兜底。

## 7. 权限与权威状态

- **统一收敛契约**（R1/R2/R4/R5）：全 renderer 层路径处理唯一实现。
- `resolveRelativeToAbsolute` 与主进程 resolveTargetPath 候选 base 语义一致（`:56`）；无匹配保持相对由主进程兜底（`:58-59`）。

## 8. 修改影响面

改函数影响全层路径解析；file-path-chip.test 联动锁定。

## 9. 测试证据

`file-utils.test.ts`（同批，23 个 `test(`）：5 组 describe（basename/绝对路径/面包屑/相对解析/父目录）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件七函数/收敛契约 | 已证实 | 108 行全读 |
| 行为锁定 | 已证实 | 测试 23 用例 |
| fileToBase64 超限分支未测 | 已证实 | 测试未覆盖（照实） |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9（6/7 函数）。
