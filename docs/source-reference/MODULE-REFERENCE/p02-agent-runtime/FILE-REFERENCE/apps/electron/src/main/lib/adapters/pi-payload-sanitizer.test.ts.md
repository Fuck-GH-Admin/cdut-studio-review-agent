---
path: apps/electron/src/main/lib/adapters/pi-payload-sanitizer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b9e45d3817fbb054fd10d7942a7f3d66493b77aa
sha256: 6254aa90b5ea7ee91c7c65711958a6731fb56dad1256673dd63ec0458747e7fa
lines: 116
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-payload-sanitizer.test.ts

## 1. 测试目标

`sanitizeContextForInference` 的请求前上下文消毒——被测符号来自 **`./pi-agent-adapter`**（`apps/electron/src/main/lib/adapters/pi-payload-sanitizer.test.ts:2`，不在本批；跨文件归属，此处仅登记）。无 mock（纯载荷对象）。

## 2. 用例清单

1 describe、6 it（QA N-NB54-07 计数校正；`it` 而非 `test`）：

1. `:14` 区附近：deepseek-v4 摘要模型加白名单走文本降级（行段 `:14-`）。
2. 中段：google/openAICompatible 情况下历史思考块剔除、当前轮保留 thought:true（`:96-101` 断言）。
3. `:104-115`：折叠历史超长工具输出——保留折叠提示与首段内容。

（具体 test 起始行以文件为准：`:14/:44/:70/:87/:104` 分组。）

## 3. 真实断言（锚定行）

- `:100-101` `result.contents[1].parts` 为 `[{text:'答案 1'}]`；`contents[3].parts` 保留 `{text:'当前思考', thought:true}`+答案。
- `:113-114` `messages[1].content` 以 `HEAD` 开头且含 `[...该历史查询结果已折叠`。
- 其余断言：空图像块处理、白名单降级（详见各 it 块）。

## 4. 未覆盖与脆弱点

未覆盖：`sanitizeContextForInference` 的 provider 全矩阵、折叠阈值参数化。被测符号在 pi-agent-adapter.ts（非本批）——其自身手册在对应批次。无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 it、锚定断言行 | 已证实 | `:96-115` 逐行 |
| 被测符号=pi-agent-adapter（跨文件归属） | 已证实 | `:2` import |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 思考块/折叠/降级 | §3 | covered |
| provider 全矩阵 | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |
