# Dev-B B4/B1 R12｜真实原文字节补证、三项业务义务风险与作者交互安全修复

**身份**：Dev-B R12 Owner-only 工程增量。工程 PR #142 基线 `45809553d19b6fba731fd7edb813ebbb81071031`；C0=`5682057c7232c914e72fdae525ce95fd33f32b53`；正式 I2 B 来源锁仍为 `bf88320e57b20ebc2023f27665c544ce2ba72ce4`，本批不能自行改变。

## 1. 三份历史 Markdown 原件实际独立复验

使用用户已授权 Library 返回的原始 `raw_file` 字节，隔离工作目录内直接执行 SHA256，不使用语义索引片段、文本提取、换行/Unicode 规范化或元数据摘要冒充原件。具体 SHA 和字节长度存储于 `B4-3-ORIGINAL-RAW-RECOVERY-R12.json`。R11 旧原件账保持只读，新增 R12 增量记录。

| 原件 | 原字节长度 | sha256sum（完整） | 对照 R11 | 检查 |
|---|---:|---|---|---|
| G03-T12 | 108510 | a6c7131a8b8dbf5e14cfab532d0eaa7db880ef09237c18045bedf7df3325dd8b | 原缺失 | MATCH |
| G04-T03 | 137268 | 9c889be9151854cbe43e3e94f5389c2a5fa0619e5e90867b14c117cee8e03cee | 原缺失 | MATCH |
| G06-T06 | 65558 | 77f89ac22112477e472d03cbac2696a1a58760dfec38466fe6bce8ee2db75204 | 原缺失 | MATCH |

历史原始字节证据 **43/50 → 46/50**。R11 的未找到 3 项现在有独立原件证据；另外 4 项 **G02-T03/G04-T06/G06-T01(v0.1.1)/G08-T03** 仍因原件不同版本或不同哈希隔离。不得修改 D4 冻结摘要凑齐 50。

**强制边界**：`46/50 raw identity MATCH` 不表示独立 Gold、当前有效校规、签发权或 Check 无损差分。所有 50 仍 `candidate-held`、`publicationAllowed=false`，4,163 source applicability 未被证明，G01 34 scope UNKNOWN 保持阻断。

## 2. 本轮针对已找回三份原件开始的业务义务差分（证据索引，不签业务通过）

以下是实际原文和 D4 技术 Check 库并读后的初步风险区；`PENDING_SEMANTIC_DIFF` 不等于“确认遗失”，也不等于“已验证保留”。D4 对应技术 Check 59 + 128 + 64 = **251** 条；存在工作区记录并不足以证明语义等价。

| 原件/业务主张（精确原文字段或行） | D4 技术映射现状 | 待证明的业务无损条件 | 本轮状态 |
|---|---|---|---|
| G03-T12:L22/L32/L60 单案多片区/时段按 `scope_item_id` 独立，馆方许可不可由旁支代替 | `g03-t12` 59 Check，存在 `c-multiple-slots` 及“整案许可禁区”等条目 | Check×物理场馆区段×时间×有权签发来源是否各自保留；部分批准是否只在校规允许时展示；unknown 不作“无需审查” | PENDING_SEMANTIC_DIFF |
| G04-T03:L13/L14/L72/L877 人×室×scope×action×policy 独立 `unit_id`，参观例外不得升级操作者资格，全案结果是向量而非单布尔 | `d4-g04-t03` 128 Check，含 `r19/r34/r38/r44` 与参观未知条目 | 必须查多个同案对象的独立状态/撤权/审核回执，不能只凭存在“资格”标题认定责任及分支无损 | PENDING_SEMANTIC_DIFF |
| G06-T06:L4/L34/L37–48 逐 `ReleaseAction`、Claim、Asset 核验，BR-01…06 三值；L11 未得审批系统则 `PENDING_AUTHORITY` | `g06-t06` 64 Check，BR-01…06 和逐渠道授权条目存在 | 逐渠道发布/修改/撤稿操作与素材许可范围，是否真的按动作、主张、素材细分；真实审批不可由技术预审升级 | PENDING_SEMANTIC_DIFF |

**下一层差分方法**：按原文条款建立 `(sourceSha256, line, business unit, condition, authority, expected behavior)` → `(workspace CheckID, scope, SourceRef, human responsibility, version)` 双向账；对“无匹配/一对多/推断改变”给出 `MISSING/ALTERED/AMBIGUOUS/TRACEABLE`，在 C/校方授权前不升级 policy/Gold 判定。只有被原文字节证实且技术映射可以逐项复核的结论才可标为技术语义核对完成。

## 3. B1 作者输入交互防护

在 R11 B1BufferedIdentityInput 基础上补：IME 活跃时 blur 不提交不完整 ID；组合期 Escape 交还 IME；compositionEnd 与 Enter 同按键不误提交；聚焦编辑期间 Main/父组件修改原值时旧缓冲失焦不覆盖新值。提交决策抽为纯函数，由 Bun 反例检查，业务标识合法性和引用级联仍由既有 `renameB1AuthorIdentity`。作者三类列表使用身份键而非 index，避免删除/重排后另一个身份复用前一输入框的草稿缓冲。**尚未执行真实 Electron 中文 IME Gate E**，本批不冒充真人第51套 UAT。

## 4. Gate 与协作

本批源码、补证元数据及测试只归 B 所有，不修改 Main IPC、Preload、C2 业务 Writer、正式 Publisher 或独立 Gold。Gate O 必须以新提交精确 SHA 的 PR CI/D2/Baseline 实测为准；Gate E NOT_RUN，Gate L BLOCKED_NO_AUTH，Gate P PARTIAL。I2 维持上述 R10 B 锁；新 B SHA 如需技术切片集成，须交 C 签明确新锚点并由 I 独立跑集成 Gate O。
