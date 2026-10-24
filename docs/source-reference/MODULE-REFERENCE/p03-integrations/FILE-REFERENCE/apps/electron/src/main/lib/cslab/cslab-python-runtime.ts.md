---
path: apps/electron/src/main/lib/cslab/cslab-python-runtime.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d168b809f2ea10200d0c1515d885438b10397972
sha256: 31f1533551dbe9c1c5c919ae31360fe05b5ea72aa722a892cbc669623ba335c9
lines: 409
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-python-runtime.ts

## 1. 结论与边界

CSLab 实验室私有 Python 运行时（文件头 `apps/electron/src/main/lib/cslab/cslab-python-runtime.ts:1-11`）。评审加固 11.2：venv 可执行路径平台感知（Windows `.venv/Scripts/python.exe`、POSIX `.venv/bin/python`）。红线：①一键安装只写实验室 `runtime/.venv`，绝不修改全局 Python；②依赖缺失如实返回 missing，**不伪造 installed**；③所有外部命令设超时与 `windowsHide`。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 1 个常量 + 11 个函数 = 14 个导出（类 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getVenvPythonPath`/`getVenvBinDir` | 函数（导出） | 45-60 | 平台感知路径（加固 11.2） |
| `getLabVenvDir` | 函数（导出） | 62-64 | `<lab>/runtime/.venv` |
| `resolveCsLabScript` | 函数（导出） | 67-76 | 5 候选路径探测随包脚本 |
| `resolveLabPython` | 函数（导出） | 134-154 | venv 优先；**静默自愈**（venv 损坏回退系统 Python，`:142`） |
| `getToolRuntimeStatus` | 函数（导出） | 191-235 | profile 缺失包状态（Map 缓存，`:188`） |
| `__resetToolRuntimeCacheForTest` | 函数（导出） | 237-240 | 测试清缓存 |
| `EnsureEnvironmentOptions` | 接口（导出） | 242-244 | `onProgress` |
| `ensureToolEnvironment` | 函数（导出） | 247-358 | 一键 venv+依赖安装 |
| `runCsLabPython` | 函数（导出） | 361-384 | venv 优先执行（**cwd=lab 沙箱**，`:379-380` 红线注释） |
| `CsLabPythonRunner`/`defaultCsLabPythonRunner` | 接口/常量（导出） | 387-398 | 可注入执行器（测试用） |
| `getSystemPythonPath` | 函数（导出） | 401-404 | 系统 Python（路由展示） |
| `__ensureVenvForTest` | 函数（导出） | 407-409 | 测试 mkdir |
| `PROFILE_MODULES`/`PROFILE_LABELS` | 内部 | 29-42 | plot(numpy/cv2/skimage/scipy)、formula(sympy/antlr4——LaTeX 解析依赖)、formula-ocr(pix2text)、instrument(h5py/yadg/eclabfiles) |
| `commandWorks`/`probeSystemPython`/`probeUv`/`probeModules`/`resolveRequirementsPath` | 内部 | 78-186 | 命令探测（3s）；系统 Python 候选；uv；importlib.util.find_spec 缺失探测（15s） |

## 3. 内部逻辑与关键流程

### 3.1 状态（`getToolRuntimeStatus`，`:191-235`）

venv/系统 Python 解析+uv 探测；无 Python→全 profile `{installed:false,missing:全部}`+note（不伪造）；否则 `probeModules` 逐 profile 归属缺失；结果缓存。

### 3.2 安装（`ensureToolEnvironment`，`:247-358`）

requirements 路径缺失→抛 `缺少 X 依赖清单文件`；uv 缺失→`ensureUvBinary` 自动下载（经 `confirmUvUntrustedInstall` 同意门），失败切标准引擎；损坏 venv 静默重建（`:280-284`）；建 venv：`uv venv --python 3.11` 失败回退 `python -m venv`（`:301-337`）；装依赖：`uv pip install -r` 失败回退 venv pip（`:325-345`）；**verify**：清缓存重查，仍缺模块→抛 `安装完成但以下模块仍不可用：…`（`:347-354`）；进度回调五阶段 resolve/venv/install/verify/done/error。

### 3.3 执行（`runCsLabPython`，`:361-384`）

脚本缺失/无 Python 抛错；`execFile` 默认 120s/64MB，**cwd=lab 沙箱**（内部脚本副作用落沙箱）。

## 4. 调用者与调用链

入向：`cslab-plot-digitizer.ts`（runner 注入）、工具运行时 IPC/一键安装、`cslab-python.ts` 同类探测；测试：本批**无专属测试**（scope 无 `.test.ts`；`cslab-runs.test.ts`/`cslab-scientific-tools.test.ts` 可能间接）。出向：`node:child_process/fs/path/util`、`@profer/shared`（类型）、`./cslab-paths.ts`、`./cslab-uv.ts`、`./cslab-uv-consent.ts`。

## 5. 数据 I/O、读写与副作用

- 子进程：venv 创建/依赖安装/脚本执行（全 `windowsHide`+超时）。
- 写：仅实验室 `runtime/.venv`（红线①）；uv 单文件下载（`ensureUvBinary`）。
- 副作用：`console.warn`、进度回调、状态缓存。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 无 requirements | 抛错 | 257-261 |
| 无 uv | 自动下载→失败切标准引擎 | 267-277 |
| venv 损坏 | 静默重建 | 280-284 |
| uv venv/pip 失败 | 回退系统 Python/pip | 307-314,333-337 |
| 无 Python | 抛 `未检测到 Python，请先安装 Python 3.11+ 或 uv` | 290-293 |
| verify 仍缺 | 抛 `安装完成但以下模块仍不可用` | 350-354 |

## 7. 权限与权威状态

- 红线权威：只写 lab venv/缺失如实报告/全命令超时（`:7-10`）。
- uv 未信任安装须 `confirmUvUntrustedInstall` 同意（`:272`）。

## 8. 修改影响面

改安装/回退链影响工具依赖供给；改探测影响状态展示；影响 `cslab-python-runtime` 间接测试面。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三红线 | 已证实 | `:7-10` |
| 平台感知 venv（加固 11.2） | 已证实 | `:44-60` |
| uv/pip 双回退 | 已证实 | `:301-345` |
| verify 不伪造 | 已证实 | `:347-354` |
| cwd 沙箱 | 已证实 | `:379-380` |
| 真实安装 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 路径/探测族 | §2,§3.1 | 45-240 | covered |
| 安装链 | §3.2 | 247-358 | covered |
| 执行/注入 | §3.3 | 361-409 | covered |
| 断言 | §9,§10 | — | unknown |
