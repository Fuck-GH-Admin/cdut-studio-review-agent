# G05-T01｜面向 E r02 的只读验收接续（D作者交接，不执行E）

来源审计 E r01 HEAD：`0d5a1f493b2aeadcc6d65503a433e19a052ae539`。D原作者只提供资产和证据，不更改审计 E r01 文档。

## 按 E 阶段复核

- **E0**：将 T01 原三份 ZIP 实际取回、复算原 SHA；由管理员提供 EVALUATION 受控 object 版本、正式白名单、授权可读测试和未授权拒绝测试。未完成则 `BLOCKED_INPUT / ACL_PENDING`。
- **E1**：独立查 A/B/官方来源及封闭模拟政策边界，盲审者在事实锁定前不得取得逐案 Gold。T01 独立性只有原D作者自述；不把它等同第三方确认。
- **E2**：E1锁定后按最小权限向 E2 提供只读受控 Gold 和可信 mock，检查 C 版本/Gold来源和许可边界；绝不以 C 反推修改原 Gold。
- **E3**：复验输入无答案泄漏、附件证据引用、可信底账与输入分离、图片扫描文件等；原 D 的扫描视觉检查仅作过抽样，不能代称全量检查。
- **E4**：由 E r02 形成新裁定与差异记录，旧 E r01 `BLOCKED_INPUT` 保持历史事实，不由本D会话关闭。

## 来源及责任限制

- T01原 D : `FROZEN_GOLD_v1`，28案；原D Git commit `NOT_AVAILABLE`。
- 作者 Gold 初次冻结日期 `2026-10-13` 仅是原 manifest 自报；没有独立可信时间戳。
- CDUT当年统一会议资助规则尚有 `SOURCE_PENDING`，D用封闭模拟政策构造确定性Gold；不得据此编造CDUT强制拒件。
- `G05-T04` 的聚合 Gold 暴露事件和 `G05-T02` 的曾接触 C 事件由各自责任会话处理，不能合并到 T01 问题。
- `C_CROSS_ACCEPTANCE=NOT_IN_SCOPE_FOR_D`, `RUNTIME_VALIDATION=NOT_IN_SCOPE_FOR_D`。

**交接状态：`METADATA_VERIFIED / ORIGINAL_ASSETS_BYTE_VERIFIED / ACL_PENDING / E_R02_NOT_RUN`**。