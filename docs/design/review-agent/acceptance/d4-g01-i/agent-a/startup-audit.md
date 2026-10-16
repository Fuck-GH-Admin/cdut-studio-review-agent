# G01-I D4 首次技术启动审计

- 技术代码严格固定于 `4b191c729f3d5f8135c73b87c17642023f6c3986`，创建分支 `test/d4-g01-i-template-r01`；未合并后续 main。
- 业务来源：`8989941b6fb5651564e32d11c4215b6a6d5a5209@docs/design/review-agent/business-templates/G01/originals/g01_student_identity_complete_template_v1.7.md`；独立按 UTF-8 字节复算 SHA-256 等于 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329`。Git Blob `aec737f471d4e648ab98a9243dcf4bc9939ce8a5`。
- 已核对源码：D1 `review-authoring-v1.ts` / `review-authoring-store-v1.ts`；D3 `review-d3-module-library.ts`；D2 `review-d2-runtime.ts` 与 `review-d2-execution-gates.ts`；共享类型 `review-authoring-v1.ts`、`review-d2.ts`、`review-d3.ts`。
- 源码支持：D1 `validate/save/read/diff`，D3 `validate/export/import`、冻结引用，D2 `preview/register/create` 技术预审；所有源规则仅为候选或请求范围，发布被拒止。
- 硬限制：D2 有情景模板必须指向唯一 `campus-card` target，其他仅允许 `archive-item/archive-operation`；G01-I 未有合法 `student-identity` target。不得冒充校园卡/档案业务。非情景模板可编译全案检查，但不能按 G01-I 多轴动态剪枝。
- D2 对 `advanced` 中非空 Claim/Evidence 关系采取 `D2_UNMAPPED_ADVANCED` 拒止。现有结构化 evidence-any 要求与 target subject 精确关联，无 G01-I subject target 时无法宣称已验证一证多事实。
- D1 candidate 对待核政策拒止 `UNVERIFIED_AUTHORITY`，带结构化 gate 时拒止 `D1_UNMAPPABLE_EXECUTION_GATE`。故本候选仅 D2 技术编译，不申请 D1 发布投影。
- B01 代理授权不合本案，拒绝共享；B02 合成证据来源边界有参考价值，但缺旧新身份连续性和合法替代效力，暂不硬性复用，采用四个专属业务模块与其它局部模块；无共享冻结锁不会伪装为冻结引用。
- 执行环境：本会话容器 Node 22、git 可用，但无 Bun，直连 GitHub DNS 失败；使用受权 GitHub connector 读取源和提交。独立 CI 运行结果见后续 GitHub PR，不得把静态审计记为 CLI PASS。
- 策略：单模板、聚合业务语义模块；28个 R 检查保留稳定 ID，并列存储 S/F/M/P/状态的责任去向。待核来源仍待核，非结构化语义不能宣称机器门禁。
