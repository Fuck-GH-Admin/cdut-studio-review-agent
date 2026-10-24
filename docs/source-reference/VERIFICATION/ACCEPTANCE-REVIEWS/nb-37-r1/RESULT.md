# NB-37-r1 独立 QA 验收报告（D0）

- 批次 `nb-37-r1`（revisionOf `nb-37`，p07-shared-libs · p07.ui，18 文件 / 2289 源码行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 `docs-r07-author-nb-06-20261023`（sealId `seal-feeed3a61f56b48d`，16:32:12Z）；父批 seal `seal-60cb3c6830deaf64`（16:24:30Z，字节保留未动）
- QA `docs-r07-qa-nb-06-20261023`（18:20:00Z）
- **batchVerdict：`accepted`（18/18）**；G0 pass / G1 pass / G2 pass_with_findings（5 minor 非阻断，各文件 ≤2）
- **NOT_RUN**（产品测试/typecheck/build/GUI/真实模型均未执行；批内 22 个测试用例仅为静态读断言）

## 背景：r1 为作者自检修正版

作者封 nb-37 后跑 `g0_check.py` 自检发现 2 项行号引用 blocking（`index.ts` 仅 26 行却引 `:27/:28`），排查出同类 **off-by-one 行号引用错误共 15 篇约 30 处**（根因：6 个微型文件拼接 `cat -n` 阅读后未换算回单文件行号），遂开 nb-37-r1 只改引用行并附 FINDINGS-RESPONSE + before/after hash。QA 按规则取最高已封版 nb-37-r1 审；对父批逐文件 diff 确认改动范围与声明一致（15 篇仅引用行变动、3 篇测试手册未动）。

## G0 — PASS

seal 链 manifest→READY→DONE 三层哈希独立重算全相等；ZIP 51508 B / 21 条目（18 manuals + MANIFEST + 2 mechanical TSVs，无 READY/DONE/reviews）；18/18 manualHash 磁盘=MANIFEST=READY；源绑定 18/18 blob+sha256+lines 与 nb-37-SCOPE 全等（脚本重算）。

## G1 — PASS

18 篇元数据齐全、章节有内容、导出清单与源码一致（index 25 符号 re-export、alert-dialog 11、z-layers 3、wheel-zoom 5、useSmoothStream 1+4 内部、use-smooth-zoom 4+1、mermaid-detection 6+8 常量、CodeBlock 1+6、MermaidBlock 1+12、markdown-preview 3 等逐行复核）；r1 修正后的行号引用（Toaster `:5`…mermaid-detection `:19-26`、barrel re-export `:7/:5/:7`、ZLayerName `:76`、cross-ref `index.ts:5-26`）全部回源命中。

## G2 — 逐文件（18 源文件全文逐行 + 18 篇手册全文比对）

全部 18 篇 **accepted**。消费者计数独立复算全对：`from '@profer/ui'` 44 文件、alert-dialog 深路径 22、detectIsMac 6/detectIsWindows 17、MarkdownPreview 2、CodeBlock import 恰 2（message.tsx/ReleaseNotesViewer.tsx，松散 grep 的 9 命中均为词汇提及非导入）、MermaidBlock 3、useSmoothStream 1/useSmoothZoom 4、mermaid-detection 3+2+1、applyWheelZoom/DEFAULT_WHEEL_ZOOM 无包外消费者（负向口径均给出）。质量亮点：wheel-zoom 手册照实记录源码注释矛盾（`:29` 称 0.065 vs 实值 `0.085`）；use-smooth-zoom 手册跨文件正确引 MermaidBlock `:378` 对端约定；MermaidBlock 843 行的双路渲染/generation 防竞态/缩放锚定/事件隔离逐条吻合。

## findings（5 minor，均为计数/行号口径精确化 → ACCEPTED-ERRATA 关闭）

| id | 文件 | 问题 |
| --- | --- | --- |
| NB37-N1 | index.ts.md | "20 个符号/20 条" vs 表列 25（20 值 + 5 类型），口径未注明 |
| NB37-N2 | cn.ts.md | 注释引 `:5`（含费解的"(:42 行注释实为 :5)"），实际注释在 `:4` |
| NB37-N3 | z-layers.ts.md | Z_INDEX "16 键"/"16+16" vs 实际 15 键（与自述 shellTopDrag 无 Z_INDEX 矛盾） |
| NB37-N4 | mermaid-detection.ts.md | "35 关键字" vs 34；"7 内部常量" vs 8（自列 8 名） |
| NB37-N5 | MermaidBlock.tsx.md | §10 "10 内部符号" vs §2 表列 12 内部条目，口径未注明 |

## 合入（lead）

18 篇全 accepted，`RESULT.json.acceptedHashes` 为当前字节 manual→hash（脚本生成 = READY/MANIFEST 三方核验）。可全量合入 candidate；5 findings 记 ACCEPTED-ERRATA，G4 前关闭。父批 `deliveries/nb-37` 与 `nb-37-r1` 封版字节均保留不动。
