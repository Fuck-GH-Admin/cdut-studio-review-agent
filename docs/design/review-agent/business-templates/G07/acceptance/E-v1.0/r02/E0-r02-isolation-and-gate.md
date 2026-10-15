# G07 r02｜E0 信息隔离、可达性与 E1 预案

## 隔离检查

- 审查者读取：r01 E0 正式记录；G07 A 目录；作者公开 E0 manifest/交接与 Git **文件名、哈希、blob**；独立验证四个 `INPUT_ONLY.zip` 和一个 T02 B ZIP 的外层 SHA/CRC。
- 审查者未读取：七份 C 模板的具体业务规则正文；所有 D `EVALUATION_ONLY.zip` 内部成员、Gold 正确答案、逐案评分、私有可信台账；带 PRIVATE/CONTROLLED 名称的包和对应私有证据。
- 目前 **无已发现的 C/Gold 答案暴露**，只可记 `E1_BLINDING_INTACT_TO_DATE`。但 D Gold 的保管权限 **七套均 UNVERIFIED**；故不能把“没读答案”提升为“受控隔离已达标”。
- 作者侧声称输入和评价分包，E 仅核了 T02/T03/T04/T06 `INPUT_ONLY` 的压缩包路径关键词（无 Gold 名称），并非逐份业务语义泄漏审计；T01/T05/T07 当前未作 E 独立检查。
- Git 回收 commit 与原作者制作 commit 概念分离：七份 C 当前 Git blob 稳定存在，但绝大多数原制作 Git commit 为 `NOT_AVAILABLE`；D 亦同。独立性时间顺序不可从归档后的 SHA 推导。

## E1 锁定前必须完成

1. 恢复全量 A-v0.2 来源清单（`G07_03_来源索引.md` 已找到一致拷贝）；7 套 B 的完整条款索引和原始来源，明确缺少哪些子项。缺失校本原文标 `POLICY_PENDING`，不可从 C/D 反推。
2. H 全量先登记：七套的资格/代理/收款人权限、审批与拨款角色、强制材料与合法替代、科研与非科研经费的规则切分、采购事前 vs 合同付款、差旅无票例外、劳务与专家酬金条件、主办活动规则、借款责任/冲账、敏感身份与账户信息。
3. M 按独立机制+逐模板分支事前取样；L 用完整规则分母随机/分层抽样，记录纳入/排除规则。当前缺 B 全量，因此 H/M/L **未锁定**，不可事后挑选。
4. 官方依据须取得可定位当前适用版本、施行时间、适用人和决定主体。外校参考只登记 `CROSS_SCHOOL_REFERENCE`，不能推成成都理工强制退件。
5. 形成 `E1-official-fact-register.md`、`E1-adversarial-hypotheses.md`，然后先生成 `E1-evidence-lock.json` 与文件 SHA256 并提交固定审计 commit。之后才有资格打开 C 与受控 Gold，进入 E2。

目前状态：**`E0 BLOCKED_INPUT`，E1 NOT_STARTED**。本计划不是 E1 完成报告。
