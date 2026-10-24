---
path: apps/electron/src/renderer/components/content-review/review-error-text.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d8173000e07bb7c34eb9118ce44f7e59bafa16b
sha256: e449f1db34f3e9df542c06ce759b18cf83f843dbe1cd6188637f499a6b16df21
lines: 46
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-error-text.test.ts

## 1. 测试目标

验证 `humanizeReviewError` 的四类展示行为：已知错误码→可执行人话、Electron IPC 外壳剥离、`LOCAL_D4_TEMPLATE_ALREADY_BOUND` 保留 Main 原因、未识别错误原样透出（`apps/electron/src/renderer/components/content-review/review-error-text.test.ts:1-2`、`:4`）。

被测文件：`apps/electron/src/renderer/components/content-review/review-error-text.ts`（55 行，唯一导出 `humanizeReviewError`）。测试用 `bun:test` 的 `describe/expect/test`（`:1`），直接相对导入 `./review-error-text`（`:2`）。

**夹具与副作用**：无临时文件、无环境变量、无 mock、无网络；所有输入是内联字符串或 `new Error(...)`。被测函数是纯函数，测试之间无共享可变状态，因此**用例顺序不影响结果**。文件不写盘、不读盘。

## 2. 用例清单

共 1 个 `describe`（`:4`）+ **8** 个 `test`（与 `grep -c "^  test("` 一致）。

| # | 行 | 用例名 | 设置（输入） | 动作 | 真实断言 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `:5-7` | 身份不符给出可执行的切换指引 | `new Error('T05_ACTOR_NOT_ASSIGNED_TO_STAGE')` | `humanizeReviewError(...)` | `toContain('切换')` | 无 |
| 2 | `:9-11` | 缺少运行结果时提示先做检查 | 字符串 `'没有与当前原件一致的有效审核运行'` | 同上 | `toContain('重新检查')` | 无 |
| 3 | `:13-15` | 缺材料给出上传指引 | `new Error('缺少必需材料：实验计划（需 1，现有 0）')` | 同上 | `toContain('上传')` | 无 |
| 4 | `:17-19` | 未识别的错误原样透出，不掩盖真实原因 | `new Error('某个未知错误 XYZ')` | 同上 | `toBe('某个未知错误 XYZ')` | 无 |
| 5 | `:21-28` | 去掉 Electron IPC 外壳与内部错误码，保留 Main 写好的原因 | 拼接字符串：`"Error invoking remote method 'review-v3:local-d4-attach-plan': Error: " + 'LOCAL_D4_TEMPLATE_ALREADY_BOUND: 当前案卷已绑定「综合测评模板」，不能再用这套审核方案覆盖。请新建一个未绑定模板的案卷后再试。'`，包成 `Error` | 同上 | ① `toContain('当前案卷已绑定「综合测评模板」')` ② `not.toContain('Error invoking remote method')` ③ `not.toContain('LOCAL_D4_TEMPLATE_ALREADY_BOUND')` | 无 |
| 6 | `:30-35` | 裸技术预审错误码翻译成用户能懂的结论 | 两个输入：`'AGENT_DECISION_DISABLED: D2 模板失去受控候选资格'` 与裸 `'AGENT_DECISION_DISABLED'` | 各调一次 | 前者 `toContain('只能用于尚未绑定模板的新案卷')`；后者 `toContain('不能代替学校正式审批')` | 无 |
| 7 | `:37-40` | 其他内部错误码不再直接展示给用户 | `'LOCAL_D4_EXISTING_ITEMS: 请为该任务新建草稿案卷'` 与 `'OUT_OF_TOOL_BUDGET: 超出预算'` | 各调一次 | 前者 `toContain('新建一个草稿案卷')`；后者 `toBe('超出预算')` | 无 |
| 8 | `:42-45` | 非 Error 输入也能安全处理 | `undefined` 与 `42` | 各调一次 | `humanizeReviewError(undefined)` `toBe('')`；`humanizeReviewError(42)` `toBe('42')` | 无 |

## 3. 真实断言

逐条引用 `expect` 行：

- `:6` `expect(humanizeReviewError(new Error('T05_ACTOR_NOT_ASSIGNED_TO_STAGE'))).toContain('切换')`
- `:10` `expect(humanizeReviewError('没有与当前原件一致的有效审核运行')).toContain('重新检查')`
- `:14` `expect(humanizeReviewError(new Error('缺少必需材料：实验计划（需 1，现有 0）'))).toContain('上传')`
- `:18` `expect(humanizeReviewError(new Error('某个未知错误 XYZ'))).toBe('某个未知错误 XYZ')`
- `:25` `expect(text).toContain('当前案卷已绑定「综合测评模板」')`
- `:26` `expect(text).not.toContain('Error invoking remote method')`
- `:27` `expect(text).not.toContain('LOCAL_D4_TEMPLATE_ALREADY_BOUND')`
- `:31-32` `expect(humanizeReviewError(new Error('AGENT_DECISION_DISABLED: D2 模板失去受控候选资格'))).toContain('只能用于尚未绑定模板的新案卷')`
- `:33-34` `expect(humanizeReviewError(new Error('AGENT_DECISION_DISABLED'))).toContain('不能代替学校正式审批')`
- `:38` `expect(humanizeReviewError(new Error('LOCAL_D4_EXISTING_ITEMS: 请为该任务新建草稿案卷'))).toContain('新建一个草稿案卷')`
- `:39` `expect(humanizeReviewError(new Error('OUT_OF_TOOL_BUDGET: 超出预算'))).toBe('超出预算')`
- `:43` `expect(humanizeReviewError(undefined)).toBe('')`
- `:44` `expect(humanizeReviewError(42)).toBe('42')`

