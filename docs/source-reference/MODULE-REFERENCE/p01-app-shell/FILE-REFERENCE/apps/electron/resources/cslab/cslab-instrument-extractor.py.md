---
path: apps/electron/resources/cslab/cslab-instrument-extractor.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dfa1ce3939abb0aff37b5c879257b401118ab809
sha256: 631aefdf1856ddd1368ec4ca83b8ad69ceeeb20cf611f64ed8c45d7de7da1887
lines: 93
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/cslab/cslab-instrument-extractor.py

## 1. 结论与边界

**CSLab 可选 Python 增强提取器**（93 行，`:2-10`）：TS 主实现的能力补充——`mat-v73`（h5py）与 `biologic-mpr`（yadg）；统一 JSON 输出；**依赖缺失输出 `{ok:false,message}` 由主进程安静降级**。

## 2. 导出与关键符号

无导出（CLI）：`--input --format {mat-v73,biologic-mpr}`（`:81-84`）。内部 `emit`（`:17`）、`parse_mat_v73`（`:22`）、`parse_biologic_mpr`（`:66`）。

## 3. 内部逻辑与关键流程

- `parse_mat_v73`（`:22-63`）：缺 h5py/numpy→降级消息（`:24-27`）；HDF5 visitor 选**最大二维数值矩阵**（dtype fiu、shape 2 维、size≥2，`:32-42`）→转置使行>列（`:50-51`）→首列 X 其余 series（单列回退单 series `:61`）。
- `parse_biologic_mpr`（`:66-77`）：缺 yadg→降级；`dg.from_file(encoding="thermogravimetry")` 通用入口；**当前实现恒返回"未匹配到可用扫描"**（`:77`，照实记录——解析结果未消费）。

## 4. 调用者与调用链

- 入向：CSLab 仪器数据提取链（主进程安静降级调用）。
- 出向：h5py/numpy/yadg（可选三方）。

## 5. 数据 I/O、读写与副作用

读仪器文件；stdout JSON；无写。

## 6. 分支、失败、取消与恢复

依赖缺失/无矩阵/解析失败→ok:false 消息；不抛出。

## 7. 权限与权威状态

降级语义权威=ok:false+message 契约（主进程安静降级声明 `:9`）。

## 8. 修改影响面

MAT v7.3/BioLogic 数据提取能力面；biologic-mpr 现状为占位（恒 ok:false）。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 矩阵选取/转置/降级契约 | 已证实 | `:1-93` 全文 |
| **biologic-mpr 恒 ok:false（结果未消费）** | 已证实（照实记录） | `:77` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 17-89 | covered |
