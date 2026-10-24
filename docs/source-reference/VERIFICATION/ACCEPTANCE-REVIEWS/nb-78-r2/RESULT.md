# NB-78-r2 独立 QA 复核报告（返修复验，仅回源变化项）

- 批次：nb-78-r2（revisionOf nb-78；链 nb-78→nb-78-r1→nb-78-r2）｜冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（clean）
- 被审：`deliveries/nb-78-r2/`（sealId `seal-26e8e696efe7ea61`）｜父版 reviews/nb-78（seal-9a07…）、reviews/nb-78-r1（seal-5f50…）均 DONE 保留未覆盖
- **批次判定：`accepted`（18 accepted / 0 revision_required / 0 unknown）**
- 运行证据：**NOT_RUN**｜FINDINGS-RESPONSE：逐项闭环（NB78R-F01~F06 全 closed）

## 变化面与证据绑定（按规逐项区分）
- **vs r1 恰 6 篇变化**（6 篇测试手册）→ 全量回源重验：§2 用例表全部行锚 `grep -n` 与 `test(` 声明行逐一核对：
  - session-mirror.test 5 行（37/46/55 校正）✓、sleep-blocker.test 5 行（48/59/70/82）✓、entity-graph.test 3 行（18/35+# 列归一 1/2/3）✓、workspace-rag.test 5 行（124/129/147/152/165）✓、hierarchical-graphrag.test 5 行（用例 5 :94-113 闭环）✓、**cognition.test 25 行全对齐**✓
  - 断言文本/用例计数（5-5-3-5-25）未动——FINDINGS-RESPONSE 声明与实核一致。
- **vs r1 不变 12 篇**（byte-identical）→ **绑定 r1 独立 accepted 证据**（reviews/nb-78-r1/RESULT.json acceptedHashes 逐条），未重做、未把旧接受套到变化字节。

## G0 PASS / G1 PASS / G2 PASS
- G0：18/18 真实冻结字节重算；DONE→READY/MANIFEST/ZIP 链自洽；无穿越。
- G2：变化项逐行回源全准；不变项 hash 绑定明确（RESULT.json `evidenceBinding` 字段逐件记录 r1-bound / r2-reverified）。

## 全链闭环
| 版本 | sealId | 判定 | 说明 |
| --- | --- | --- | --- |
| nb-78 | seal-9a07b90e37406736 | revision_required（2/16） | NB78-F01~F16（行锚漂移类） |
| nb-78-r1 | seal-5f50b9204af138a2 | revision_required（12/6） | 源篇闭环；测试表滞留 NB78R-F01~F06 |
| nb-78-r2 | seal-26e8e696efe7ea61 | **accepted（18/18）** | NB78R 全闭环 |

## 合入建议
18 篇 acceptedHashes（r2 现 hash）全部可合入；整合由 lead。

## 证据文件
`reviews/nb-78-r2/RESULT.json`｜`REVIEWED-HASHES.json`｜`DONE.json`｜`handoffs/nb-78-r2-REVIEW-TO-AUTHOR.md`/`-TO-LEAD.md`（父版 reviews/nb-78、nb-78-r1 均保留）
