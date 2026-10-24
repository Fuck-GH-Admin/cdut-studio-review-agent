---
path: apps/electron/src/main/lib/security/executable-open-guard.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2ecdd94bb0cc234f659c3cded07339bbc51adc17
sha256: 20fc21c6671ab80523a1f11a4a0f4f94714f5a063764123cdaf6ed8bd93b62d9
lines: 30
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/security/executable-open-guard.test.ts

## 1. 测试目标

`executable-open-guard`（同批深读）的 `shouldConfirmExecutableOpen` 四短路判定（CVE-2026-96951 确认防线）：win32+可执行后缀+未忽略才弹、非 Windows 直通、BUN_TEST 无头拒止、普通文档不弹。框架 `bun:test`；mock 边界=`dismissedGetter` 闭包注入（纯函数，无 fs/无 dialog）。

## 2. 用例清单

用例计数：`test(` **5**（`:6,12,16,22,26`），`it(` 0——与源码计数一致。单一 describe（`:5`）。

| # | 用例 | 动作 | 依赖顺序 |
| --- | --- | --- | --- |
| 1 | win32+可执行后缀+未忽略→需弹窗（`:6-10`） | `setup.exe`/`run.bat`/`payload.ps1` 三例 `shouldConfirmExecutableOpen(..., 'win32', false, ()=>false/undefined)` | 独立 |
| 2 | 已勾选「不再提醒」→直接放行（`:12-14`） | `()=>true` | 独立 |
| 3 | 非 Windows→直通（`:16-20`） | darwin/linux 各一 + darwin 下 `.exe` | 独立 |
| 4 | BUN_TEST→无头拒止（`:22-24`） | `underTest=true` | 独立 |
| 5 | 普通文档后缀→不弹（`:26-29`） | `report.pdf`/`notes.txt` | 独立 |

## 3. 真实断言

（逐条引用 expect 行）

1. `expect(shouldConfirmExecutableOpen('C:\\Downloads\\setup.exe','win32',false,()=>false)).toBe(true)`；`run.bat`（`()=>undefined`）`toBe(true)`；`/tmp/payload.ps1` `toBe(true)`（`:7-9`）。
2. `expect(shouldConfirmExecutableOpen('C:\\Downloads\\setup.exe','win32',false,()=>true)).toBe(false)`（`:13`）。
3. `('/tmp/payload.sh','darwin',…)` `toBe(false)`；`(…,'linux',…)` `toBe(false)`；`('C:\\Downloads\\setup.exe','darwin',…)` `toBe(false)`（`:17-19`）。
4. `('C:\\Downloads\\setup.exe','win32',true,()=>false)` `toBe(false)`（`:23`）。
5. `('C:\\work\\report.pdf','win32',false,()=>false)` `toBe(false)`；`notes.txt` `toBe(false)`（`:27-28`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`confirmExecutableFileOpen` 弹窗链（dialog/主窗口绑定/无 parent 兜底）、checkbox 持久化（`updateSettings` 失败留痕）、`isPotentiallyExecutableFile` 后缀集合本体（shared 域外）。
- 脆弱点：后缀判定以 shared 实现为准（测试只用 `.exe/.bat/.ps1/.sh/.pdf/.txt` 样例，不穷举）；`dismissedGetter=()=>undefined` 刻画「设置缺省」分支。
- 纯函数层完整；弹窗层留运行验证（NOT_RUN）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `executable-open-guard.test.ts:7-28` |
| mock 边界=闭包注入（无 fs/dialog） | 已证实 | 全文仅 import 被测函数（`:3`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 弹窗/持久化行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 四短路（win32/后缀/忽略/测试态） | §2/§3 | 6-29 | covered |
| 普通文档分支 | §2/§3 | 26-29 | covered |
| `confirmExecutableFileOpen` | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
