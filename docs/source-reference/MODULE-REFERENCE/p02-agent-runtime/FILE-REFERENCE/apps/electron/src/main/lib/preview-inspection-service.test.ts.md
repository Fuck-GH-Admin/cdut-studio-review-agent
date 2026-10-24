---
path: apps/electron/src/main/lib/preview-inspection-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3697a5bc1fd3c0a8f85f1e6ad5a4ae2b547230d7
sha256: c39a42f75885cb1918db78c3a6670ffdccb8411322d01662fff9b86030813c6f
lines: 126
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/preview-inspection-service.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

`inspectPreview`：相对路径按 agentCwd 解析+内容默认；显式授权根放行且**结果不含绝对路径**；越界/软链逃逸拒；Markdown 视觉默认+renderer 收到净化数据；visual-only 补 source text、空图 retryable；页码越界映射稳定错误；revision 变化报告；page scope 校验；检查期间文件变化返回 `file_changed_during_inspection`。

## 2. 用例清单

共 9 个 `test(`（`apps/electron/src/main/lib/preview-inspection-service.test.ts:29-113`，单一 `describe`）。夹具 `fixture()`（`:17-26`，真实临时目录+code.ts/note.md/外部 secret.txt）；依赖注入 `render`/`readText`。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 相对路径+内容默认（`:29`） | `file.name==='code.ts'`、`kind==='text'`、content 含 `'const value'`、`visual` `toBeUndefined()` |
| 2 | 显式根放行+无绝对路径（`:41`） | `file.name==='secret.txt'`；`JSON.stringify(result)` `not.toContain(outside)` |
| 3 | 越界/软链逃逸拒（`:49`） | 两者 `error.code==='unauthorized_path'` |
| 4 | Markdown 视觉默认+净化入参（`:59`） | content 含 `'Hello'`；images mediaType `'image/png'`；renderer 调用 1 次且 `toMatchObject({fileName:'note.md',scope:'page',page:2,text:'# Preview…Hello'})` |
| 5 | visual-only 补 text+空图 retryable（`:78`） | `visualText` 含 `'Hello'`；`{code:'renderer_failed',retryable:true}` |
| 6 | 页码越界映射（`:88`） | renderer 抛 `{code:'page_out_of_range'}` → 稳定 `page_out_of_range` |
| 7 | revision 变化报告（`:96`） | 改写后 `changedSincePreviousRevision===true` |
| 8 | page scope 校验（`:105`） | 缺 page/overview+page 均 `invalid_page` |
| 9 | 检查期间变化（`:113`） | `readText` 注入改写 → `file_changed_during_inspection` + `retryable:true` |

## 3. 真实断言

逐条见上表（`:32-125`）。mock 边界：`render`/`readText` 注入（`:62-66,81-82,90-91,115-120`）；文件系统/授权/hash 为真实实现。

## 4. 未覆盖与脆弱点

未覆盖：`renderAuthorizedPreview`（渲染边界）、`readStructuredContent` 的 pdf/docx/office 转换、超限（file_too_large/render_budget_exceeded）分支。用例 9 依赖注入时序。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个用例 | 已证实 | `grep test(` |
| 授权/逃逸拒绝 | 已证实 | `:49-57` |
| 结果无绝对路径 | 已证实 | `:46` |
| retryable 语义（空图/变化） | 已证实 | `:85,124` |
| 真实 renderer | 未知 | 注入 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 解析/默认 | 1 | 29-39 | covered |
| 授权边界 | 2,3 | 41-57 | covered |
| 渲染数据流 | 4,5 | 59-86 | covered |
| 错误映射 | 6,8 | 88-111 | covered |
| revision/变化 | 7,9 | 96-125 | covered |
| 转换/超限 | 无 | — | unknown |
