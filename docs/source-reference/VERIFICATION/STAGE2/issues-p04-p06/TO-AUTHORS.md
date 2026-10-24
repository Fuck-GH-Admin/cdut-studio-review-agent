# 仍需修改的文档事项（按作者分组，唯一 handoff）

自：docs-r07-qa-extra-05-20261024 ｜ 2026-10-23T21:57:02Z ｜ 依据：RECONCILIATION.json（当前 manual hash+源码证据均已附）——**仅举证当前文档仍错的事项**；已闭/已修历史条目无需再动。

## p05 作者（review-engine 手册，5 项+1 补记录）

1. **review-identity-authority.test.ts.md**（ACCEPTED sha256 见 RECONCILIATION）：:23「6 describe / 8 test」→「6 describe / 12 test」。源证：test() 恰 12（:25/:32/:44/:52/:61/:74/:83/:90/:104/:124/:131/:142）。
2. **review-principal-service.ts.md**：:40 同句计数自斥（「实际 12 个」vs「= 14 个导出声明」）→统一为 13（grep ^export=13：type 4/const 1/interface 3/class 1/function 5）。
3. **pi-review-executor.ts.md**：:29/:39「15 个工具」→13（REVIEW_TOOL_ALLOWLIST :23-27 恰 13）。
4. **pi-review-agent-client.ts.md**：:41 `toolProfile:'customTools'`→源实为 `toolProfile:'review'`（:148；§7 :85 已正确）。
5. **review-v3-t04-rules-scoring.ts.md**：:116「18 导出」→19（^export=19）。
6. **pi-case-review-service.ts.md**（补记录，非纠错）：§3.2 :946-949 段补记实现怪癖（:949 第一子句恒 false 死比较）——照实记录即可；实现本体留阶段三设计差异报告。

## p06 作者（review-batch 手册，2 项）

7. **review-v3-t07-rating-workflow.ts.md**：:25「导出类型 18 + 导出函数 4」→「16 + 4」（export type=16/function=4，表 20 项已正确）。
8. **template-store.ts.md**：:99「17 导出与行号」→「18 导出（表 17 行，remove/restore 合行）」。

## p04 作者（review-case-core 手册，1 项 2 文件）

9. **review-v3-main-author-revision-read.ts.md**：:136「命中 2（生产 1、测试 1）」→4（生产 1、测试 3）。
10. **review-v3-main-local-technical-review.ts.md**：:112 测试断言行 :150→:151。

## 可选顺带（26 项，非阻断，下次触碰收准；明细见 RECONCILIATION）

nb-19 行号偏移 9 篇、NB22 符号行号漂移 6 篇（合并 1 根因）+入向补列 1、N13-1 残留 :689 1、NB17R1-L1 叙述行号 2、MVP-N-01..05 fixture 引证 5、NB18-R01/R02 备注 2。**不催办、不阻断合入。**

## 不派发（纠偏口径）

- 41 条 UNVERIFIED（claim/id 待审计回源）不派作者；2 条 CLOSED_TEXT_FIXED_INDEX_GAP、8 条 NB24R1 索引/哈希残差交 lead 索引审计。
