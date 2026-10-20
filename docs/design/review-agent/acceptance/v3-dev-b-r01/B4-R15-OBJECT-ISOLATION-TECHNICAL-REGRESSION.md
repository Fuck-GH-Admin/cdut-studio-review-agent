# B4 R15｜逐对象候选技术预览隔离：G03/G04/G06 回归

**目的**：补 R14 32 条高风险原文义务中出现的同案多区段、多人员实验室资格、多渠道发布动作的真实技术回归，而不是只比较原文标题。

- 新增 B-only `review-v3-b4-object-isolation.ts`：对作者候选 Plan 进行编译，调用真实 B1 `compileReviewB1Plan`，要求调用方明确列出整个待核验的 targetKey 集合，且每个 Check 恰好绑定这些 target；返回 Check×target×object×subject 的**逐对象技术适用性**，保留 `applicable/not-applicable/unknown`。结果永远 `authorizationGranted=false`、`schoolAuthorization=NOT_VERIFIED`、`publicationAllowed=false`。
- `review-v3-b4-object-isolation.test.ts`：三组**完全合成**的 G03-T12 体育场馆×时段、G04-T03 人×实验室×权限范围、G06-T06 行为×渠道×主张素材版本模拟用例；每组三个独立对象：A technical applicable、B unknown、C not-applicable，逐个验证独立对象、不丢对象、不同来源版本触发 fingerprint 变化/旧 descriptor 失效。
- 无校方学校许可、政策版本、真实原件或独立 Gold 的数据进入这些 fixture；**适用≠允许使用**，未知≠失败也≠通过，单个对象的候选技术适用不产生其它对象的业务许可。真正有权许可及责任验证仍需要 C Main+经授权的真实 SchoolPort，Gate L/E/P 未过。
- 与 R14 原文审计关系：G03 要核 `scope_item_id`，G04 要核 `person×lab×scope×action×policy`，G06 要核 `ReleaseAction×channel×Claim×Asset×version`；这些维度**尚未通过正式运行数据来源验证**。本批只形成可运行的逐对象隔离行为，不能把 32 条 `semanticValidated=false` 改 true。
