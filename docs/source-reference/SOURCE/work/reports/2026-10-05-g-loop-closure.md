# G01–G13 闭环收口报告（2026-10-05，本地批次）

> 基线：`fix/ci-gate-and-version-sync` 至 09de7973；shared 0.1.61 / electron 0.15.128。
> 起点：[复查报告](2026-10-04-n-stage-recheck.md)（QA 实测发现"通用审核 Agent 仍未完整闭环"）。
> 全程仅本地提交，未推送、未开 PR。最终门禁：**3047 pass / 5 skip / 0 fail，typecheck 8 包退出 0**。

> **后续 QA 校准：** 以上为本批开发记录，不是完整功能验收通过。对 `ddd9b1e3` 实际启动 Electron 后，恢复/登记/补件回流得到验证，但登记后提交和自有规则发布曾失败，本次已局部修复；字段校验接线、再次补件、评分轮次、离线第二次回复仍存在反例。真实 V2/Pi/OCR 及模板/批次/角色页面仍缺本地实现。当前事实与下一轮顺序见 [G 项第二轮复查](2026-10-04-g-stage-recheck.md)，不能据此表宣称 G01–G13 全部闭环。

## G 项处置表（含提交）

| 项 | 断点（复查报告） | 处置 | 提交 |
| --- | --- | --- | --- |
| G13 | 重启后 V2 页只允许新建 | `listAggregatesV2` 扫描 state.v2.json 摘要 + LIST_CASES_V2/openAggregateV2 通道 + 面板"已保存案卷"恢复列表 | e102e6f0 |
| G01 | V2 无上传/提交/运行入口 | `material-service`（对话框→复制原件+字节 SHA-256+DocumentVersion 事务；同名版本链 active/supersedes）+ `submitCaseV2`（draft→submitted+首阶段任务）+ 面板登记/提交按钮 | c54ae6a0 |
| G03 | 字段类型/作用域无校验 | `validateFieldValuesV2`（模板 schema：未知 key/作用域越权/数字/ISO 日期/枚举/必填拒绝；数值保精度） | a1cf7a0a |
| G04 | 补件后无任务、流程卡死 | 补件请求记录 originTaskId/originStageId；`respondSupplementV2` 学生回复（角色校验） | 4881e6f4 |
| G05 | 判定满足后不回流 | satisfied 且无其他未结束请求 → 按原阶段重建开放任务（同轮次续审，prerequisite 溯源） | 4881e6f4 |
| G06 | 重复计票/N-A/缺评错误 | `rating-service`：唯一票（事务查重）、N-A block/exclude-renormalize、缺评阻断、最低有效人数；ratings 落盘 | c80a5d6b |
| G11 | 批次无真实队列 | `runBatchQueue` 逐案流转（坏案不拖全批、定稿拒绝、显式注入执行器、完等人工定稿） | 09de7973 |
| G07 | 离线回复"已应用"实际没更新 | 重写为事务应用：outbox 落盘 pending → 命令事务真实写 supplement.responses / castRating → 终态回执；跨进程 duplicate、漂移拒绝 | 50569c8e |
| G08 | 回复应用不持久/可重复 | 同上（持久 outbox 幂等） | 50569c8e |
| G09 | 公开输出无投影 | `buildPublicReport`：student/judge 版无内部意见；judge 侧实名稳定匿名（学员#hash） | 9a615f5c |
| G10 | 向导固定演示政策 | 负责人自有规则文本 → `compileOwnerRules` 编译为结构化 RuleSpec（owner-statement 来源） | 9a615f5c + e133debc |
| G12 覆盖部分 | coverage 无真实分母/组不展开 | 组规则逐组展开（每组一条账目）+ `PolicyRecord.compiledRules` 落库 + 运行结束由产物账本装配 coverage（blockers 进 diagnostics；无规则 plannedChecks 如实 0）；此项不完成 G02 Pi 执行或 G12 OCR | 2b8805c5 + c215d947 |

复查报告 F01–F05（工作页布局/批次定稿门控/全部符合判定/max 明细/检查点恢复）已在 2a165be8 入库。

## 每批验证方式

- 行为反例单测（唯一票被拒/坏案不阻塞/回流任务存在/篡改 rejected/重复不重计/组缺 not-executed 等），部分断言读回落盘 state.v2.json 验证真实持久化
- 每批 `bun run typecheck`（8 包）+ 全量 `bun test --isolate --timeout 30000` 保持绿色后才提交

## 诚实边界（未因测试通过而声称完成）

1. **G02 Pi 及 V2 运行仍缺实现**：注入点和工具白名单存在，但没有产品运行入口、真实材料/规则 Prompt、工具注册或返回结果应用；这些本地代码先完成，再验真实模型效果与失败恢复。
2. **完整 UI 仍缺实现**：已有样例面板不包含任意模板建案、真实补件附件、独立量表/评委分配等完整页面；不是只等安装环境点击验证。
3. **G12 OCR 适配/资源与材料评测仍需本地实现**；其后再做真实识别质量及目标机安装。真实校方身份/API/回写另属 S 类外部联调（05 §4）。
4. 本批单测验证了部分服务事务，没有覆盖全部产品接线、业务状态、轮次和离线往返。后续实际 QA 的通过路径与失败反例见上方第二轮复查，本报告保留原提交与门禁证据。
