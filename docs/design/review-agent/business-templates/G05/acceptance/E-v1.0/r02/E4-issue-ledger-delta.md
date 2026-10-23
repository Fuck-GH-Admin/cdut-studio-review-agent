# G05 E r02｜问题差分台账（不覆盖r01）

基线：`audit/g05-e-v1-r01@0d5a1f493b2aeadcc6d65503a433e19a052ae539`。2026-10-15。全部业务语义复算`NOT_RUN`；没有E本人取得受控Gold。作者Git补证SHA仅证明**新增公开说明**，不追溯为D旧生产提交。

| 问题编号 | r01原始内容/门槛 | r02新证据 | 差分裁定 | 关闭仍需 |
|---|---|---|---|---|
| E-G05-E0-001 | A/B/C/D完整包的固定SHA、真实可达、来源版本链 | 本E独立重算可得A2份+B6份+C6份**单文件**SHA；六D作者新增原包自查声明，但无原作者Git commit、统一受控整包 | `PARTIALLY_EVIDENCED / OPEN(BLOCKED_INPUT)` | 每TXX完整A/B/C配套件和D包可复放不可变版本、作者交接链、E本人实算摘要 |
| E-G05-E0-002 | 六D受控Gold位置、具名ACL白名单与E只读/无权拒读实验 | T01～T06均新增原ZIP SHA和存储管理员请求；无实际私有对象URI/版本/访问日志 | `AUTHOR_METADATA_RECEIVED / ACL_PENDING / OPEN` | 6套私有不可变对象、正反向权限实测、E本人下载SHA与授权留痕 |
| E-G05-E0-003 | T04 E0看到聚合Gold统计；新未受污染E1独立判断 | 新`E0_SAFE_MANIFEST.json`仅脱敏路径/哈希/可达性，D作者泄漏复核记录；原汇总暴露历史不可逆 | `PREVENTIVE_METADATA_FIX_OBSERVED / FRESH_E1_PENDING / OPEN` | 检验不再向新E1流出旧统计、全新E1事实锁、Gold隔离/E2，原污染不得注销 |
| E-G05-E0-004 | T02原Gold制作前接触C，须证实或重建独立性 | PR#52公开承认同会话制作C后生成18案42项Gold；旧字节不变，无新Gold/独立作者 | `HISTORICAL_BREACH_CONFIRMED_BY_AUTHOR / NEW_D_PENDING / OPEN` | 新独立D作者从A+B/官方重建并冻结Gold，真实身份/读取日志/ACL，E独立复核 |
| E-G05-E0-005 | 最新统一树及邻领域版本；领域分并归属 | 尚无最新正式统一树与稳定A源提交；该项生产分支无实际整改 | `NO_AUTHOR_FIX_FOUND / OPEN` | 最新A v2.4目录与固定SHA、相邻领域正式归属、E3核验 |
| **E-G05-E0-006 (NEW)** | r01未立T03 D独立性专项；原则要求D独立于C | PR#55披露同一历史会话先制作C后制作D，28份原Gold | `NEW_P1_PROVENANCE_INDEPENDENCE / OPEN` | 与T02同等级隔离重建/充分独立E来源仲裁及访问日志，不能因旧Gold与C吻合而关闭 |

**NEW 006严重程度**：P1（Gold严格生产独立性不成立，对设计验收的强制修复）；目前未证明Gold答案业务错误、公开逐案泄漏或真实系统误批，**不凭空升为P0**。若日后证据显示答案泄漏导致独立评测失效，应按规范重新裁定P0。

**来源观察，尚不作缺陷票**：`SRC-G05-T06-2018-INTERNATIONAL`与`SRC-G05-T06-2025-MEETINGS`并存；2026效力及条款关系需新E1裁定。仅是有真实来源的风险，不推定C/D已错。

分类口径：r02作者公开文件给出原始ZIP SHA和作者自测结果，但不等于E对该ZIP的独立字节复算。被动C/D预览事件不能以换名和生成安全manifest视为历史盲审恢复。
