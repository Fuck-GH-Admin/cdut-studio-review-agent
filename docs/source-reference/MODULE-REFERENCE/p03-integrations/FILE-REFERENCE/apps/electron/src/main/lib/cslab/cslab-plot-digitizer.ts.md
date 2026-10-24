---
path: apps/electron/src/main/lib/cslab/cslab-plot-digitizer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 84ca378912f1558b8bb5aa884dc2b92bfd0b7611
sha256: d3cb79cd56972e80fbd86ff518a506eb736ea2b1551af872cfba496b1f7fb2be
lines: 165
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-plot-digitizer.ts

## 1. 结论与边界

图表逆向数字化 TS 包装层（文件头 `apps/electron/src/main/lib/cslab/cslab-plot-digitizer.ts:1-5`）：校验渲染进程传入的 dataURL、落临时文件、调用 Python 脚本、归一化 JSON。**红线：Python 不可用或失败时返回 `ok:false` 与原因，绝不生成伪造曲线**。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数 = 1 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `digitizePlot` | 函数（导出） | 91-165 | `(input:CsLabPlotDigitizeInput,runner=defaultCsLabPythonRunner)=>Promise<CsLabPlotDigitizeResult>` | 主入口 |
| `MAX_IMAGE_BYTES` | 内部 | 23 | 24MB | |
| `RawDigitizePayload` | 内部 | 25-40 | Python 载荷形状 | |
| `parseDataUrl`/`normalizeSeries`/`normalizeScale` | 内部 | 42-89 | dataURL 解析（仅 PNG/JPEG）；点集过滤（finite、≥2 点才保留）；log/linear 归一 | |

## 3. 内部逻辑与关键流程

`digitizePlot`（`:91-165`）：

1. `assertLabId`；`parseDataUrl`（`:42-49`）：正则仅 PNG/JPEG dataURL（否则 `框选图像格式无效`）、空→`框选图像为空`、>24MB→`框选图像超过 24MB`。
2. 标定校验：`calibration.x/y.ticks` 必须存在且各 ≥2（`:97-102`，`缺少坐标轴标定刻度`/`X/Y 轴各至少需要 2 个标定刻度`）。
3. 临时目录+落盘（`cslab-plot-` 前缀，`:104-107`）；args：`--input/--calibration/--mode/--tolerance`（clamp 8-60，默认 28，`:116`）+可选 `--color`。
4. `runner.runPython(labId,'cslab-plot-digitizer.py',args,{timeoutMs:120s})`（`:120-122`）；`normalizeSeries` 过滤（点集须 finite 且 ≥2 点）。
5. `!payload.ok || series.length===0` → `{ok:false,message,width,height,series:[]}`（不伪造，`:126-134`）；成功 → `{ok:true,width,height,rotationDeg,axisFit{x,y:{scale,r2}},series}`（`:136-152`）。
6. 任意异常 → `{ok:false,message:errorMessage,width:0,height:0,series:[]}`（`:153-160`）；`finally` 清临时目录（`:161-163`）。

## 4. 调用者与调用链

入向：绘图数字化 IPC/工具（渲染进程框选）；测试：本批**无专属测试**（scope 无 `.test.ts`；`cslab-molstar-math.test.ts` 可能间接）。出向：`node:fs/os/path/crypto`、`@profer/shared`（类型）、`./cslab-paths.ts`、`./cslab-python-runtime.ts`（`defaultCsLabPythonRunner`/`CsLabPythonRunner`）。

## 5. 数据 I/O、读写与副作用

- 写：临时目录+裁剪图落盘（`finally` 清理）。
- 子进程：Python 脚本（120s 超时）。
- 无持久状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| dataURL 非法/空/超 24MB | 抛错（中文消息） | 42-49 |
| 标定缺失/<2 刻度 | 抛错 | 97-102 |
| Python 失败/空结果 | `{ok:false,message}` | 126-134,153-160 |
| 成功 | `{ok:true,…}` | 136-152 |

恢复：调用方按 `ok:false` 重试；临时文件必清理（`finally`）。

## 7. 权限与权威状态

- 红线：无 Python/失败不伪造曲线（`:4-5,126-134`）。
- labId 校验（`assertLabId`）；tolerance clamp 8-60（`:116`）。

## 8. 修改影响面

改 Python 协议/归一化影响数字化结果；改 dataURL 校验影响安全边界。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（不伪造） | 已证实 | `:4-5,126-134` |
| dataURL/标定校验 | 已证实 | `:42-49,97-102` |
| tolerance clamp | 已证实 | `:116` |
| finally 清理 | 已证实 | `:161-163` |
| 真实 Python | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 校验族 | §3 | 42-102 | covered |
| 执行/归一化 | §3 | 104-152 | covered |
| 失败/清理 | §3 | 153-165 | covered |
| 断言 | §9,§10 | — | unknown |
