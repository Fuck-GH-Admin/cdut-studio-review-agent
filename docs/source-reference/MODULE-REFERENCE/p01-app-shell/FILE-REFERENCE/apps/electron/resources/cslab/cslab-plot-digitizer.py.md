---
path: apps/electron/resources/cslab/cslab-plot-digitizer.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 334c46b2a930819e0d986f2a84c3ab1b5e3f8ee5
sha256: c34e57e7849deb83dc476db75a63d04637236bd6e3a8053f35c541cbda01fa6d
lines: 335
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/cslab/cslab-plot-digitizer.py

## 1. 结论与边界

**科学图表逆向数字化**（335 行，`:2-15`）：HSV 颜色掩膜分离曲线/散点→骨架化+交叉点剥离（折线）/轮廓矩质心（散点）→线性/log10 标定拟合自动选 R² 高者。**坐标基准=用户标定刻度，rotationDeg 恒 0 不自动旋转**（`:10-11`）；**红线：失败输出 ok:false 绝不伪造数据**；stdout JSON 日志 stderr（`:13-14`）。

## 2. 导出与关键符号

无导出（CLI）：`--input --calibration --mode {line,scatter} --color --tolerance`（`:233-240`）。内部：`build_color_mask`（`:55`，含色相环绕双段掩膜 `:63-78`/自动峰值 `:81-92`）、`fit_axis`（`:95`，R² 比较 `:146`）、`order_component_points`（`:155`）、`smooth_curve`（`:167`，单调 x 样条防闭环 `:175-177`）、`extract_lines`（`:186`，3x3 交叉核阈值 12.5 `:195-199`）、`extract_scatter`（`:216`）。

## 3. 内部逻辑与关键流程

`main`（`:233-328`）：四依赖检查（numpy/cv2/skimage/scipy，缺→missing 清单 `:242-252`）→图像读取→标定解析（文件或内联 JSON `:262-266`）→掩膜（空→ok:false）→双轴拟合（各需≥2 刻度 `:282-284`）→提取曲线/散点→逐点 apply_axis 过滤非有限值（`:298-299`）→输出 width/height/rotationDeg=0/axisFit(R²)/series(值+像素双列表)。顶层异常 JSON 兜底（`:331-335`）。

## 4. 调用者与调用链

- 入向：CSLab 图表数字化（前端框选+标定，域外）。
- 出向：numpy/cv2/skimage/scipy（必需四件）。

## 5. 数据 I/O、读写与副作用

读图像+标定；stdout JSON；无写。

## 6. 分支、失败、取消与恢复

六种 ok:false 降级（缺依赖/读图失败/标定无效/无颜色/刻度不足/提取为空）；异常兜底。

## 7. 权限与权威状态

数据真实性权威=红线"绝不伪造"（`:13`）；坐标权威=用户标定（无自动旋转）。

## 8. 修改影响面

图表逆向数字化能力；拟合/骨架算法变更影响提取精度。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 掩膜/骨架/拟合/红线/降级矩阵 | 已证实 | `:1-335` 全文 |
| cv2/skimage/scipy 三方行为 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 26-335 | covered |
