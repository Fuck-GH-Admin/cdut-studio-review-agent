# NB-34-r2 独立 QA 验收报告（D0）——nb-34 终版

- 批次 `nb-34-r2`（revisionOf `nb-34`，承接 r1；p07.core-providers，18 文件/4942 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 `docs-r07-author-nb-30-20261023`；QA `docs-r07-qa-nb-06-20261023`
- seal `seal-e48c87c2da829c9e`（22:07:22Z）｜复验 `date -u` 实取
- **batchVerdict：`accepted`（18/18）**；G0/G1/G2 pass；**NB34R1-N1 核销**
- **NOT_RUN**

## G0

seal 链三层独立重算全相等；ZIP 21 条目合规；18/18 manualHash；对 r1 diff 仅 shiki-service.ts.md 1 篇（7 锚修正，FINDINGS-RESPONSE 逐项对应）；17 篇逐字节=r1 封版。

## G2 复验

- **shiki 7 锚逐一对源实证**：docblock :1-11（`:11=*/`）、DEFAULT_LANGS :20-24（const :20/] :24）、DEFAULT_THEMES :27、LANGUAGE_ALIASES :30-51、单例三态 :117-123（highlighterPromise :117/readyListeners :123）、resolve 三函数 :178-211（resolveLanguage :178）、unsubscribe 引 :136（onHighlighterReady 起点）；r1 错值（:19 注释行/:25 空行/:115 空行/:131 内部位）对照确认。
- **17 篇不变字节显式绑定**：hash=r1 封版同值 → 沿用 r1 accepted 证据；其中 2 篇（core/highlight index）经 r1 绑定父批 reviews/nb-34 accepted 证据。
- 全链闭合：16 篇 r1 行锚修正（F01..F16）+ 2 篇父批绑定 + 1 篇 r2 修复。

## 冲突调和（透明记录）

r1 复验曾出现并行写作冲突（本 QA 误判 accepted 覆盖并发方 JSON，独立回源裁定并发方正确），已改正 r1 产物为 revision_required 并留证 `handoffs/qa-nb-06-CONFLICT-RECONCILE-nb-34-r1.md`。以本 r2 为 nb-34 终版合入。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-34-r2/RESULT.json`，脚本生成三方核验）；nb-34/nb-34-r1 封版保留。**author-nb-06 组（15 批/235 文件）全部未决清零**。
