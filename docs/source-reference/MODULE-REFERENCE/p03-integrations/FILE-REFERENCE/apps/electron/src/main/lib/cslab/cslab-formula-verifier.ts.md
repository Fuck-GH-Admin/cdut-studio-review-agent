---
path: apps/electron/src/main/lib/cslab/cslab-formula-verifier.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b25060312f206bc7bef1d1413b19b63e0929767
sha256: 73eded5039631257d3063874b5b7e29ac821a540e8401cf2d68d028f49cb7d03
lines: 149
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formula-verifier.ts

## 1. 结论与边界

公式 **SymPy 验算与可选 OCR 的 TS 包装层**（`apps/electron/src/main/lib/cslab/cslab-formula-verifier.ts:1-6`）：评审加固 11.5——**verify 与 ocr 完全隔离**；OCR 失败只返回 `ok:false`，**不影响用户手工输入 LaTeX 的验算链路**。

边界：dataURL 仅 PNG/JPEG（24MB 上限，`:20`）；验算超时 120s / OCR 180s（首次载模型宽裕）；Python 侧逻辑在 `cslab-formula-verifier.py`（批外）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `verifyFormula` | function | 47-100 | async `(input, runner?) => CsLabFormulaVerifyResult` | SymPy 等式验算 |
| `ocrFormula` | function | 108-149 | async `(labId, imageDataUrl, runner?) => CsLabFormulaOcrResult` | pix2text 公式识别 |

内部：`MAX_IMAGE_BYTES=24MB`（`:20`）、`parseDataUrl`（`:22-32`，格式/空/超限三抛错）、`RawVerifyPayload/RawOcrPayload`（`:34-50,102-107`）、`toStringArray`（`:52-54`）。

## 3. 内部逻辑与关键流程

- `verifyFormula`（`:47-100`）：`assertLabId` 守卫；LHS/RHS 空 → `{ok:false,'请提供等式左右两侧的 LaTeX'}`；`runPython('--mode verify', …)`（symbols 维度 JSON 传参）；stdout JSON 解析为结构化结果（equivalent/residual/dimensions/singularities/limitNotes/preprocess.appliedFixes/elapsedMs 逐字段防御性提取）；**任何异常 catch 后返回 ok:false**（不抛）。
- `ocrFormula`（`:108-149`）：`parseDataUrl`→临时目录（`cslab-formula-` 前缀）写图→`--mode ocr`→latex/engine（缺省 pix2text）；**finally `fs.rm` 清理临时目录**（失败吞掉）；异常同样返回 ok:false。

## 4. 调用者与调用链

出向：`node:fs/os/path/crypto`、`@profer/shared`（3 类型）、`./cslab-paths`（assertLabId）、`./cslab-python-runtime`（defaultCsLabPythonRunner/CsLabPythonRunner）（`:8-19`）。入向（rg 全冻结树）：`cslab-router.ts:151`（ocrFormula/verifyFormula，**产品调用**）、`cslab-cv-cas-wrappers.test.ts:13`、`cslab/index.ts:32` 转发。

## 5. 数据 I/O、读写与副作用

临时文件（mkdtemp+writeFile+finally rm）；Python 子进程经 runner（批外执行面）；无网络。

## 6. 分支、失败、取消与恢复

**全链 fail-safe**：verify/ocr 异常均返回 `ok:false`+message（绝不抛）；临时目录 finally 清理；无 AbortSignal（超时由 runner 界定）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；「verify 与 ocr 完全隔离」加固声明（`:3-5`）是架构权威口径。

## 8. 修改影响面

- 参数/超时改动影响公式验算链路（router）。
- 临时文件清理是安全/卫生面。
- 测试：cslab-cv-cas-wrappers.test（批外）。

## 9. 测试证据

无同名测试；间接 `cslab-cv-cas-wrappers.test.ts`（批外）。**NOT_RUN**（Python 链不执行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| verify/ocr 隔离红线 | 已证实 | `:3-5` |
| 全链 fail-safe（不抛） | 已证实 | `:88-99,137-148` |
| 临时目录 finally 清理 | 已证实 | `:146-148` |
| 24MB/PNG-JPEG 限定 | 已证实 | `:22-31` |
| Python 侧验算正确性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 47-149 | covered |
| 验算/OCR 链 | §3 | 47-149 | covered |
| 测试锚 | §9 | — | unknown（仅批外间接） |
