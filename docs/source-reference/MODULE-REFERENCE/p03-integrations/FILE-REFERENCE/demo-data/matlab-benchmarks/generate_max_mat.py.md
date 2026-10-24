---
path: demo-data/matlab-benchmarks/generate_max_mat.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9427cae7962fd1fc7fd17543399ee16bb95906e0
sha256: 398c03cd9ae0329d26dd8abeb7159d1600487822000e1a2270f1824fc2ea715b
lines: 70
kind: script
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# demo-data/matlab-benchmarks/generate_max_mat.py

## 1. 结论与边界

基准数据生成脚本（70 行 Python）：生成两个"理论最高复杂度" MATLAB 测试文件（Level 5 压缩复数 + v7.3/HDF5 分块压缩），供 CDUT Studio 的 .mat 提取器做性能/兼容性基准。一次性数据生成工具，非产品运行时代码。

## 2. 导出与关键符号

无导出（顶层脚本）。结构：`out_dir`（`:6`，**硬编码 Windows 绝对路径** `c:\Users\Belie\Desktop\CDUT-Studio\demo-data\matlab-benchmarks`——照实记录，矛盾①）；生成物 1 `matlab_level5_max_compressed_complex.mat`（`:15-40`）；生成物 2 `matlab_v73_max_hdf5_chunked.mat`（`:48-70`）。

## 3. 内部逻辑与关键流程

信号构造（`:17-28`）：N=50000、t∈[0,50]、ch1 5Hz 正弦+噪声、ch2 阻尼余弦、complex=ch1+1j*ch2、`sensor_matrix` 50000×4 complex128。Level 5 写盘（`:30-39`）：`scipy.io.savemat(format='5', do_compression=True)` 含 sample_rate_hz/experiment_title 元数据。v7.3 写盘（`:50-69`）：h5py 写 `telemetry_dataset_50k`（chunks (1000,4)、gzip 6、MATLAB_class/MATLAB_empty 属性；形状注释 `:55-56`：MATLAB 列主序常存 (4,50000)，提取器行<列时转置）。

## 4. 调用者与调用链

人工运行（生成 demo-data）；被测方为 CDUT Studio .mat 提取器（不在此树）。依赖 numpy/scipy/h5py。

## 5. 数据 I/O、读写与副作用

本地写 2 个 .mat 文件 + mkdir；打印文件大小。

## 6. 分支、失败、取消与恢复

无分支；失败即抛（makedirs/exist_ok）。

## 7. 权限与权威状态

无权限概念；数据语义（列主序/转置约定）为提取器契约输入。

## 8. 修改影响面

改生成参数影响基准可比性；路径硬编码影响跨平台可用性。

## 9. 测试证据

无测试（数据生成脚本）。`NOT_RUN`（未运行；依赖 scipy/h5py 未核装机状态）。

## 10. 已证实 / 推断 / 未知（含矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件逻辑/两生成物/形状约定注释 | 已证实 | 文件全读（70 行） |
| **矛盾①** `:6` 硬编码开发者本机 Windows 路径（含用户名 Belie），他机运行即写错位置/无权限 | 已证实 | `:6` |
| 提取器转置行为（`:55-56` 注释自述） | 推断 | 提取器不在冻结树 |
| 运行实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；运行实效 unknown。
