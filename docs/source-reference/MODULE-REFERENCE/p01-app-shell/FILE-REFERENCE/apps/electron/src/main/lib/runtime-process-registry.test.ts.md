---
path: apps/electron/src/main/lib/runtime-process-registry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b262525ff2445ce9e3559032ce140e7355e7c3ac
sha256: 388197852f39d0b7eab52e489d66166d5875c1e6be3c5ad1fca5d9763474c509
lines: 107
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/runtime-process-registry.test.ts

## 1. 测试目标

验证 `runtime-process-registry.ts`（被测模块**不在本批**）两组能力：①长驻服务命令分类/服务 cwd 解析；②`matchRecordAgainstSnapshot` 在共享进程快照上的匹配规则（端口硬证据、命令关键字、启动时间拒 PID 转世、排除 SDK 自身进程）。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 9 个（`describe` 2 个；`it(` 0 个）。夹具 `makeRecord`（`:9-16`）。

**describe「runtime process registry classification」（`:18-44`）：**

| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 只将持续服务命令登记为 owned 候选 | 19-25 | astro dev/npm run dev/docker compose up=true；git status/bun test=false |
| 2 | 优先使用命令显式 cd 的外部项目目录 | 27-32 | `cd "D:/project/astroship-eval" && …` → 该目录 |
| 3 | 识别 Git Bash 的 /盘符/ 项目目录 | 34-39 | `cd /d/profer/Profer-main` → `D:/profer/Profer-main` |
| 4 | 无显式 cd 时保持 Pi 实际 cwd | 41-43 | `npm run dev` → 原 cwd |

**describe「matchRecordAgainstSnapshot」（`:46-106`）：**

| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 5 | 显式端口命中监听者 | 49-57 | portPids 5177→1234，命令行不含项目路径仍匹配 `{pid:1234, startTime, ports:[5177]}` |
| 6 | POSIX 服务脱离 shell 后按监听端口匹配 | 59-75 | 同上（node/vite 形态） |
| 7 | 无显式端口时按 cwd 内命令关键字匹配 | 77-86 | 命中 9001（vite 在 cwd 下），不误配 notepad |
| 8 | 启动时间早于记录太多视为不兼容 | 88-97 | startTime 早 60s → `undefined` |
| 9 | 排除 SDK 自身进程 | 99-106 | claude-agent-sdk 命令行 → `undefined` |

## 3. 真实断言

- 用例 1（`:20-24`）：5 个 `expect(isLongRunningServiceCommand(…)).toBe(true/false)`。
- 用例 2-4（`:28-42`）：`expect(resolveServiceWorkingDirectory(cmd, fallback)).toBe('D:/project/astroship-eval')` 等 3 组。
- 用例 5（`:54-56`）：`expect(matchRecordAgainstSnapshot(record, portPids, processes)).toEqual({pid:1234, startTime:1_750_000_000_500, ports:[5177]})`。
- 用例 6（`:72-74`）：同形 `toEqual`。
- 用例 7（`:84-85`）：`expect(found?.pid).toBe(9001)`（排除 `notepad.exe`）。
- 用例 8（`:96`）：`expect(…).toBeUndefined()`。
- 用例 9（`:105`）：`expect(…).toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`RuntimeProcessRecord` 持久化读写、`runtime:'claude'`、多端口冲突、Windows 真实进程表、matchRecordAgainstSnapshot 的失败路径。
- 脆弱点：用例 3 期望 `/d/…`→`D:/…` 的 Git Bash 约定硬编码（跨平台断言）；快照夹具是手工 Map（`portPids`/`processes`），与真实 process-monitor 快照形状的契约未在本测试校验；时间戳常量 `1_750_000_000_000` 直接内联。
- mock 边界：无 mock API；被测函数纯函数直测，快照为内存 Map 夹具（无真实进程扫描）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例与断言行号 | 已证实 | `:9-106` 逐行读 |
| 端口/关键字/时间/排除四规则被断言 | 已证实 | §3 |
| 无 mock/纯函数+内存夹具 | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |
| 被测模块实现细节 | 未知 | `runtime-process-registry.ts` 不在本批 |

## 6. 覆盖表

| 被测行为 | 用例 | 状态 |
| --- | --- | --- |
| isLongRunningServiceCommand | 1 | covered |
| resolveServiceWorkingDirectory | 2, 3, 4 | covered |
| 端口匹配 | 5, 6 | covered |
| 命令关键字匹配 | 7 | covered |
| startTime 不兼容拒配 | 8 | covered |
| SDK 自身排除 | 9 | covered |
| 持久化/并发 | - | unknown（未覆盖） |
