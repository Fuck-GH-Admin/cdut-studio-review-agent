# NB-89 独立 QA 验收报告（D0）

- 批次 `nb-89`（p08-renderer-ui · p08.content-review 纯函数层，18 文件 / 2113 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-f43ff3760c5b3215`（19:18:17Z）；QA `docs-r07-qa-nb-06-20261023`（19:00:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（3 minor，每文件恰 1 条）
- **NOT_RUN**（8 测试文件 43 用例静态读断言）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-89-SCOPE。

## G2 — 逐文件（18 文件 2113 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| review-v3-t06-physical-intake.ts | accepted | NB89-N1（"14 导出" vs 20，grep 定案） |
| review-v3-t06-template-route.ts | accepted | NB89-N2（"6 导出" vs 7） |
| review-v3-t08-case-report.ts | accepted | NB89-N3（"10 导出" vs 11） |
| 其余 15 篇 | accepted | — |

**红线逐条对源命中**（本批是 nb-85/86 组件背后的纯函数层，安全语义最密）：
- **t08-case-report**：学生版 8 项内部信息零泄露（测试逐一锁定：内部政策/暗号/证据原文/诊断/observation IDs）、历史报告不混当前字段、JDG-12 无快照如实声明"不另行重算"、ASSET-10 恢复前决定标历史、RUN-31 未授权提示、`t08AssistantContext` 材料仅事实引用非指令+截断声明；
- **t06-physical-intake**：entryId 不透明令牌非本地路径、重复路径（NFC 大小写不敏感）与 `../` 穿越**提交前拒**、剥壳显式、根文件不静默归属、仅完整导入案卷进批次、零导入不报成功批；
- **t06-batch-intake**：文件名不作身份、CSV 公式注入防护（`='` 前缀转义）；
- **t08-suggestion**：AI 建议是散文非命令、非 text 类型拒存（防 Main 落 text 降级）；
- **t09-offline-form**：`</script>` 注入防护（`\u003c` 转义）、哈希仅完整性非认证声明、附件 16MB/40MB；
- **t05-stage-actions**：能力投影非授权令牌、缺投影禁旧式降级提交；
- **t08-pdf**：真实 A4 多页 PDF+xref 偏移校验。

## findings（3 minor，导出计数口径）

14→20、6→7、10→11（每文件恰 1 条）。无行为/红线/测试存在性错误。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-89/RESULT.json.acceptedHashes`，脚本生成三方核验）；3 findings 记 ACCEPTED-ERRATA，G4 前关闭。
