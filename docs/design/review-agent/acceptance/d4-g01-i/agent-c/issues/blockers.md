# Agent C C0｜问题归因（未运行产品、未读 Gold）

**C-ENGINE-01 / BLOCKER：G01-I typed Target 和多轴实例化缺失。** D3-R0 `review-d2-runtime.ts` 的 `validateTargets` 仅识别 `campus-card/archive-item/archive-operation`，而任何配置 `scenarios` 的模板又必须提供唯一的校园卡 Subject；A 的固定 G01 工作区关闭了情景，结果 49 条通用语义规则全部是 case scope，不能区分 B 的 field、学生层次、学籍阶段和意图。最小补充：`student-identity-correction` typed subject/claim、按申请字段和已知条件动态实例化，未知条件 fail-closed。

**C-ENGINE-02 / BLOCKER：Claim↔Evidence 多事实关联无法保真。** `compileD2RuntimePlan` 直接以 `D2_UNMAPPED_ADVANCED` 拒绝任何非空高级关系；现行 `evidence-any` 不等于一般一证多事实/合法替代关系。最小补充：带版本、目标、来源确认及合法替代关系的 evidence graph，支持版本更新不继承旧验证。

**C-ENGINE-03 / MAJOR：typed 申报事实与可信事实源缺口。** 仅凭 `caseFields` 不改变编译计划，申报旧值不能当注册底账；fixture 不是授权学籍 API。最小补充：分离申请陈述与可信快照/机关核验状态，精确绑定各字段与证据版本。

**C-POLICY-04 / POLICY_HOLD：2026 成都理工现行表单、研究生/来华交叉规程以及审签权限未证实。** C01/C02 公开旧版、C03 新版存在迹象而非全文、C04 历史，外校 E 项不得替代本校现行制度。

**C-ENV-05 / TEST LIMITATION：** 无 Bun、不能直连克隆，因此 C 未生成独立 D2 Case ID / Run ID / Pi 回执。单独提交的 Bun 回归测试待 C-branch CI 证实执行，不得以 A CI 的 PASS 冒充 C PASS。

**尚不能归因：** C0 没有通过独立运行业务识别到可归咎 A 的确定模板制作错误；B 真实输入封包内部一致（非业务金标准认证），Gold 尚未读取，无权断言 Gold 对错。
