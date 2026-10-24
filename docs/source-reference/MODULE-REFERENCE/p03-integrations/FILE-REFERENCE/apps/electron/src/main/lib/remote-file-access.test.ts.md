---
path: apps/electron/src/main/lib/remote-file-access.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 023dc16f0721efb91d710cd07626dcc6a1ff963d
sha256: 2d9eb6fd2202290bd661c6c69406e74e283b800e766fb4fd46cacdcab22d282b
lines: 86
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-file-access.test.ts

## 1. 测试目标

`remote-file-access.ts` 的 `resolveAuthorizedRemoteFilePath`：远程文件预览授权（根内/相对/跨工作区/显式附件/符号链接逃逸）。被测逻辑见同组手册。

## 2. 用例清单

**5 个 `test()`**（describe `resolveAuthorizedRemoteFilePath`）：根内文件放行（`:20-30`）、相对路径仅限服务端派生根（`:32-43`）、他工作区绝对路径拒绝（`:45-58`）、显式附件不授权兄弟文件（`:60-71`）、**根内符号链接逃逸拒绝**（`:73-85`）。真实临时目录+afterEach 清理（`:9-17`）。

## 3. 真实断言

- `:26-29/:39-42` 返回 `realpathSync(file)`（绝对与相对路径各一）。
- `:54-57` 他工作区绝对路径 → `toBeNull()`。
- `:69-70` 显式附件 → realpath；兄弟 → `toBeNull()`。
- `:81-84` workspace 内 symlink 指向根外 → `toBeNull()`。

## 4. 未覆盖与脆弱点

未覆盖：`resolveAuthorizedRemoteChatAttachmentPath`/`isReviewPrivateConfigPath`/denyPath 分支。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 逐行读 `:1-86` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 主解析五面 | 5 | covered |
| 附件/review 私有 | — | unknown |
