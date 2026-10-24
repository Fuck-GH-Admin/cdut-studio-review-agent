# NB-86 独立 QA 验收报告（D0）

- 批次 `nb-86`（p08-renderer-ui · p08.content-review 第二组，18 文件 / 4614 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-a0bf21b3ada5510f`（19:08:54Z）；QA `docs-r07-qa-nb-06-20261023`（16:30:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（2 minor，每文件恰 1 条）
- **NOT_RUN**（1 测试文件 3 用例静态读断言）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-86-SCOPE。

## G2 — 逐文件（18 文件 4614 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| V2CasePanel | accepted | NB86-N1（"6 导出" vs 5，grep 定案） |
| ReviewV3T06BatchIntakePreview | accepted | NB86-N2（"1 内部" vs 自列 2） |
| 其余 16 篇 | accepted | — |

**红线逐条对源命中**：模板发布门槛（validateEditor+T01 类型化校验、发布版不可覆盖、范本≠校内政策）；T07 量表由 Main 从已发布模板派生/评分算法归 Main/expectedRevision CAS/未初始化是正常态；T08 受众闸（audienceGrant 未授即 student，"下拉不会提升权限"）+ HTML 转义防注入；UnifiedRun 双回执互不冒充（规则≠完整审核/completed 仅技术结束/RUN-43 续跑需显式确认）；RightPanel 决定汇总按 basedOnRunId+inputHash 过滤当前认定、rejected 计 0、"确认该项问题≠整案驳回"；T09 recipient 是声明非身份/回件 80MB+type='reply' 校验/幂等导入；T10 零持久状态、不混案卷；SourceBlockView 精度降级角标（文件级≠已验证）；V2CasePanel UI-02/12/13 竞态防护 + T05 端口拒绝原因原样回传。

## findings（2 minor，计数口径）

6→5 导出、1→2 内部（每文件恰 1 条）。无行为/红线/测试存在性错误。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-86/RESULT.json.acceptedHashes`，脚本生成三方核验）；2 findings 记 ACCEPTED-ERRATA，G4 前关闭。
