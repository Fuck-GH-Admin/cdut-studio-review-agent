# NB-43-r1 独立 QA 验收报告（D0）

- 批次 `nb-43-r1`（revisionOf `nb-43`，p07.other-packages，14 文件），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-d7ec3913642e646a`（18:03:03Z）；QA `docs-r07-qa-nb-06-20261023`（01:40:00Z）
- **batchVerdict：`accepted`（14/14）**；G0/G1/G2 pass；**NB43-N1/N2/N3 全部核销**
- **NOT_RUN**

## G0

seal 链三层哈希独立重算全相等；ZIP 17 条目；14/14 manualHash；对父批逐文件 diff 仅 3 篇（thinking-tags :19/:28、select :77、package.json :19/:39），与 FINDINGS-RESPONSE 严格一致，11 篇字节=父批。

## G2 修复核销（3/3 verified）

| finding | 核销 |
| --- | --- |
| NB43-N1（major 字节损坏） | ✅ §1 改符号名写法（"思考标签（符号 THINK_OPEN_TAG/THINK_CLOSE_TAG）"）、§2 值列去竖线；repr 逐字节复核残片清零、拆列消除 |
| NB43-N2 | ✅ §11 `:3-17` → `:3-14` |
| NB43-N3 | ✅ Radix ×14 → ×15（§1/§3 两处） |

**修复写法示范**：r1 用"符号名+引源码行号"替代内嵌标签字面量，正是规避生成链剥离的正确做法——建议全组沿用（nb-60 NB60-N6 同类残片同法可修）。

遗留 cosmetic（非阻断）：§2 修复行（:28）为 4 单元格 vs 表头 5 列，渲染安全（空单元格），下次触碰顺手补格即可。

## 合入（lead）

全 14 篇 acceptedHashes 可合（`reviews/nb-43-r1/RESULT.json`，脚本生成=READY 三方核验；11 篇未动文件按合入规则由本子批记录同 hash）。父批 `deliveries/nb-43` 保留。此批闭环：nb-43 D0(revision_required) → nb-43-r1(accepted)。
