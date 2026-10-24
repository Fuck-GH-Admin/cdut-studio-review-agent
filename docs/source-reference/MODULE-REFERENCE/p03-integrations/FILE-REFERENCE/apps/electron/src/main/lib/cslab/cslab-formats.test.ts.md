---
path: apps/electron/src/main/lib/cslab/cslab-formats.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7029157e47713167362e58afda0903b2ca64fa9a
sha256: 65afa2bcf4c4cc6005eea4dac15afb5ae9a9eb473f94c40e1ade352ca4848bbd
lines: 162
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats.test.ts

## 1. 测试目标

CSLab 多格式解析器测试（`apps/electron/src/main/lib/cslab/cslab-formats.test.ts:1-3`）：HeaderDataSeparator/MATLAB Level 5/Thermo SPC/JCAMP-DX/Bruker RAW/格式嗅探六面。被测 6 模块解析函数。夹具：**手工构造二进制**——`matElement/matSmallElement/buildMatFile`（`:13-53`，128 字节头+'IM' 端序标记+列主序 double 矩阵）、`buildSpcFile`（`:55-65`，512 头+'K' 子头标记+float32 Y）。

## 2. 用例清单

共 **7 个 `test(`**（6 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 67-85 | 制表符/表头单位/元数据 | delimiter '\t'、dataStartRow 2、rowCount 3、列 label/unit 拆分（Potential/V、Current/mA）、y1 三值、metadata.Instrument | 独立 |
| 2 | 87-89 | 拒绝纯日志文本 | toThrow | 独立 |
| 3 | 92-99 | MAT 双击列主序拆 X/Y | format 'matlab-level5'、x [1,2,3]、y1 [10,20,30]、rowCount 3 | 独立 |
| 4 | 102-109 | SPC 32 位浮点 Y+线性 X | y1 [1,2,3,4]、x [10,11,12,13]、rowCount 4 | 独立 |
| 5 | 112-125 | JCAMP X++(Y..Y) 压缩行 | y1 [10,20,30]、x [1,1.5,2]（FIRSTX/LASTX 插值） | 独立 |
| 6 | 128-144 | Bruker RAW 启发式恢复 | rowCount 120、x[1]≈10.02(6 位)、y1[1]=103 | 独立 |
| 7 | 147-154 | 嗅探 MAT/SPC/RAW/text | 4 格式 toBe 断言 | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:74-84` 8 断言（含 series toEqual）；`:96-98`；`:105-108`；`:122-124`；`:141-143`（toBeCloseTo 6 位）；`:149-153` 4×toBe。

## 4. 未覆盖与脆弱点

- xrd.ts 其余三解析器（rigaku-ras/xrdml/brml）、mat-v73/python 通道、biologic 未测。
- SPC 16 位/大端/存档 X 分支未测；MAT 压缩元素/复数未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 test/6 describe、二进制夹具工厂 | 已证实 | 全文 |
| 列主序/线性 X/插值三条数值锚 | 已证实 | `:96-98,105-108,122-124` |
| 启发式恢复 120 点等步长 | 已证实 | `:141-143` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| parseDelimitedText | §2/§3 | 1-2 | covered |
| parseMatLevel5 | §2/§3 | 3 | covered |
| parseSpc | §2/§3 | 4 | covered |
| parseJcampDx | §2/§3 | 5 | covered |
| parseBrukerRaw | §2/§3 | 6 | covered |
| sniffFormat | §2/§3 | 7 | covered |
| xrd 其余/python 通道 | §4 | — | unknown |
