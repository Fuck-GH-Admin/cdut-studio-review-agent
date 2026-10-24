---
path: apps/electron/scripts/verify-build-target.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e2b799357e5e73e5b7411082c8f661efb503ca4
sha256: 436be9b7c9bccd23370df43060e37090afe5315c30068485af47b7caa9f61f7c
lines: 37
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-build-target.cjs

## 1. 结论与边界

**构建目标校验**（37 行）：校验 bundle 中折叠三元字面量确认 oss/commercial 目标未串味。注释锁定构建参数约定（`:15-16`：build:main 用 `--minify-whitespace --minify-identifiers` **不启用 `--minify-syntax`**，否则三元折叠致字面量消失）。

## 2. 导出与关键符号

无导出（CLI）：`<oss|commercial> [bundlePath]`（缺省 `dist/main.cjs`，`:6-7`）；正则 `ossLiteral=/false\s*\?\s*"oss"\s*:\s*"oss"/`、`commercialLiteral=/false\s*\?\s*"oss"\s*:\s*"commercial"/`（`:17-18`）。

## 3. 内部逻辑与关键流程

（`:20-37`）：参数校验 exit 2（`:9-12`）；目标匹配判定（oss 需有 oss 字面量且无 commercial，反之亦然，`:23-35`）；mismatch exit 1；通过打印。

## 4. 调用者与调用链

- 入向：build:main 后置校验（npm script，域外）。
- 出向：node fs。

## 5. 数据 I/O、读写与副作用

只读 bundle；无写。

## 6. 分支、失败、取消与恢复

usage exit 2/mismatch exit 1/通过 exit 0。

## 7. 权限与权威状态

构建目标权威=字面量探针（依赖 esbuild 不折叠三元的约定，`:15-16`）。

## 8. 修改影响面

oss/commercial 发布防串味门禁；构建参数约定变更（启用 minify-syntax）会使探针失效。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 探针正则/exit 语义/构建约定注释 | 已证实 | `:1-37` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 6-37 | covered |
