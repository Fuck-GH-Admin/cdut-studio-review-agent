---
path: apps/electron/scripts/build-cli-runtime.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 24c6e4a5aef546bfdf48abcf4befdf6a8a14b638
sha256: a9d5d0ac5c5c1eebbfb3791a87fc2e0aaf20c187c2a0dde9e8b184d5055086ae
lines: 77
kind: test
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/build-cli-runtime.test.ts

## 1. 测试目标

针对 `apps/electron/scripts/build-cli-runtime.ts` 的 5 个导出纯函数做 bun:test 单元测试（77 行）：验证 Bun compile 调用参数构造（Windows 临时 Bun 副本语义与非 Windows 保持语义）、临时 Bun 清理不掩盖主构建结果、跨宿主 CLI 残留清理只删两种已知二进制、日志文件名格式化不把数组下标当扩展名（`apps/electron/scripts/build-cli-runtime.test.ts:1-11`）。被测对象全部是纯函数/注入 removeFile 的函数，测试不触网、仅一个用例写临时目录。

## 2. 用例清单

机械计数：本文件 `test(` 5 处、`it(` 0 处（grep `^\s*(it|test)\(` 逐行计数），`describe(` 1 处（`apps/electron/scripts/build-cli-runtime.test.ts:13`「Windows CLI 编译调用」）。

1. `apps/electron/scripts/build-cli-runtime.test.ts:14` — Given Windows 临时 Bun 副本 When 构造调用 Then 复用当前 Bun 并传入 compile-executable-path。
2. `apps/electron/scripts/build-cli-runtime.test.ts:34` — Given non-Windows 调用 When 未传临时副本 Then 保持既有 compile 参数语义。
3. `apps/electron/scripts/build-cli-runtime.test.ts:45` — Given 临时副本已不存在 When 清理 Then 不掩盖主构建结果。
4. `apps/electron/scripts/build-cli-runtime.test.ts:52` — Given 曾在不同宿主构建 CLI When 新构建开始 Then 删除两种已知二进制残留。
5. `apps/electron/scripts/build-cli-runtime.test.ts:71` — Given 清理了多个平台 CLI When 生成日志 Then 只展示文件名且不把数组下标当作扩展名。

## 3. 真实断言

- 用例 1（`:23-31`）：`expect(temporaryBunPath).toBe(join('C:\\Temp', 'bun-temp-123-456.exe'))`；`expect(invocation.command).toBe('C:\\Users\\yuan\\bin\\bun.exe')`；`expect(invocation.args).toEqual(['build', '--compile', '--compile-executable-path', temporaryBunPath, '--outfile', '<outFile>', '<cliEntry>'])`（精确顺序数组）。
- 用例 2（`:35-42`）：`expect(createBuildCliInvocation({...})).toEqual({ command: '/usr/local/bin/bun', args: ['build', '--compile', '--outfile', '/tmp/profer', '/workspace/apps/cli/src/index.ts'] })`。
- 用例 3（`:46-49`）：`expect(tryRemoveTemporaryBun(() => { throw new Error('ENOENT') }, 'C:\\Temp\\bun-temp.exe')).toBe(false)`；`expect(tryRemoveTemporaryBun(() => {}, 'C:\\Temp\\bun-temp.exe')).toBe(true)`。
- 用例 4（`:62-65`）：`expect(cleanCliBuildArtifacts(outDir)).toEqual([unixCli, windowsCli])`；`expect(existsSync(unixCli)).toBe(false)`；`expect(existsSync(windowsCli)).toBe(false)`；`expect(existsSync(unrelatedFile)).toBe(true)`（真写临时目录后断言删除面精确）。
- 用例 5（`:72-75`）：`expect(formatCliBuildArtifactNames([...])).toBe('profer, profer.exe')`（basename 展示，非路径、非下标）。

## 4. 未覆盖与脆弱点

- 未覆盖：`createBuildCliInvocation` 同时传 compileExecutablePath 的非 Windows 组合；`cleanCliBuildArtifacts` 对目录/符号链接等非文件残留；`formatCliBuildArtifactNames` 空数组；`createTemporaryBunPath` 的 now/pid 碰撞语义。
- 脆弱点：用例 1 的 Windows 路径串依赖 `join` 在运行平台的分隔符语义（在 POSIX 上 `join('C:\\Temp', …)` 结果与 Windows 不同，但断言同样用 `join` 构造期望值，自洽）；用例 4 依赖 `mkdtempSync(tmpdir())` 可写，CI 只读 tmp 会失败。
- 测试未断言 spawnSync 层（build-cli.ts 编排）——属域外。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例的断言内容与目标函数一一对应 | 已证实 | `apps/electron/scripts/build-cli-runtime.test.ts:1-77` 全文 |
| 用例数=5（`test(` 机械计数 5 / `it(` 0） | 已证实 | grep `^\s*(it|test)\(` |
| 测试实际运行通过 | 未知 | NOT_RUN（本轮未运行任何脚本/测试，纯静态阅读） |
| Windows 路径期望在 win32 runner 上的行为 | 推断 | 断言用 join 构造，平台自洽，未实跑 |

## 6. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| createTemporaryBunPath | §2/§3 | 15, 23 | covered |
| createBuildCliInvocation（含/不含 compileExecutablePath） | §2/§3 | 16-42 | covered |
| tryRemoveTemporaryBun（成功/失败） | §2/§3 | 46-49 | covered |
| cleanCliBuildArtifacts（删除精确性） | §2/§3 | 52-68 | covered |
| formatCliBuildArtifactNames | §2/§3 | 71-75 | covered |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
