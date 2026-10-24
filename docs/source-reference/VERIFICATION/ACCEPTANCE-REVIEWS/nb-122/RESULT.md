# NB-122 独立 QA 复核报告（RESULT.md）

- 批次：nb-122（p08-renderer-ui · p08.renderer-lib，18 文件 / 1402 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（只读）｜作者：docs-r07-author-extra-03-20261024 ｜ QA：docs-r07-qa-extra-03-20261024
- 封版：sealId `seal-065aa5a22bf529ea`（2026-10-23T20:22:41Z）；ZIP `74141B/21 条目`
- 复核时间：2026-10-23T21:40Z
- **batchVerdict：accepted（18/18；G0/G1/G2 PASS；1 条 minor 非阻断待勘误）**

## 判定摘要

18 篇手册逐篇真值审查通过。预读 Q1-Q7 全部如实处置；作者新增 4 项强声明回源**全部实锤**（含本批最有价值发现：`insertSessionReferenceMention` 全树 0 监听者、`inserted` 恒 false 与文件头注释矛盾）。测试计数 18/7/15/3/10/2 机械复算全对。1 条 minor 批内交叉引用不一致。

## G0（PASS）

MANIFEST `c2e22c38…`/READY/ZIP `d6325649…` 三方重算全对；manualSha256 18/18 四方一致；18/18 源绑定==manager scope。

## G1（PASS）

- 强声明复验：①`insertSessionReferenceMention`/`profer:insert-session-reference-mention` 全树 0 监听者（vs 头注释"由 AgentView 监听回写"——矛盾照实记录）；②`PANEL_ONLY_PREVIEW_EXTS` 零代码消费者（预留未接线）；③快捷键双表并存（`GLOBAL_SHORTCUT_DEFAULTS` global-shortcut-service.ts:21-23 + main/index.ts:1049-1050 注册）；④`AppShell.tsx:79` `isTeamWorkspace=false` 硬编码（行号精确）；⑤quoted 写/解析端 message_id/role 不对称（:51-52 写 vs :66-95 丢弃）。全部属实。
- COVERAGE 备注完整（18/18，min 28 字符）。

## G2（PASS + 1 minor）

- Q1 flag+default/archived 不对称（:21/:22/:38/:40）✓ 如实并注 14 消费文件；Q2 executionLabel 7 态覆盖缺口明示 ✓；Q3 `.bin` 重复 ✓；Q4 拖拽全局单例+同步回写语义 ✓；Q6 OFV 默认值语义标【推断】、`PreviewToolbarOptions` 标未知 ✓；Q7 无测试模块逐一注明 ✓。
- **预读 Q5 撤销**：shortcut-registry.ts:8-9 实为 DEFAULT_SHORTCUTS/SHORTCUT_MAP 消费者（预读检索模式漏报，manual 正确，以实证为准）。
- 内部一致性抽查：pi-harness 手册对 `interrupted`（执行态文案「已暂停」）与 goal 级 paused 徽标作层级区分；canManuallyContinue 明确"不校验 ready_task/shadow_mode"不冒充守卫。

### 非阻断 finding

| id | 对象 | 问题 |
|---|---|---|
| NB122-N-01 | session-status-visual.ts.md §10 | 称"不对称线索未找到落点"，实落点在同批 product-feature-flags.ts（UNVERIFIED §4.2 与该手册已载）——批内交叉引用不一致 |

## NOT_RUN

产品测试（panel 18/pi-harness 7/flags 15/quoted 3/blob 10/batcher 2 用例声明）、typecheck、build、Electron/GUI、真实 IPC/拖放/快捷键注册。

## 合入

lead 按 `reviews/nb-122/REVIEWED-HASHES.json` acceptedHashes（18 篇）合入；NB122-N-01 随勘误关闭。**extra-03 组 3 批全部完成真值审查**（nb-142 经 r1 闭合、nb-137 accepted、nb-122 accepted）。
