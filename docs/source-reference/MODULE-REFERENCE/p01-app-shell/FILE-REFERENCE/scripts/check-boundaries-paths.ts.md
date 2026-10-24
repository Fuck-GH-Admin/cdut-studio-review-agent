---
path: scripts/check-boundaries-paths.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9b7e4eeb5caac61c94463017994aa1131e1d0256
sha256: 0fa96957769f431ef8978e1a7ddf86a0ac3e7c1238d02fcfa1c844a254466581
lines: 36
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/check-boundaries-paths.ts

## 1. 结论与边界

边界检查的路径工具纯函数模块（bun 直跑）：`isPathWithin`（root 内判定，防同名前缀误判）、`workspaceRootOf`（仓库相对路径→workspace 根）、`nativePathOperations` 注入点（使 POSIX/Windows 语义可测，文件头 `scripts/check-boundaries-paths.ts:1-36`）。

边界：不解析 import（check-boundaries.ts）；不含平台检测（调用方传 pathOps）。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 1 常量 + 2 函数 = 4 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PathOperations` | 接口（导出） | 3-7 | `{relative, isAbsolute, join}` | 路径操作注入 |
| `nativePathOperations` | 常量（导出） | 9 | node:path 三函数 | 默认实现 |
| `normalizePathSeparators` | 函数（导出） | 12-14 | `(value) => string` | `\`→`/` |
| `isPathWithin` | 函数（导出） | 17-25 | `(root, target, pathOps=native) => boolean` | root 内判定 |
| `workspaceRootOf` | 函数（导出） | 28-36 | `(root, file, pathOps=native) => string` | workspace 根定位 |

## 3. 内部逻辑与关键流程

1. `normalizePathSeparators`：反斜杠替换（`:13`）。
2. `isPathWithin`（`:17-25`）：`relative(root,target)` 归一化后，非绝对 **且** 非 `..` **且** 非 `../` 前缀 → true（`:24`）——同时防父越界与同名前缀相邻目录（如 `ui` vs `ui-extra`，`relative` 会给出 `../ui-extra`）。
3. `workspaceRootOf`（`:28-36`）：相对路径匹配 `^(packages|apps)/[^/]+`（`:34`）→ `join(root, match)`；不匹配（如 `scripts/`）→ root（`:35`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`scripts/check-boundaries.ts:21`（`isPathWithin`/`workspaceRootOf`，`:101,:141,:145` 调用）；`scripts/check-boundaries.test.ts:6`（直测，`:17-44` 断言）。

出向：`node:path`（`:1`）。无其它依赖。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O/状态/副作用（依据：全文读）。pathOps 可注入使跨平台语义确定（默认 native）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| within true | 非绝对/非 ../ | 24 |
| workspace 匹配 | packages|apps/<pkg> | 34-35 |
| 回退 root | 其它路径 | 35 |

无异常/取消/恢复概念，依据：纯函数。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；路径边界语义=R5 规则的数据基础（check-boundaries）。

## 8. 修改影响面

- `check-boundaries.ts`（R2/R5 判定）与 `check-boundaries.test.ts`（3×3 平台用例直测）。
- `isPathWithin` 语义变化会同时改变边界检查的误报/漏报（同名前缀场景被测试锚定 `:29-34`）。
- 需同步的测试：`check-boundaries.test.ts`（8 定义/14 执行，本批）。

## 9. 测试证据

直接测试：`scripts/check-boundaries.test.ts`（本批，8 个 `test(` 定义，其中 3 个在 POSIX/Win-C/Win-D 三平台循环中各执行=14 次执行；逐条见该手册）。真实断言：workspace 定位（`:17-20`）、`..cache` 合法目录（`:26`）、父越界/同名前缀拒绝（`:30-33`）、跨盘 false（`:39-40`）、同盘忽略大小写（`:44-45`）。

未覆盖：空字符串/相对 root、UNC 路径。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出 + 判定语义 | 已证实 | `:1-36` 逐行读 |
| 同名前缀防误判机制 | 已证实 | `:24` + 测试 `:29-34` |
| 两消费文件 | 已证实 | `check-boundaries.ts:21`；`check-boundaries.test.ts:6` |
| UNC/边缘路径 | 未知 | 未测 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2-3 | 1-36 | covered |
| isPathWithin/workspaceRootOf 语义 | §3 | 17-36 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