## 4. 未覆盖与脆弱点

**未覆盖的源码分支（对照 `review-error-text.ts`）**

| 源码行 | 分支 | 是否有断言 |
| --- | --- | --- |
| `:17` | `T05_CURRENT_REAL_RUN_REQUIRED` | 无 |
| `:19` | `T05_REQUIRED_CHECKS_NOT_RESOLVED` | 无 |
| `:20` | `T05_UNRESOLVED_SUPPLEMENTS` | 无 |
| `:21` | `T05_DECISION_REASON_REQUIRED` | 无 |
| `:24` | `D2 模板失去受控候选资格` 规则本身（仅通过 `AGENT_DECISION_DISABLED:` 前缀间接命中） | 部分 |
| `:26-31` | `LOCAL_D4_CASE_AND_SCENARIO_REQUIRED` 等 6 条 | 仅 `EXISTING_ITEMS` 一条 |
| `:32` | `缺少必交材料`（同规则另一写法） | 无（只测「缺少必需材料」） |
| `:33` | 「材料槽」 | 无 |
| `:34` | `T07_STATE_NOT_INITIALIZED` | 无 |
| `:35` | `REVISION_CONFLICT`/`VERSION_CONFLICT` | 无 |
| `:36` | `T04_BINDING_SET_MISMATCH`/`T04_CHECK_BINDING_MISSING` | 无 |
| `:48` | 裸 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 的固定句 | 无（只测带原因） |
| `:54` | 「去码后为空则回原文」 | 无 |
| `:11` | `IPC_WRAPPER` 的 `/i` 大小写不敏感 | 无（只测标准写法） |

**脆弱点**

1. **弱断言**：用例 1/2/3 只断言单个关键词（`切换`/`重新检查`/`上传`），改写规则文案只要保留关键词仍会通过；无法防止语义漂移。
2. **`toContain` 掩盖多余内容**：用例 5 只排除外壳与错误码，未断言不包含其它内部标记（例如 `review-v3:` 频道名仍可能出现）。
3. **用例 4 依赖「未识别」**：若将来为 `某个未知错误 XYZ` 增加规则，该用例会失败——这是有意的回归保护，但会与文案迭代冲突。
4. **未测顺序敏感性**：`RULES` 是先命中先返回；没有用例证明「带原因的 `AGENT_DECISION_DISABLED` 不会被裸码规则截胡」以外的顺序约束。
5. **无快照/无表格驱动**：19 条规则靠手写用例，新增规则不会被自动覆盖。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个 describe、8 个 test，全部为同步纯函数调用 | 已证实 | `:4-45` |
| 测试无 mock/临时文件/环境变量 | 已证实 | `:1-45` 无 `mock`/`fs`/`process.env` |
| 用例 6 同时覆盖「带原因」与「裸码」两条路径 | 已证实 | `:31-34` |
| 用例 8 覆盖 `undefined` 与数字输入 | 已证实 | `:43-44` |
| 断言足以防止 19 条规则整体退化 | 否（推断） | 仅 6 条规则被直接触达（1/3/7/8/12/15 号） |
| 本测试是否在 CI/本地实际执行 | 未知 | 未读 `package.json`/CI 配置；本轮 NOT_RUN |

## 6. 覆盖表

| 用例 | 覆盖源码符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | `RULES[0]` `T05_ACTOR_NOT_ASSIGNED_TO_STAGE` | 3 | `:16` | covered |
| 2 | `RULES[2]` 无有效运行 | 3 | `:18` | covered |
| 3 | `RULES[14]` 缺少必需材料 | 3 | `:32` | covered |
| 4 | 兜底 `:54` | 3 | `:54` | covered |
| 5 | `IPC_WRAPPER` + `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 特判 | 3 | `:11`、`:46-50` | covered |
| 6 | `RULES[6]` 裸码 + `RULES[7]` 带原因 | 3 | `:23-25` | covered |
| 7 | `RULES[11]` + 兜底去码 | 3 | `:29`、`:54` | covered |
| 8 | 非 Error 入参与空串短路 | 3 | `:41`、`:44` | covered |
| 其余 13 条规则 | — | 4 | `:17`、`:19-21`、`:26-31`、`:33-36` | unknown |
| 运行时执行 | — | — | — | NOT_RUN |
