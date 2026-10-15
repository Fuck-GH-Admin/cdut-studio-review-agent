# G07 E r02｜问题/依赖差分台账

> r01 只有 `E0-decision.md` 的 **三条未编号阻断要求**，并无 E1/E2 业务缺陷票。下列 `E-G07-R02-` 为本轮新设的追踪编号，**不能伪称 r01 原问题 ID**。不读取 D Gold、不把来源缺口直接当 C/D 过错。

| 跟踪号 | r01 原项 | 原要求 | r02 收到的新交付 | 本 E 复验/剩余项 | 当前结论 | 责任方 |
|---|---|---|---|---|---|---|
| E-G07-R02-E0-001 | E0-decision 阻断1 | 七套 A/B/C/D 完整固定路径、SHA、作者版本与上游依赖 | 七个 C 作者 Git 存档、新 A 来源索引、七个 D 公开补证分支、T02 B ZIP | C 母版七个 Git blob 实测存在；T02 B SHA/CRC 相符；其他 B 来源片段缺、私有 D 原包未获可认证访问；无旧 C 冻结 SHA 故不能核实旧新语义 diff | **OPEN / PARTIAL_EVIDENCE** | A/B/C/D 作者、档案维护者 |
| E-G07-R02-E0-002 | E0-decision 阻断2 | Gold/盲输入隔离、ACL、制作独立性与可信版本链 | 七个 D 作者声明与 E0 manifest、四份 INPUT_ONLY 原包独立 SHA/CRC 一致 | 七套 Gold 私有对象/ACL allow-deny 实测与访问日志缺，旧时序无第三方核验；未读任何私有 Gold，T01/T05/T07 输入未独立核验 | **OPEN / ACL_UNVERIFIED** | D 作者、独立存储/权限管理员 |
| E-G07-R02-E0-003 | E0-decision 阻断3 | 事前 H/M/L 计划与 E1 源事实冻结，后读 C/D | 取得 A `G07_03_来源索引.md` 多份一致 Git blob、部分 B | 尚无完整七 T B 条款分母与原文事实锁；E1 不启动 | **OPEN / E1_NOT_STARTED** | 独立 E、A/B 原文保管者 |
| E-G07-R02-OBS-004 | r01 未记录；r02 新观察 | T06 D 报告计数应内部一致 | T06 D 作者称报告中 21案文字与23案实际不一致，以及 TC-021 vs TC-023 | E仅复核 INPUT_ONLY zip 206条目/CRC；原 D_REPORTS 未因潜在答案含量打开；需安全摘要版核对后再决定 P2 | **UNTRIAGED / AUTHOR_CLAIM** | D-T06 原作者、E 独立核验者 |
| E-G07-R02-OBS-005 | r01 未记录；r02 新观察 | D1 Gold 哈希算法与冻结时序可独立重放 | T03 D 公开 manifest 给出另一种新算法摘要 | 新摘要不能自动作为历史冻结时间证据；需原 D1 版本、明确算法和受控复算 | **OPEN / PROVENANCE_GAP** | D-T03、存储管理员 |

## 结案纪律

- 001 只有七份 C 的“位置和 Git blob 可重放子项”证据满足；其他子项并未修复完成。旧 r01 **BLOCKED_INPUT** 保留。
- 002 任何 `EVALUATION_ONLY.zip` 的 filename/存放于普通 ChatGPT Library 不证明最小权限；ACL 独立拒绝测试前不得视为通过；重新加密或改名不补历史独立性。
- 003 必须由 E 在读 C 和 D Gold 之前完成 H/M/L 冻结。尚无已核实 H 项，不能允许 E2。
- 未定级 OBS 不能被宣传为 P0/P1/P2 已判缺陷或算作已完成业务整改。E4 尚无真实业务修复复验。
