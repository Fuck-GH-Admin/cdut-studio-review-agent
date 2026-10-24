# NB-55 独立 QA 验收报告（D0）

- 批次 `nb-55`（p02-agent-runtime · p02.adapters，10 文件 / 1870 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-a15b4c81cc7797fa`（17:21:53Z）；QA `docs-r07-qa-nb-06-20261023`（23:10:00Z）
- **batchVerdict：`accepted`（10/10）**；G0/G1 pass、G2 pass_with_findings（3 minor，每文件恰 1 条计数口径）
- **NOT_RUN**（批内 50 个测试用例静态读断言；runtime-smoke 依赖安装树，未执行）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 13 条目（10 manuals+MANIFEST+2 TSV）；10/10 manualHash；源绑定 10/10 = nb-55-SCOPE。

## G2 — 逐文件（10 文件 1870 行全文 + 10 篇手册全文）

全部 **accepted**。5 测试手册用例数/断言行号全对（watchdog 19、skill-resources 11（含 skipIf）、override 14、streaming 1、smoke 5）。17 个工具名逐一对名（direct 3 + C1 11 + C2 3）；watchdog 阈值推导链（env > transport−15s 保底 30s > 240s 默认）、isPathUnderRoots realpath 双侧+sep 防碰撞、Skill 加载 fail-closed 族（symlink/歧义/脱敏）、coalescer 节流余量语义全部与源码吻合。

**质量亮点**：pi-review-ops-tools 手册如实记录源码头注释与代码的矛盾（`:5` 称决定类"本模块不注册"但 `:544+` 以代批开关+指派双门注册 #12-14）；runtime-smoke 手册照实指出"名为可实例化、实为 dts 文本断言"；SOURCE-EVIDENCE.tsv 交叉引用可解析（交付内真实存在）。

## findings（3 minor，计数口径）

| id | 文件 | 问题 |
| --- | --- | --- |
| NB55-N1 | pi-review-ops-tools.ts.md | §10 "3 内部" vs §2 自列 4 个内部符号 |
| NB55-N2 | pi-review-watchdog.ts.md | §10 "12 导出" vs 实际 13（自家表 13 行） |
| NB55-N3 | pi-skill-resources.ts.md | "7 内部" vs 自列 8 名（口径未注明） |

## 合入（lead）

全 10 篇 acceptedHashes 可合（`reviews/nb-55/RESULT.json.acceptedHashes`，脚本生成三方核验）；3 findings 记 ACCEPTED-ERRATA，G4 前关闭。
