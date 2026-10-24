# NB-94 独立复核报告（G0/G1/G2）— p08-renderer-ui · p08.agent-ui

- `nb-94`（sealId `seal-a76d4becbd9b0a1f`，sealedAtUtc 2026-10-23T19:03:28Z）；frozenSha `05fb2565…37c2`。18 文件/2139 行；预读基线 `reviews/nb-94/SOURCE-CHECKLIST.md`（QA 基线行号两轮 grep 实测校正留痕）。
- **batchVerdict：revision_required（内容 18/18 accepted；1 机械 blocking + 1 minor）**。

## G0 FAIL — NB94-F-01（delivery-mechanics，blocking）
`changes.diff` 对 **thinking-tag-parser.test.ts.md / tool-phrase.test.ts.md** 为**过期草稿**：diff 内为旧稿文本，stage/ZIP/MANIFEST/READY 四方一致的新稿文本；空树重放 16/18（2 mismatch：1894/1744 B vs 2578/2125 B）。审计重放链断裂，内容权威链完整。→ **r1 仅重生成 changes.diff（内容字节不动）**。

## G1 PASS / G2 PASS_WITH_NOTES（18 篇对照源与预读清单）
- 不变量 A-H 全对：live 三条件、权限上限门禁在渲染层（IPC 不收敛）、弹窗竞态防御、思考标签双阶段语义、渲染窗口只裁剪、任务解析三兜底、mention 30s 缓存+35ms 去抖+最新胜出、CRLF/`revealStep=50`。
- 测试计数：**45 声明/50 运行**（task-progress 9 声明含 test.each×3 展开 14——手册"14 用例"为运行口径，正确）。
- **NB94-N-01**（minor）：各篇 §2 行号 ±1~3 漂移+「行号经逐行核对」校订注过强（r1 顺带重导或留 errata）。

## QA 自查留痕
预读基线曾因合并 cat 显示偏移错记行号/漏计 test.each——G2 前按 `grep -n`/正则实测校正（清单含校订注）。

## 边界
产品测试/typecheck/build/GUI/真实模型全 **NOT_RUN**；sealed 字节未改写；哈希脚本生成。

## 下一步
作者开 `deliveries/nb-94-r1/` 仅重生成 changes.diff（可顺带 N-01）；lead 内容可按 18 acceptedHashes 预合，闭链以 r1 为准；QA 续 nb-80-r2 复验优先、nb-106 预读。
