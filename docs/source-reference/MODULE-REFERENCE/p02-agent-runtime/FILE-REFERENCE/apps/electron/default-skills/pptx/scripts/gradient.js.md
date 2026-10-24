---
path: apps/electron/default-skills/pptx/scripts/gradient.js
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 04bc2f38a34846ef1569380c176a82c926d3f979
sha256: a5f287e0733c04c2f915cfa837e63cdc92f3a267b5e7d60c0fdbaacafe7aa488
lines: 183
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/gradient.js

## 1. 结论与边界

**渐变背景/色块 PNG 生成器**（Node，`gradient.js:1-7`）：pptxgenjs 不支持原生渐变填充，此模块生成渐变 PNG 作 slide 背景/色块。支持线性（任意角度）+径向+多停止点。依赖 `sharp`（`:8`）。

## 2. 导出与关键符号

`module.exports` 4 项（`:183`）：

| 符号 | 行 | 签名/说明 |
| --- | --- | --- |
| `hexToRgb` | `:13` | '#RRGGBB'/缩写 3 位→[r,g,b]；非法抛（`:16`） |
| `linearGradient` | `:29` | `(opts) -> Promise<Buffer>`：from/to 或 stops（stops 优先）、angle（0=向上 90=向右）、默认 1920x1080 |
| `radialGradient` | `:95` | center 归一化 [0.5,0.5]；默认 from=白 to=黑 |
| `gradientToBase64` | `:147` | `'image/png;base64,'+…`（pptxgenjs `addImage({data})` 直用） |

CLI（`:152-181`）：手写参数解析（避免 minimist 依赖，`:153`）——`--type/--from/--to/--angle/--width/--height/--stops(JSON)/-o`；无 `-o` 打印 base64 前 60 字符。

## 3. 内部逻辑与关键流程

- `linearGradient`（`:29-87`）：stops 排序（`:42`）→ 逐像素 CPU 计算（注释自述高分辨率慢但背景够用 `:46`）→ 方向单位向量 `dx=sin(angle), dy=-cos(angle)`（`:49`）→ 四角投影归一化 t∈[0,1]（`:51-58`）→ 相邻 stops 线性插值（`:65-81`）→ raw RGB Buffer→`sharp(...).png().toBuffer()`（`:86`）。
- `radialGradient`（`:95-144`）：maxR=中心到最远角距（`:110-115`）→ d/maxR 归一化同插值。

## 4. 调用者与调用链

- 入向：pptxgenjs 技能脚本（`require('./gradient')`，域外）；CLI 自用。
- 出向：`sharp`（native 图像库）、`fs`（CLI 写文件）。

## 5. 数据 I/O、读写与副作用

纯内存 Buffer 生成；CLI 写 PNG 文件（`args.o`）。无其它副作用。

## 6. 分支、失败、取消与恢复

非法颜色→throw（`:16`）；CLI 异常→console.error+exit 1（`:180`）；无取消。

## 7. 权限与权威状态

无权限分支，依据：纯计算+文件写。

## 8. 修改影响面

pptx 渐变视觉产出；角度/插值语义影响渲染一致性。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）；`__main__` 自测脚本生成组合图 pptx（chartlib.py 侧）非本文件测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/插值算法/CLI | 已证实 | `:1-183` 全文 |
| sharp 编码行为 | 边界 | 第三方 native 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+CLI | §2/§3 | 13-183 | covered |
