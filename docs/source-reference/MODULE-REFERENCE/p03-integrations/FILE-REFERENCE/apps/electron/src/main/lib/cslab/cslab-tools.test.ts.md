---
path: apps/electron/src/main/lib/cslab/cslab-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6797cc918b0a30599f0c7cce431819a0043ffdf3
sha256: fa7ab07bd9571e37cbe832af0c912c3b94af5bb5b502ecea625c81ab78426d0a
lines: 215
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tools.test.ts

## 1. 测试目标

CSLab 用户 Python 工具注册表（`cslab-tool-registry` 与 `adapters/pi-cslab-tools`，均跨文件）：签名解析/类型映射/启发式解析、清单与执行守卫、Pi 工具装配。

## 2. 用例清单

2 个 describe + **6 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| Python 签名解析（3） | 位置/默认/变长/keyword-only、注解→JSON 类型、启发式函数+docstring+不支持项 | `:35-98` |
| 工具清单与执行守卫（3） | 清单同步读+未知参数/缺失必填拒绝+审计留痕、未绑定不注入、绑定后装配不污染 | `:102-214` |

夹具：真实 `createLab`（`:18-19`）；fakeSdk.defineTool 透传（`:159`）。

## 3. 真实断言

- `:38-46` 参数名序列 `['a','b','args','c']`、required/variadic/annotation 断言；keyword-only 无 variadic。
- `:51-59` 6 注解映射（str→string/int→integer/float→number/bool→boolean/list→array/dict→object）、`Optional[int]` 与 `int | None` 均 `{jsonType:'integer', optional:true}`、undefined→any。
- `:84-97` 启发式：含 capacity_estimate/background/variadic、**不含 `_private`**；docstring→description 含'容量'、参数顺序、returns 'float'；async/变长 → `unsupportedReason` 含 'async'/'变长'。
- `:128-154` 清单同步读 name='calculate'；未知参数 `error` 含'未知参数'、缺失必填含'缺少必填参数'；**失败调用审计留痕**（JSONL ≥2 行、末条 matchObject `{labId, function:'calculate', source:'ipc', ok:false}`、error 文案、elapsedMs number）。
- `:165` 未绑定会话 tools `toEqual([])`。
- `:210-213` 绑定后含 `cslab_calculate`/`cslab_list_lab_tools`/`cslab_run_lab_tool`、**不含 `cslab_async_only`**（unsupported 不装配）。

## 4. 未覆盖与脆弱点

未覆盖：真实 Python 执行（runLabTool 拒绝路径外）、watcher 变更（afterAll 清理暗示存在）。错误文案断言与实现耦合。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §3 | 已证实 | 逐行读 `:1-215` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 签名/类型/启发式解析 | 3 | covered |
| 清单/守卫/审计/Pi 装配 | 3 | covered |
| 真实执行/watcher | — | unknown |
