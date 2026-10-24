---
path: apps/electron/resources/cslab/cslab-formula-verifier.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bf39051da987f779a71dc4628e2003e8c4aa5de3
sha256: d476386cfe819a1dda3dac52b36a3a2404fafc1d1fe90c56269a98aeb799612c
lines: 308
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/cslab/cslab-formula-verifier.py

## 1. 结论与边界

**CSLab 公式验算+可选 OCR**（308 行，`:2-10`）：评审加固 11.5——**verify 只依赖 SymPy 绝不 import pix2text**；ocr 独立分支失败只影响识别按钮。**红线：严禁 `sp.sympify`（底层 eval）**，纯 ASCII 走白名单+受限 global_dict（`:51,133-134`）。

## 2. 导出与关键符号

无导出（CLI）：`--mode {verify,ocr} --lhs --rhs --symbols --image`（`:262-269`）。内部：`preprocess_latex`（`:24`）、`SAFE_FUNCTIONS` 20 个（`:41`）、`parse_ascii_expression`（`:48`）、`parse_latex_to_sympy`（`:109`）、`verify`（`:141`）、`ocr`（`:225`）。

## 3. 内部逻辑与关键流程

- 解析链（`:109-138`）：latex2sympy2→sympy parse_latex→ASCII 安全解析（三级回落）；安全解析五步（`:60-106`）：ln→log、字符白名单、禁 `__`/非数字点（阻断属性穿透 `:73`）、标识符白名单校验、受限 global_dict+隐式乘法。
- `verify`（`:141-222`）：预处理（去 \left/\right、补积分括号）→`simplify(expand(lhs-rhs))==0` 二次 trigsimp/cancel 尝试→量纲校验（dimsys_SI 可选，`:169-190`）→奇点/极限提示（free_symbols 前 8 个，`:194-210`）→engine/residual/preprocess/elapsedMs 输出。
- `ocr`（`:225-259`）：pix2text recognize_formula；缺依赖→提示一键安装。
- 兜底（`:304-308`）：顶层异常也 JSON（防半截 stdout）。

## 4. 调用者与调用链

- 入向：CSLab 公式验算/识别按钮（域外）。
- 出向：sympy/latex2sympy2/pix2text（可选三方）。

## 5. 数据 I/O、读写与副作用

读图像（ocr）；stdout JSON；无写。

## 6. 分支、失败、取消与恢复

三级解析回落/依赖缺失降级/顶层 JSON 兜底；解析失败返回原 latex_error（`:138`）。

## 7. 权限与权威状态

**输入安全权威=白名单+受限 namespace**（红线注释 `:51,133`）；等价判定权威=simplify+trigsimp 两轮。

## 8. 修改影响面

公式验算/OCR 能力面；解析安全边界变更直接关联 eval 注入风险。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 安全解析五步/verify 输出契约/ocr 隔离 | 已证实 | `:1-308` 全文 |
| sympy/latex2sympy2 行为 | 边界 | 三方域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 24-308 | covered |
