# E4 r02｜有限复验的可重放记录

| ID | 实测对象 | 旧版 | 新版 | E本轮检验及其局限 | 结果 |
|---|---|---|---|---|---|
| R02-RET-01 | T02原输入/Gold/overlay/test reports | r01 SHA：86d3ac2c…/cf3fe933…/8e7c4caa…/38a8fa28… | 不变 | 本地逐ZIP重新SHA，与r01清单一致 | PRESERVED_HASH_PASS |
| R02-RET-02 | T02新增输入 | 原D32案 | 14案TC-033..046，SHA be657d17… | 70条ZIP CRC PASS、14manifest路径无缺和无孤儿，目录不含Gold | INPUT_STRUCTURE_PASS; GOLD_NOT_REVIEWED |
| R02-RET-03 | T02私有Gold+32锚点 | 原D Gold SHA cf3fe933… | 新包SHA ad95f709… | **仅哈希**；无ACL不解包；作者内部公开清单JSON报告04993294…，发生冲突 | P1_HASH_MANIFEST_CONFLICT + ACL_BLOCKED |
| R02-RET-04 | T03原输入/Gold/报告 | r01 SHA 68bc0982…/fabc24f4…/c3890d1e… | 不变 | 全部原SHA匹配 | PRESERVED_HASH_PASS |
| R02-RET-05 | T03新增输入 | 原30案 | 28案TC-031..058，SHA 56248ec8… | 150文件 CRC PASS；28manifest引用均存在；目录无Gold | INPUT_STRUCTURE_PASS; GOLD_NOT_REVIEWED |
| R02-RET-06 | T03公开覆盖表 | r01 44/52 | 公开称52/52 | 52条rule计数，原正计数44，新8，delta案例总数28；**没有私有rule-case映射** | COVERAGE_COUNT_ONLY_PASS |
| R02-RET-07 | T03新增私有Gold | 原30案 | SHA 56f0ab40… | 仅真实ZIP字节哈希；作者自述28新Gold但ACL不明 | HASH_ONLY; SEMANTIC_BLOCKED |
| R02-RET-08 | T02/T03官方来源 | r01 E1 Lock | 2026-10-15官网补查 | 校级建议实名、学院匿名不回、党政办处理来信职责再次交叉可见；未取得非卡校规/再办API | SOURCE_PARTIAL / NONBLIND_CORROBORATION |
| R02-RET-09 | G08 A跨域路由 | A v0.2.1原SHA dbbf9621… | 无新A冻结输入 | A新目标模板ID文件未提交，继承旧结论 | NOT_RUN_NO_NEW_A |

**实际复验成功范围只有文件和公开规则计数的证据强度**；新Gold语义、老32案锚点、D21 TC003/TC020语义均未独立复核。E不得代D作者把自检提升成E PASS。
