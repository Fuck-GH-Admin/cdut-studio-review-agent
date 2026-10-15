# G04-T02｜E r02 复验对接与 ACL 管理员任务

**问题：E-G04-GLOBAL-0003（T02部分），仍 OPEN**。审计冻结`audit/g04-e-v1-r01@fc2ace5c874454ddbcfca731be7aa093416dab12`未被修改。本轮未读C正文，未修 Gold，未运行E或真实系统。

## 管理员必须补齐（尚未完成）
1. 将原SHA `c81d27287d7b13f2f5fcf4b6bbf225108fcc54461613b287b77dc21991f24e33` 的EVALUATION_ONLY原件置于有可验证对象版本的受控私有存储，不经公共Git、PR、CI日志、release或公开artifact传递。
2. 在授权环境核验D作者、独立E、C作者、公用CI/令牌的对象级访问权限、权限生效时间及是否可下载；不在公开文档披露具体成员名单或私密URL。
3. 向E提供读/下载/分享/权限修改日志及真实覆盖窗口；不可恢复的历史必须记`HISTORICAL_LOGS_NOT_AVAILABLE`，**不可伪造曾经存在的ACL/访问日志**。
4. 有范围地检查Git全历史、PR附件、公开Actions、下载链接泄漏，并标明实际检查范围。如果确证C在Gold冻结前看到Gold，或D构建前曾看C作者答案，追踪受影响案例交新独立D重建。**缺ACL本身不是泄漏证明**。

## E r02检验清单
| 轮次 | 要复验 | 当前T02状态 |
|---|---|---|
| E0 | 三ZIP旧SHA、30案及205输入文件哈希、原/增量版本、私有ACL与访问日志、INPUT/EVAL分离 | ZIP及哈希匹配；ACL阻断未关 |
| E1 | 2022 CDUT因公通知是否仅历史生效、2026当前授权/时限，**仅新权威来源出现后**复核 | SOURCE_PENDING；本轮无新校规 |
| E2 | C/GOLD制作独立性、原模拟政策与Gold是否一致；**只在确证污染/新源冲突后**有控制地重建影响案 | Gold v1.0不变，未逐案重判 |
| E3 | T02临时访客与T01门禁、T08年卡、T06活动举办批准；A N18驻场与T07动火 | N18责任归A/来源owner，未本轮解决 |
| E4 | 对新增可核证据签发独立差分复验裁定 | NOT_RUN，原问题OPEN |

公开归档范围：本目录3份脱敏MD与非答案摘要。**不允许提交** EVALUATION_ONLY、Gold、trusted_fixtures、coverage含答案CSV、scoring及其索引。原INPUT_ONLY待项目单独做公开审查。

原D作者Gold首次Git提交=`NOT_AVAILABLE`；本轮提交仅为2026-10-15增量修复证据。