# 04｜复用、重构、重写、退役比较
## 反事实判断
“V3 今天新建是否仍要主动实现此用户价值？”回答为 YES 并不意味着需要继承对应旧代码。逐项 action/证据在 01/08。**直接复用只代表候选层，第二轮需重新运行测试与检查调用边界**。

| 方案 | 能力 ID | 理由与风险 |
|---|---|---|
| REUSE（代码候选） | CASE-02, TPL-04, RUN-02, RUN-06, BG-03, BAT-02, BAT-05, BAT-08, IN-02 | 小边界明确：事务、模块摘要、完整覆盖、批次锁、分流、角色解析；仍需集成回归 |
| REFACTOR（保留能力） | UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, CASE-01, CASE-03, CASE-04, CASE-05, CASE-06, CASE-07, CASE-08, CASE-09, CASE-10, CASE-11, CASE-12, TPL-02, TPL-03, TPL-05, TPL-06, TPL-07, RUN-01, RUN-03, RUN-04, RUN-05, RUN-07, BG-01, BG-02, BG-04, BG-05, BG-07, BAT-01, BAT-03, BAT-04, BAT-06, BAT-07, DOC-01, DOC-02, DOC-04, IN-01, IN-04, IN-05, IN-06, IN-07 | V1/V2 对象归一，统一执行与数据权威，组件体验可改 |
| REIMPLEMENT（保留需求） | IN-03, EXP-01, EXT-01, RET-02 | 路由器、学校接口、旧虚拟 Run 以及大结果工具需要按真实约束重做 |
| PRESERVE_TESTS（保留证据/不强拷代码） | TPL-01, TPL-09, BG-06, DOC-03, EXP-03, EXP-04, EXP-05, EXP-06, EXP-07, EXP-08 | 保留事故输入、差分、来源失败判据、可复跑的测试与阻断 |
| INVESTIGATE（禁止预断） | TPL-08, EXP-02 | 八域候选/Docling 等尚缺独立业务和工程选型证据 |
| RETIRE（仅实现） | RET-01, RET-03 | D0.5 的平行 demo 状态机、两模板硬编码检索；退役前先迁移业务语义/测试 |

## 重复实现的四个真实比较
1. **V1 `case-store.ts` 与 V2 `case-store-v2.ts`**：V1 存文档块/ReviewCase 并有 revision 写队列；V2 `submitCommand` 有请求哈希幂等、CAS 和 receipt。可借鉴 V1 的用户材料资产与 Renderer 交互，V3 不能让同一业务事实在两处互为权威。第二轮要画出写入口和迁移矩阵。
2. **D4 `review-d4-case-batch.ts` 与 P06 `batch-store.ts`**：前者导入原件/批量建案和 skip/token，后者调度已存在的 V2 案卷/Run/批量处理。两者名称近但用户任务不同，**不是可以直接删除其一的等价重造**。
3. **D0.5 `semantic-module-demo.ts` 与 D1/D2/D3 真工具链**：前者用于模块编辑/预览实验，后者维护来源/Plan/冻结与运行责任。产品需要无代码模板制作，不需要两套业务真值状态机。
4. **D4 `pi-review-submit-repair.ts` 与 P06 `pi-review-agent-client.ts`**：前者把被拒/漏项作为模型修复指南，后者在 SDK 完成/达到上限时检查 requiredToolKeys；互补而非完全替代。
5. **P06 R02 独立 `batch-run-provenance.ts` 与 R03 内联 `entry.runId`**：源码文件消失不能判断安全约束消失；应比较旧测试行为全矩阵、断电恢复与历史空绑定兼容。
6. **V1 UI `SourceBlockView` 与 V2 来源索引 `source-index.ts`**：展示层与证据真值层是两个信任边界；不该以有高亮为由取消后台来源验证。

## 建议暂不维护的实现
RET-01 演示状态机作为生产平行内核、RET-02 合成 `run@rev` 正式签署来源、RET-03 两模板固定词表作为 V3 推荐引擎。分别保留其 **可理解的模板预览**、**可信 Run 追溯需求**、**人工确认和保守路由**，再迁移代码依赖后退役。
