# G06-T04 D v2.1 原作者 E r01 定向证据补齐（2026-10-15）

**业务**：已有科研成果记录更正与去重。**责任边界**：D作者对原资产来源、隔离和独立性事实增量补证；不读取C正文，不改Gold，不更改E r01裁定。本次提交不是D在2026-10-13制作原资产的生产commit。

## 旧原件固定字节（本次重算SHA256、ZIP CRC均通过）

| 原资产 | SHA-256 | 结构 |
|---|---|---|
| G06-T04_INPUT_ONLY.zip | `5ac178ae622fcb04549bed1e1f00f7de6e56c3b1d7e7e40b1992dd4d8f1aa9eb` | 97文件；18案；18扫描PDF/34页 |
| G06-T04_EVALUATION_ONLY.zip | `e54054ad745526e7a5e7f6dbd7a441a4cfd2d364ef1c6016c0b2f57f19848737` | 42文件；18 Gold、18 mock底账；绝不进入公开Git |
| G06-T04_D_REPORTS.zip | `cc2b5c4994e3a0886d050551d7dfbabc13c2dc707fa897be1ce3fb481c01d57f` | 原报告6文件 |

原清单版本 `FROZEN_GOLD_v1`，冻结自述日期2026-10-13；ZIP时间戳不是独立可信的冻结时点证明。原三个ZIP未重打包，未修改任何案卷、Gold或mock。原冻结清单引用的7份A/B/D规范文件本轮均按字节SHA匹配（7/7），但B v0.1七文件原包/交接卡仍未完整取回。

## 独立性与访问控制的真实状态

- D原报告自述：Gold建成前未读C；本轮仍未读C正文。**未找到不可篡改的历史生成/读取过程日志**，故不是可独立证明的C隔离证据。
- 本轮材料检索暴露过C文件的**标题元数据**，未打开正文，属D冻结之后的可见性事实。
- Gold目前只有逻辑ZIP隔离；**无可核验的私有Gold ACL、授权访问人名单、ACL读回或未授权拒绝实测**。状态 `ACL_PENDING / PROCESS_LOG_NOT_AVAILABLE`。
- 原D生产Git SHA：`NOT_AVAILABLE`。本增量新Git SHA仅证明2026-10-15修复文档归档，不得冒称原作者D SHA。

## E r01正式依据

审计冻结 `audit/g06-e-v1-r01@1dcf4033256121efd3dea62b1153592df1facd7c`，阅读：
`E4-issue-ledger.md`、`E-final-verdict.md`、`E1-supplementary-evidence-20261014.md`及T04相关 `E1-official-fact-register.md`。
原 `E_DESIGN_ACCEPTANCE=BLOCKED_SOURCE`、E2/E3/E4未开始；本轮没有证据确定Gold内容缺陷，更未进行E重验。

T04 E1源义务：H中5条限定支持(Q02/Q03/Q07/Q08/Q12)，5条仍待来源(Q01/Q04/Q05/Q06/Q10)；M两条(Q09/Q11)仍待源。**这是T04来源状态，不是12个Gold错误；领域91项H缺口亦不是T04自身问题数。**

下一步：由A/B/校方来源责任人补CDUT学生/教师身份权限、已校级通过历史记录更正解锁、去重/误认领恢复及现行规则有效性；由**有权存储管理员**配置私有Gold ACL并提供真实读取/拒绝测试；独立E r02复核。未验证校本规定一律 `SOURCE_PENDING / RECHECK_AFTER_SOURCE_FIX`。

本文件只含公开安全的聚合元数据。原受限评估包、逐案Gold和可信底账**没有上传本公开分支**。
