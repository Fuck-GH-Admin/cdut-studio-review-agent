# Dev-B R25｜原文恢复与规则条件证据工程验收（2026-10-20）

**仅 Dev-B 候选技术证据。** 不包含 Dev-C Main/Preload/shared/Case/Run/Writer 代码、政策签发、学校 Gold 或发布资格。#142 保持 Draft。

## 固定基线

B R24 最终精确 `3b05e0b35d11eb17b5326230a5efbc42dfb500c4`，旧同 SHA 3/3 Gate O success。D4 历史冻结 SHA `b68443b23293b4714e61a3b81383d3d3a56434fc`。R13 107 个原文规则锚点、R14 32 条高风险条款及 8 域 50 套/3875 Check 保持冻结不改。

本轮新增 B-owned：
- `review-v3-b4-r25-raw-clause-condition.ts`
- `review-v3-b4-r25-raw-clause-condition.test.ts`
- `B4-R25-INDEPENDENT-RAW-CLAUSE-PINS.json`
- 本验收记录。

## 全字节真实原文回收（没有上传原文）

从授权 Library `raw_file` 取得并独立计算实际全文件 SHA256，不做换行、标题或 Unicode 规范化：

| D4 源 | 原文文件（字节） | 实际 SHA256 | 结果 |
|---|---|---|---|
| G02-T03 | v0.1.1 (106542) | `e3d1d01555d49564931ac38892567ea23eab5ecd898afc3b67a8e4a26abe7380` | 与 D4 frozen 精确匹配 |
| G04-T06 | v0.1.1_E-G04-T06-0004 (186090) | `d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2` | 与 D4 frozen 精确匹配 |
| G08-T03 | R24 仅有 v0.1 不匹配版本 | frozen 原文 `f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec` 尚未找到 | 隔离不解除 |

历史原字节匹配证据由 **47/50 更新为 49/50**，但 50 套全部仍 `candidate-held/publicationAllowed=false`，不代表现行校内政策有效。

本轮亦从用户授权原件获取 G03-T12（108510 字节，sha256 `a6c7131a8b8dbf5e14cfab532d0eaa7db880ef09237c18045bedf7df3325dd8b`）、G04-T03（137268 字节，sha256 `9c889be9151854cbe43e3e94f5389c2a5fa0619e5e90867b14c117cee8e03cee`）、G06-T06（65558 字节，sha256 `77f89ac22112477e472d03cbac2696a1a58760dfec38466fe6bce8ee2db75204`）。三份完整 RAW 都与 D4 冻结版本 SHA 匹配。

## 32 条原文与技术业务条件差分

从上述真实原文字节按原始 Markdown 标题边界提取 32 条高风险规则体，为每条生成只包含原文 sourceSHA、heading 行号、非空正文 SHA256 的证据针脚；运行时同时验证 R13 全量 107 锚点、R14 32 风险记录、D4 Check/SourceRef 和逐条原文正文 digest。

已查出 R14 的 G06-T06/R-34 记录混入下节 8.1 的两行背景文字，R25 显式标 `NON_RULE_CONTEXT_APPENDED`，不偷偷作为 R-34 生效义务。

R24 已限制“物理来源 × 对象”；R25 再加 `templateId × ruleId × rawClauseSha256 × triggerLineSha256 × exactCheckSourceBindingSha256`。同一 SHA 原文中的 R-14 凭据不得用于 R-17；缺条款回执、旧条件、不同 Check、缺对象、跨人/场馆/渠道、未知条件均只能是技术 `unknown`。即使技术前提为 true/false，也不产生任何校方准许、Gold 或正式 Check PASS。

32 条历史规则技术适用性仍 `UNKNOWN_NOT_APPROVED`，`technicalPredicateImplemented=false`、`semanticValidated=false`，不能说历史业务条件已经完整等价。G01 34 scope / 全域 4163 SourceRef UNKNOWN 保持原样。

## 首败记录与回滚

- 初始 SHA `68ab7917a0d3a569ac41daf1b94ee71c117c8453`，PR CI `39347944990`、D2 `39347944988` TS18048，修复 `4c7939313a3bbe73a08f1fa1676b9a8de117bf5c`；未放宽安全门禁。
- SHA `4c7939313a3bbe73a08f1fa1676b9a8de117bf5c` PR CI `39348214504` Bun 首败：G06 R29 RAW hash 录入不完整；修复 `89b962fff944a225a3c27ad23a59564fcc153bb5`。
- SHA `89b962fff944a225a3c27ad23a59564fcc153bb5` PR CI `39348660597` 首败：G03 R22 RAW 摘录指纹误录；后用纯哈希定位并修复。
- SHA `985b1474dd81e323957fa35442b472cf44f65fb2` PR CI `39349072687` 抓到 G03 R22 指纹差异；后独立比对全部 32 指纹组并修复最后规则 R27/R34 的 Markdown 章节边界。最终源指纹机械分组 G03/G04/G06 与本地原件算出的结果逐组一致。

本轮回滚到 R24 的已验 SHA，保留 R19–R24 全部功能；只撤销 R25 B-owned 新来源/测试/文档。最终 Gate O 只由同一最终工程 SHA 的真实 GitHub PR CI、D2、Baseline + 原始 Bun 日志证明。Gate E `NOT_RUN`、Gate L `BLOCKED_NO_AUTH`、Gate P `NOT_RUN`、Release `NO_GO`。
