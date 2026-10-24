# NB-22 独立复核报告（G0/G1/G2）— p05.review-engine · p05.review-services

- `nb-22`（sealId `seal-f480e1cce3dcd5bd`，sealedAtUtc 2026-10-23T17:15:03Z）；frozenSha `05fb2565…37c2`。
- **batchVerdict：accepted（18/18；0 blocking；2 minor 待关闭）**。

## G0 PASS（0 错误）
18 源绑定=SCOPE=MANIFEST；18 手册 hash 磁盘=MANIFEST=READY；链一致；ZIP 21 条目安全逐字节一致；changes.diff 空树重放 18/18。

## G1 PASS
导出计数逐文件复核（strict-pi-tools 2、run-graph 11、runtime-contract 17、author-store 6、plan-adapter 17、b2-adapter 11）；测试计数 93 声明（3+4+6+5+7+5+8+8+12+13+8+14）逐文件 grep 一致。

## G2 PASS_WITH_NOTES（6 源深读 + 12 测试核对 3483 行 → 18 篇对照）
行为/安全语义逐项属实：工具白名单 5+await 后重查绑定防 stale 回执、RUN-04 最新失败不回退、RUN-43 续跑闸门 fail-closed、B1 全链校验+`wx`+author.lock、B2 只认本解析器块注册表铸造/字节换身份即作废旧块、`adaptLegacyP06Plan` 恒 throw、`publicationAllowed:false`、evidence 值恒 false。诚实标记全对（win32 目录 fsync 不宣称断电等价、strict-profile"不滤 external customTools"已知缺口、docx paragraph 只是传输信封）。调用链逐符号复算（含动态 require 口径）无假否定。

### Findings
| id | 级别 | 文件 | 摘要 |
| --- | --- | --- | --- |
| NB22-N-01 | minor | 6 篇 source 手册 | §2 符号行号手估漂移 ±1~8（同类 nb-17-N-01）；符号可按名定位 |
| NB22-N-02 | minor | review-template-author-store-v3-b1.ts.md | §4 入向列表 5 文件漏 1：`readB1AuthorRevision` 实际 6 个生产消费（漏 `review-v3-main-author-revision-read.ts`） |

## 边界
产品测试/typecheck/build/GUI/真实模型/真 WS 全 **NOT_RUN**（93 测试声明仅静态读）；未改作者/源码/candidate/全局账；sealed 字节未改写；哈希脚本生成。

## 下一步
lead 按 `reviews/nb-22/REVIEWED-HASHES.json` 18 exact manualSha256 机械合入并归档 `inventory/g0/nb-22.json`；NB22-N-01/02 并 ACCEPTED-ERRATA 或 rN 关闭；QA 续 nb-66（sealed/预读）、nb-17-r1 复验优先。
