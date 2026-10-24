---
path: apps/electron/src/main/lib/cslab/cslab-python.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e5fa5a08d38134ff8efc2932a989d8b409933578
sha256: 73ed43b987d21f9901dc6ee0855d17c72433a0fd392eef49374c95fce9fc92cb
lines: 129
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-python.ts

## 1. 结论与边界

CSLab 可选 Python 增强通道（文件头 `apps/electron/src/main/lib/cslab/cslab-python.ts:1-9`）。**红线：Python 永远不是主路径**——所有核心能力均有 TS 实现；这里只在检测到 python/uv 时处理 MAT v7.3、BioLogic .mpr 等纯 TS 难以覆盖的变体。任何失败都必须安静降级，不阻断摄取。

## 2. 导出与关键符号

`export` 逐条核对：3 个函数 = 3 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getPythonCapability` | 函数（导出） | 109-112 | `()=>Promise<CsLabPythonCapability>` | 探测结果缓存 |
| `__resetPythonProbeForTest` | 函数（导出） | 114-116 | `()=>void` | 测试重置缓存 |
| `tryParseWithPython` | 函数（导出） | 131-161 | `(filePath,format:'mat-v73'\|'biologic-mpr')=>Promise<ParsedDataset\|null>` | 失败返回 null |
| `PythonProbe`/`PythonDatasetPayload` | 内部接口 | 50-54,118-126 | 探测/载荷形状 |
| `resolveExtractorScript`/`commandWorks`/`probePython`/`cachedProbe` | 内部 | 56-107 | 脚本查找（4 候选路径）/命令探测/探测逻辑/单例缓存 |

## 3. 内部逻辑与关键流程

### 3.1 探测（`probePython`，`:45-75`）

`resolveExtractorScript`（`:26-34`）：4 候选路径查找 `cslab-instrument-extractor.py`（resourcesPath/`__dirname/../resources/`/`../../resources/`/cwd）。

候选命令：win32=`['python','py','python3']`，其它=`['python3','python']`（`:49`）；逐个 `commandWorks`（`execFileAsync` 2.5s 超时，`:36-43`）；命中后探测 `uv --version`；返回 `capability:{available:!!scriptPath,pythonPath,uvPath,note}`（note 描述可处理 MAT v7.3/BioLogic .mpr 或缺脚本不可用，`:91-96`）。全失败 → `{available:false,note:'未检测到 Python；MAT v7.3 / BioLogic .mpr 将仅登记元数据（不生成伪造数据）'}`（`:69-74`）。

### 3.2 解析（`tryParseWithPython`，`:99-129`）

不可用/缺 command/script → `null`（`:105`）。`execFileAsync(pythonCommand,[scriptPath,'--input',filePath,'--format',format],{timeout:120s,maxBuffer:64MB})`（`:108-112`）；`JSON.parse(stdout)` → 校验 `payload.ok && x/series 数组` 否则 `null`（`:114`）；`buildDataset({format,xLabel,xUnit,seriesLabels,x,series,metadata})`（`:116-124`）。异常 → `console.warn` 降级 + `null`（`:125-128`）。

## 4. 调用者与调用链

入向：CSLab 摄取/解析管线（MAT v7.3/BioLogic .mpr 分支）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`node:child_process/fs/path/util`、`@profer/shared`（`CsLabPythonCapability`）、`./cslab-formats/types`（`buildDataset`，批次外文件）。

## 5. 数据 I/O、读写与副作用

- 子进程：python 脚本执行（120s 超时/64MB buffer）。
- 读：`existsSync` 脚本路径。
- 副作用：`console.warn`；缓存探测结果（模块级 `cachedProbe`）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 无 Python/脚本 | `available:false`/`null` | 101-106,137 |
| 载荷非法 | `null` | 146 |
| 执行异常 | warn + `null`（不阻断） | 157-160 |
| 超时/超 buffer | 同上 | 140-144 |

恢复：TS 主路径继续处理（降级语义）。

## 7. 权限与权威状态

Python 为可选增强，非主路径（红线 `:4-8`）；失败不生成伪造数据（`:72`）。

## 8. 修改影响面

改探测/降级影响 MAT v7.3/BioLogic 摄取；改脚本协议影响 Python 脚本契约。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Python 非主路径红线 | 已证实 | `:4-8` |
| 安静降级 | 已证实 | `:125-128` |
| 探测缓存 | 已证实 | `:24,78-79` |
| 真实 Python 脚本 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 探测族 | §3.1 | 56-112 | covered |
| 解析 | §3.2 | 131-161 | covered |
| 测试/真实脚本 | §9,§10 | — | unknown |
