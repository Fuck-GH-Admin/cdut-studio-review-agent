# D4 PR #100 后续：P1-A/B/C → P2 → P0 工程实施顺序（2026-10-18）

> 这是实现任务及验收清单，非正式发布授权。用户批准按 P1-A/B → P1-C → P2 顺序开工；P06/P0 仅只读跟进，不在本分支跨分支移植。

## 基线与边界

- 源：PR #100 `b5a1bde69b04832a3ce5625b9577a8b50e626f13`（PR #97 直接后继）；PR #102 `c0f53ccd80d1d6743e0b91461da86de7ce2c599d` 为独立交接文档，非代码父版本。本实施文档承接其事实边界。
- PR #88、#97、#100、#102、P06 #98/#99 均为 Draft。不得视为 main 已合并。
- 继续使用既有 D1/D3/D2/Pi、TemplateStore、Check/Subject/SourceRef/EvidenceLink/Plan fingerprint；不造另一引擎，不修改冻结业务 Markdown、hidden Gold、校务授权、AGENTS.md 或根 README.md。
- 发布状态一律 `candidate-held`、`technical-pre-review`，不生成学校正式政策或审批。

## P1-A：真实对象与条件表单（本轮实施）

用户行为：打开现有创建案卷弹窗，选 D4 模板，创建、编辑、删除 1～N 个真实命名对象；按对象选互斥主场景和完整三值条件；unknown 明确保留。最终确认后沿原 `CREATE_CASE → createD4ClientCase → createD2TechnicalCase` 生成不可变固定 Plan。

- `D4CaseSetup.tsx` 抛弃以整段场景 JSON 作为默认编辑模型。通用 generic-object 以空对象列表开始；提供“添加对象”、删除和可编辑名称，技术 ID 自动唯一生成（可只读显示）；主场景下拉必须显式选择，条件全部默认 unknown；不允许空对象、空名称、重复 ID 或未选主场景提交。
- 类型/主场景/条件完全来自固定 workspace 的实际作者态，不能向用户兜售假想选项；任何模板不能提供合法通用对象或来源，显式禁用新增，不能偷偷套另一个模板。
- 所有修改立即取消确认。只在用户确认时向上层发有效 `D4ClientSelection`。保留只读数据预览用于调试；不要求用户编辑 JSON。
- G01-I student-field / 校园卡与档案等非 generic 对象保留原独立技术路径和合成快照明确警示；本轮不把它们伪装成 generic-object，也不开放正式学籍事实入口。

## P1-B：Main 来源与权限边界（本轮实施）

- `review-d4-client.ts` 暴露受控选项：作者态指定的 businessType、源绑定、主场景及 condition IDs。
- Main 不信任 Renderer 任意扩展的 `businessType` / `sourceId` / `sourceVersionId` / `decidedBy`。以固定模板目录为准校验原始选择，严格拒绝增删伪造条件、重复目标、跨模板或失效来源。
- 合同区分：“作者态来源锚点”仅标识此模板技术分支来源（包括 synthetic source）；“用户确认”只确认界面上的适用性选择，**不代表**校方业务事实/授权或材料真实性。业务方需要有权系统事实时仍 unknown / HUMAN_ONLY。
- 确认标记为本次建案专用；Main 做运行时校验再调用原 D2。条件/对象更改不得修改已有 D2 Plan，必须新建案卷并生成新 fingerprint。
- 至少覆盖新建 3 个对象、删除 1 个后再添加、两对象不同场景、一个 unknown、来源伪造/条件缺失/未确认拒绝、固定 Plan/Subject 正确、原 G08/G03/G01-I 兼容正反例。

## P1-C：上传后路由（下轮，须 P1-A/B 通过）

- 追踪并复用已有入口/识别器（原拟“20 秒倒计时默认路由 + 人工覆盖”）；若仓库无现成可复用实现，只作与当前上传/建案流程兼容的最小推荐器，不引入独立自动决策引擎。
- 用户上传 → 临时材料队列 → 系统建议模板及可解释理由 → 用户可覆盖或倒计时采用建议 → 对象/条件/材料关联确认 → 固定 D2 Plan。
- 多任务上传缺省拒绝或显式拆案；LLM 只建议，不写权威事实；路由失败不得把未知条件默认为 false。
- 验收只需 1 条真实 UI 路径和 1 次人工改选的测试，不重测 50 模板。

## P2：工具合同与上下文减负（P1 稳定后）

- PR #100 原始基线：`g08-online-task-prompt.txt` 129394 字符（约 81% 是规则文本）；`g08-online-tools.jsonl` 34 个条目拒绝：15 observation 未声明、12 证据范围缺失、6 未确认政策状态、1 适用性错误。107 有效 Check、126 次 Check 提交尝试，模型 SDK 用量按原字段记录。
- 首个工程切口：让模型只引用模板声明的 observations；对工具说明补充合法字段和“unknown / unverified policy”限制。先减少拒绝，而不是增加 Check。
- 再复用现有 `finish=false` 分批提交、`continuationPrompt`、`buildPiReviewCompactionSummary`、Pi 的现有 task/compact 能力，按对象/模块或规则组索引按需读取。完整 Check/SourceRef/EvidenceLink 留账；不得无日志跳过 unknown。
- 基于 PR #100 原样本和去答案提示的小变体做**极少量**同模板/同模型对照，仅用于决定保留或撤销代码。记录覆盖、真实引用、串证、耗时、输入/输出/cache-read 三字段和拒绝率；不把数据相加当费用。

## P0：P06 后台 owner 兼容（外部依赖，不阻塞 P1/P2）

- D4 固定源使用普通 review-operator 可见会话；P06 #98 有独立的 Main-owned `review-pi-run-bridge`、`review-pi-admission`、`review-background-state`、`review-strict-pi-tools`；当前不在 #100 源码树。
- P06 正式 LIVE、SourceRef 失效、Office #71、Main/IPC owner/事件/跨案隔离、重启恢复及 Relay/Pocket 由 P06 会话验收。其仍为 PARTIAL/Draft 时禁止在 D4 合并并标 PASS。
- 稳定合同出现后另建固定双 SHA 的 D4-P0 兼容分支；区分 admission ACK、持久化 V2 状态、可见 UI、真正运行结束和学校审批。

## 最小发布门禁与停止条件

1. P1-A/B 只修改表单、严格元信息暴露/建案来源门禁、关联测试和本实施文档，不改审核引擎/规则源码；
2. 定向 Bun 回归 + `bun run typecheck`、架构边界 + Main/Renderer 构建；保留失败日志；
3. P1-A/B 一条非学籍三对象交互链可创建固定 D2 Plan（测试证明，不可假称已实机点击）；若远程 CI 无 Electron GUI，记为 `GUI_NOT_RUN`，交由下一轮本机补；
4. 每次代码变更按仓库规则 bump 受影响包 patch 与 CHANGELOG 顶版本；不修改 AGENTS.md/根 README.md（除非用户另行批准）；
5. Draft PR 不合并 main，不签署正式校方审批、业务准确率或 P06 LIVE。

## 本轮代码目标

- `apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx`
- `apps/electron/src/main/lib/review/review-d4-client.ts`
- `packages/shared/src/types/review-d2.ts`
- `apps/electron/src/main/lib/review/review-d4-client.test.ts`
- 必要时新增纯函数输入合同测试文件；**尽量不碰** `review-ipc.ts` 和 Pi 执行主体。

验证及任何阻断须按固定 commit/CI 原始结果记录。P1-A/B 后续 P1-C 应从本 Draft 审核通过的固定 HEAD 另开分支。
