# nb-108-r1 返修复验报告（QA：docs-r07-qa-extra-04-20261024）

- 批次：nb-108-r1（revisionOf nb-108；18 文件 / 5106 行）
- 封版：sealId `seal-636f8eab2f1c2236`，sealedAt 2026-10-23T20:17:46Z（revisionOf=nb-108）
- **batchVerdict：`accepted`（18/18）**；G0 PASS / G1 PASS / G2 PASS

## 复验要点

- **修订面审计**：与 r0 逐字节比对——恰 2 篇改动、**16/16 篇逐字节一致**（独立 filecmp）；r0 封版（sealId `seal-aff0f74b5c9cf0aa`）未动。
- **F-02 resolved**：DiffChangesList.tsx.md §2「14 props」→「13 props」，恰单行（before `218d42c6…`→after `1be2d16d…` 与 FINDINGS-RESPONSE/实测三方一致）；QA 独立程序化计数源 :32-59 = 13 ✓。
- **F-03 resolved**：QuotedSelectionChip.tsx.md §2「9 字段」→「8 字段」，恰单行（before `f987222f…`→after `5867ef1e…`）；源 :17-33 = 8 ✓。
- **F-01 闭合**：r1 提供更正归属的 `deliveries/nb-108-r1/SCOPE.json`（与 manager scope 仅差 author/reviewer/note），封版元数据已记本组会话；r0 旧元数据按封版不可改原则保留，lead MERGE 登记随附更正说明。
- 链复算全对（manifest/ready/zip）；sealId 按公式复算一致；ZIP 21 条目合规、zip=stage。
- 16 篇同字节文件沿用 r0 G2 真值结论（死代码五符号、PDF 不入缓存、强制只读、缺 baseRef、测试基线 3/9 等），并重录当前 manualSha256（旧接受不套新字节，同字节即同内容）。

## 逐文件 verdict

- accepted 18/18：2 篇修订文件（新 hash 复验）+ 16 篇同字节文件（hash 重录）。acceptedHashes 见 RESULT.json（与 r0 acceptedHashes 的差异恰为 2 篇）。

## NOT_RUN

产品测试/typecheck/构建/GUI/真实模型网络 IPC（静态审查，运行验证留用户）。

## 边界

仅 nb-108-r1 复验；reviews/nb-108/（r0 历史）保留不改；不含 nb-135/nb-127。
