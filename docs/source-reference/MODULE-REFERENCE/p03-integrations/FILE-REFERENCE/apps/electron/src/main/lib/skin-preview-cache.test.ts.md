---
path: apps/electron/src/main/lib/skin-preview-cache.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7d6b43ededfbd431ae799ff11d50c930a9420538
sha256: e78e284074989abb34befc5ca54409e9c10b9b5b3687dc35f6cd9292b39e4c20
lines: 61
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/skin-preview-cache.test.ts

## 1. 测试目标

直接测试 `skin-service.ts` 的 `getSkinPreview` **缓存按文件签名失效**（1 个 describe `:36`）：回归"旧实现永久缓存 null"历史缺陷（`:45` 注释）。2 个 `test(`。electron 最小 mock（`:7-10`）+ PROFER_CONFIG_DIR 临时隔离（`:12-14`）。

## 2. 用例清单

| # | 行 | Given/When/Then | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:37-47` | 无预览查询→null（被负缓存）→补 `preview.png`（PNG 魔数 4 字节）→再查 | `toBeNull()`；`toStartWith('data:image/png;base64,')`（**无需重启即可读到**） |
| 2 | `:49-60` | 写 4 字节 preview.png→first；同名覆盖 8 字节→second | first/second 均 `toStartWith('data:image/png;base64,')`；`second not.toBe(first)`（替换被感知） |

## 3. 真实断言

`toBeNull`/`toStartWith`/`not.toBe`。真实 fs（mkdtempSync 临时目录）；无 mock 业务对象。

## 4. 未覆盖

- 扩展优先级（.webp/.svg/.jpg）、MIME 兜底、LRU 32 淘汰、目录不存在、读失败路径。
- **签名局限**："同尺寸同 mtime 替换不失效"无测试（照实）。
- 跨用例共享模块缓存（用例 2 first 可能命中用例 1 缓存）——断言仍成立但值得记录。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个 `test(`、断言如 §2 | 已证实 | 文件全读（61 行） |
| 历史缺陷回归锁定（空缓存不永久） | 已证实 | `:39`/`:45` 注释+断言 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 负缓存不永久 | §2 用例 1 | `:37-47` | covered |
| 签名失效感知替换 | §2 用例 2 | `:49-60` | covered |
| §4 边缘 | — | — | unknown |
