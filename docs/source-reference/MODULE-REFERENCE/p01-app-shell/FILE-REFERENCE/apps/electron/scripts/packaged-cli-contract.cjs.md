---
path: apps/electron/scripts/packaged-cli-contract.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76aa77e55746b62b04be21b77b37f0f494a868ec
sha256: 82324b1dd3937b1eb166b5bf0f9994fdf49d6d9e171cacd147d8d6b5ee610a3f
lines: 48
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/packaged-cli-contract.cjs

## 1. 结论与边界

验证 Windows unpacked 包内随包 CLI 的**文件名与内容契约**：`bin` 目录必须且只能包含一个非空普通文件 `profer.exe`，返回其路径（`apps/electron/scripts/packaged-cli-contract.cjs:2` 注释、`:9-32` 实现）。既被 `require` 复用（2 导出），也可 CLI 运行（`:36-48`）。

边界：只查 bin 目录内容形态（存在/唯一/文件/非空），不校验 exe 内容格式、签名、架构；不管 macOS 随包 CLI（无扩展名 `profer`，属 `verify-macos-package.cjs` 一侧）；不读写产物以外的任何路径。

## 2. 导出与关键符号

`module.exports` 2 项（`apps/electron/scripts/packaged-cli-contract.cjs:34`，与源码一致）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WINDOWS_CLI_NAME` | 导出常量 | 7 | `'profer.exe'` | 唯一合法文件名 |
| `verifyPackagedWindowsCli` | 导出函数 | 9-32 | `(binDir: string) => string` | 校验并返回 `cliPath`，违规抛 Error |

内部逻辑全部内联于 `verifyPackagedWindowsCli`，CLI 入口 `require.main === module` 块（`:36-48`）。

## 3. 内部逻辑与关键流程

按短路顺序（`apps/electron/scripts/packaged-cli-contract.cjs:9-32`）：
1. 目录存在性：`fs.existsSync(binDir)` 失败抛 `Windows 随包 CLI 目录不存在: ${binDir}`（`:10-12`）。
2. 唯一性：`fs.readdirSync(binDir, {withFileTypes:true})` 后要求 `entries.length===1 && entries[0].name===WINDOWS_CLI_NAME`，否则抛 `Windows 随包 CLI 目录必须且只能包含 profer.exe，实际为: ${排序后清单或'<空>'}`（`:14-20`）。
3. 普通文件：`entry.isFile()` 失败抛 `Windows 随包 CLI 必须是普通文件: ${cliPath}`（`:22-26`）。
4. 非空：`fs.statSync(cliPath).size <= 0` 抛 `Windows 随包 CLI 不能为空: ${cliPath}`（`:27-29`）。
5. 返回 `cliPath`（`:31`）。

CLI 模式：`binDir = process.argv[2] ? path.resolve(argv[2]) : path.join(appRoot,'out','win-unpacked','resources','bin')`（`:38-40`）；成功打印 `[packaged-cli-contract] ${cliPath} OK`（`:43`）；任何抛错 → `console.error` + `process.exit(1)`（`:44-47`）。

## 4. 调用者与调用链

入向（全冻结树检索 `packaged-cli-contract|verifyPackagedWindowsCli|WINDOWS_CLI_NAME` 命中 2 个消费文件 9 行）：
- `apps/electron/scripts/verify-release-assets.cjs:13` require；`:33-35` 对 `out/win-unpacked/resources/bin` 调 `verifyPackagedWindowsCli`（Windows 发布资产门禁链一环）。
- `apps/electron/scripts/packaging-guards.test.ts:31` require（用例见 §9）。

出向：仅 `node:fs`、`node:path`（`apps/electron/scripts/packaged-cli-contract.cjs:4-5`）；无子进程、无网络。

## 5. 数据 I/O、读写与副作用

只读：`existsSync`/`readdirSync`/`statSync`（`:10,14,28`）针对传入 `binDir`；无写盘、无网络、无缓存。副作用仅 CLI 模式的控制台输出与退出码（`:43-47`）。输入形状：`binDir: string`；输出形状：`cliPath: string`（绝对路径）。

## 6. 分支、失败、取消与恢复

四个失败分支依次短路（见 §3，均抛带具体路径/清单的 Error）；CLI 模式统一 catch 后 `exit(1)`（`:44-47`），库模式向调用方传播（`verify-release-assets.cjs` 未捕获 → 其进程以非 0 结束，属调用方语义）。无取消/恢复；校验无副作用，失败不留残留状态，重跑幂等。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（构建校验脚本，信任边界为运行者本机）。权威语义：`WINDOWS_CLI_NAME = 'profer.exe'`（`:7`）是随包 CLI 命名契约的唯一事实源；目录内容以磁盘实测为准（`readdirSync`/`statSync`）。

## 8. 修改影响面

- 改契约（文件名/唯一性/非空）会连锁影响 `apps/electron/scripts/verify-release-assets.cjs:33-35`（发布门禁）、electron-builder 打包产物的 `bin` 布局、以及 macOS/Windows 双平台 CLI 命名约定（对照 `apps/electron/scripts/verify-macos-package.cjs:33` 的 `bin/profer`）。
- 需同步测试：`apps/electron/scripts/packaging-guards.test.ts:93-121`（3 用例覆盖 4 个失败分支中的 3 类）。

## 9. 测试证据

直接测试 `apps/electron/scripts/packaging-guards.test.ts`（describe `Windows 随包 CLI 契约`，3 用例）：
1. `:94-100`：bin 目录仅含非空 `profer.exe` → `expect(verifyPackagedWindowsCli(binDir)).toBe(cliPath)`。
2. `:102-109`：目录缺失 → `toThrow('目录不存在')`；仅无扩展名 `profer` → `toThrow('必须且只能包含 profer.exe')`。
3. `:111-120`：`profer`+`profer.exe` 并存 → `toThrow('必须且只能包含 profer.exe')`；`profer.exe` 空文件 → `toThrow('不能为空')`。

未覆盖：`entry.isFile()` 失败分支（`profer.exe` 为目录）无断言；CLI 模式 `exit(1)` 路径无测试。`NOT_RUN`：本轮未运行测试（断言为静态阅读所得）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一合法文件名为 `profer.exe`，四分支短路校验 | 已证实 | `apps/electron/scripts/packaged-cli-contract.cjs:7,9-32` |
| CLI 默认目标 `out/win-unpacked/resources/bin`、失败 exit(1) | 已证实 | `apps/electron/scripts/packaged-cli-contract.cjs:38-47` |
| 生产消费者为 verify-release-assets.cjs | 已证实 | `apps/electron/scripts/verify-release-assets.cjs:13,33-35` |
| 3 个测试用例断言如 §9 | 已证实 | `packaging-guards.test.ts:93-121` |
| 非普通文件分支的实际错误文案触发 | 推断 | 代码 `:24-26` 明确，但无测试/运行直证 |
| verify-release-assets-unsigned.cjs 是否绕过本契约 | 已证实（否定） | 全冻结树检索 `verifyPackagedWindowsCli` 9 处命中不含该文件（检索范围：全树除 node_modules/.git） |
| CI 中真实产物上的运行结果 | 未知 | 本轮 NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WINDOWS_CLI_NAME` | §2、§7 | 7 | covered |
| 目录不存在分支 | §3.1、§6 | 10-12 | covered（测试 :104） |
| 唯一性分支 | §3.2、§6 | 14-20 | covered（测试 :108,115） |
| 非普通文件分支 | §3.3、§6 | 22-26 | covered（无测试，§9 已注明） |
| 非空分支 | §3.4、§6 | 27-29 | covered（测试 :119） |
| CLI 入口/默认路径/exit(1) | §3、§6 | 36-48 | covered |
| 调用者 | §4 | — | covered |
