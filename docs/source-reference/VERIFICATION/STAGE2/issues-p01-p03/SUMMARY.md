# STAGE2 issues-p01-p03 对账 SUMMARY（2026-10-23T21:57Z，DSH docs-r07-qa-extra-04-20261024，MiMo/max）

- 依据：inventory/OPEN-ISSUES.json（dsh-r07-open-issues/1，1301 条/674 stillOpen，generatedAt 21:29:03Z）、inventory/FILES.tsv owner 划区、inventory/ACCEPTED.json（2255 files/222 batches exact-hash 合入账）、manager/TEAM-FILE-OWNERSHIP.json（21:25:05Z，uniquePrimaryAuthor）、candidate/source-reference 实 hash、reviews/* 封版复核账、冻结源 05fb2565（只读）。
- **划区**：按 source 路径在 FILES.tsv 的 owner（p01-app-shell/p02-agent-runtime/p03-integrations），不按旧会话名。本轨 **557 条**（p01 191/p02 280/p03 86），全部逐条落位（零静默丢弃）。非本区 744 条（p08 267/p07 107/p05 78/p04 56/p06 22/NOMAP 214）不在本轨，NOMAP 多为无 source 路径的批级/跨文件声明（如「(共通链)」「（全 18 篇 frontmatter）」），留全局合账。

## 分桶（557 全落位，RECONCILIATION.json counts）

| 状态 | 数 | 含义 |
| --- | --- | --- |
| CLOSED_SUPERSEDED_PREVERIFIED | 153 | 既有账已记「被新复验覆盖」，本轮保留记录不重开 |
| CLOSED_MERGED_PREVERIFIED | 29 | 既有账已记合入关闭，保留记录 |
| CLOSED_THREE_PROOFS | 2 | 本轮按关闭三证关（新 seal + 独立复核 accepted + candidate exact hash） |
| DEDUP_HISTORY_OF_CURRENT | 7 | 同根因多版折叠为历史映射（14 个 (id,file) 重复组） |
| INFO_HASH_EQUAL_RECORD | 20 | NB-136-R1/NB-144-R1-HASH-EQUAL 等 rN hash 等价标记（信息性，非缺陷） |
| **OPEN_DOC_ERROR_UNFIXED** | 23 | 同 hash 未改的事实/计数/引用错误 → 作者定向修复 |
| **VERIFIED_THIS_PASS_ERROR_PERSISTS** | 9 | 本轮实证坐实仍错（含家族副本）→ 作者定向修复 |
| DOCUMENTED_IMPLEMENTATION_GAP | 1 | 实现缺陷已如实入册（恢复 running 派生不可达分支）→ 产品待决，非文档错 |
| PENDING_REVERIFICATION_MANUAL_CHANGED | 139 | 发现后手册已改字节 → **待验**（不能沿用旧断言，也未证已修） |
| PENDING_VERIFICATION_AUTHOR_CLAIMED | 27 | 仅作者自称修（rN 已封）→ **待验**，未独立复核不冒充已验 |
| PENDING_VERIFICATION_TEST_CLAIM | 6 | 测试存在性/行为断言 → 待验 |
| OPEN_NEEDS_SOURCE_VERIFICATION | 140 | 本轮证据缺口（见下） |
| UNVERIFIED_TIMESTAMP_METADATA | 1 | future/历史时间戳记录 UNVERIFIED；源码 hash 证据保留，seal 不动 |

## 本轮实证抽查（3 项，静态）

1. **IDX-G01-F-01（blocking，LICENSE）**：`git log --diff-filter=A` LICENSE 首次添加于 `6382c6a2`（chore(license):…）≠ 初始提交 `019f64e8` →「随仓库初始提交引入」**不实**，坐实为文档事实错误。
2. **comment.py 行号漂移（N-01）**：`grep -n` TEMPLATE_DIR 实为 **:25**（手册 :22）、shutil.copy(comments.xml) 实为 **:236**（手册 :235）→ 坐实。
3. **IDX-G08-F-01（.pyc 来源行）**：FILES.tsv change 列实为 **r03_pr44**（索引行写 unchanged_since_093f）→ 坐实（该 finding 为 6 文件家族声明，本轮核 1 行代表，家族其余行标部分证据）。

## 证据缺口（不虚报完整，30 分钟窗口内未尽项）

- **140 条 OPEN_NEEDS_SOURCE_VERIFICATION**：claim 空（75 条）或语义不能机械定性（索引来源行/provenance 类），需逐条源级核对。家族分布：nb-139(20)、nb-73(17)、nb-138(11)、index-p03 demo-data(9)、docx-scripts(7)、nb-66(7)、nb-65(6)、nb-75(6)、skill-creator(4)、nb-136-r1(4)、nb-144-r1(4)、nb-60(4)、其余散。
- **139 条 PENDING_REVERIFICATION_MANUAL_CHANGED**：手册在发现后已改（hash 变化），旧断言既不能沿用也不能视为已修——需对照当前 manual hash 复验；其中 vendor-xsd ISO-IEC29500 家族 135 条为同一根因批（手工表 27 行/xlsx 零加载口径），可家族化复验。
- **27 条作者自称修**（nb-94-r1 家族 18 篇行号重导等）：rN 已封但无独立复核记录，维持待验（非阻断≠已修、自称≠已验）。
- 关闭口径坚持「非阻断≠已修」：文件级 accepted 不关闭 errata 注记，除非明确覆盖（本次仅 2 条满足三证）。

## 边界

未改产品/测试/依赖/作者 seal/已有 review/candidate/全局 OPEN-ISSUES（只写 manager/STAGE2/issues-p01-p03/ 与一份 lead handoff）；静态断言未冒充实测；NOT_RUN=产品测试/typecheck/构建/GUI/真实运行；新时间戳 date -u（21:29-21:57Z）；历史 future 时间只记 UNVERIFIED。
