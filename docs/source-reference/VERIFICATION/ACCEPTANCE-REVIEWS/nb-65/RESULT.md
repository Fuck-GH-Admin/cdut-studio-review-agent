# NB-65 独立 QA 验收报告（D0）

- 批次 `nb-65`（p02-agent-runtime · p02.residual，18 文件 / 3789 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-334eed303c3c09c0`（17:41:44Z）；QA `docs-r07-qa-nb-06-20261023`（03:50:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（7 minor，每文件恰 1 条计数口径）
- **NOT_RUN**（批内 28 个测试用例静态读断言）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-65-SCOPE。

## G2 — 逐文件（18 文件 3789 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| conversation-manager.ts | accepted | NB65-N7（"24 导出" vs 28） |
| bridge-command-handler.ts | accepted | NB65-N6（"9 命令" vs 8） |
| chat-tool-config.ts | accepted | NB65-N5（"10 导出" vs 12） |
| bridge-registry.ts | accepted | NB65-N2（"7 导出" vs 8） |
| dev-instance.ts | accepted | NB65-N1（"5 导出" vs 6） |
| codex-oauth-service.ts | accepted | NB65-N3（"4 内部" vs 自列 5） |
| codex-plan-quota.ts | accepted | NB65-N4（"6 内部" vs 自列 7） |
| 其余 11 篇 | accepted | — |

复算命中：6 测试文件 **28 用例**（2/4/2/3/5/12）与断言行号全对（conversation-manager.test 12 用例/3 describe 全对）；DAG/activePath 严格 root→leaf 契约（setActivePath 四类抛错、删除清空**退根不退中间节点**、fork 兄弟语义）与 PR #121 注释吻合；GPT Image 凭据迁移四分支/空 apiKey 不覆盖/Key 不出主进程红线、bridge 自愈单飞+电源 1.5s/10s 双档、附件路径穿越守卫、codex 窗口 4.5h/6d 不误标全部逐条对源。dev-shell-shortcut 手册如实标注被测源不在本批。

## findings（7 minor，计数口径，脚本计数定案）

全部为"N 导出/N 内部/N 命令"计数与自家清单不符（多为合并行后少数符号）。无行为/红线/测试存在性错误。bridge-attachment-utils 的"6 内部"为分组行口径（导出 8 正确）并入批级备注。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-65/RESULT.json.acceptedHashes`，脚本生成三方核验）；7 findings 记 ACCEPTED-ERRATA，G4 前关闭。
