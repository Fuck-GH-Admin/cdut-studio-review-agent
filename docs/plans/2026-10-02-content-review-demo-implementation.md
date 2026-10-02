# 内容审核专区 Demo 实施计划与决策记录

> 状态：已完成（T1-T10 全部交付；后续通用化升级见 `docs/plans/2026-10-02-content-review-generalization.md`）。创建：2026-10-02。上游设计：`docs/design/2026-10-01-cdut-studio-content-review-demo.md`。
> 本文档是审核专区 demo 的**实施决策档案**：所有关键决策、理由、边界与验证方式都记录于此。
> 细粒度的过程决策追加在 `work/decision-log/2026-10-02-decision-log.md`；中间产物一律放在 `work/`（不使用系统 tmp）。

## 0. 交付范围（本 demo 做什么）

1. 新主视图 `content-review`（三栏工作台）：
   - **左栏（审核依据）**：上传/载入依据材料 → AI 生成规则大纲（可展开、带原文锚点）。
   - **中栏（申请与证明）**：上传/载入待审文件 → AI 识别全部可审核条目 + 证据绑定 + 来源块渲染。
   - **右栏（AI 审核员）**：生成逐项审核发现（问题卡）+ 覆盖摘要 + 人工操作入口。
2. 问题卡三栏联动：点击右栏问题卡 → 中栏滚动到报错位置并红/黄高亮，左栏滚动到规则原文并蓝色高亮。
3. 审核助手：`Ctrl+Shift+A` 唤起右侧对话抽屉，带入当前案卷、选中问题卡与已确认规则上下文。
4. 模型通信收敛（demo 范围）：审核专区模型调用只经统一网关，仅两种出口——
   - **OpenAI 兼容**（`/v1/chat/completions`，Bearer）；
   - **本地模型私有接口**（Ollama 原生 `/api/chat`，空鉴权哨兵。注：现行实现为空 key 直接省略 Authorization 头，不再用哨兵值）。
   其余厂商协议在审核专区被网关白名单显式拒绝。
5. 完整可运行的演示流程：载入模拟案卷 → 规则大纲 → 条目识别 → 审核运行 → 联动高亮 → 助手追问 → 预审报告导出。

## 1. 关键决策

### D1 集成方式：真实集成进 CDUT-Studio 主视图（而非独立演示页）
- 新增 `ActiveView` 值 `content-review`；`MainArea` 增加分支渲染 `ContentReviewView`；侧栏（展开态 + 窄轨 rail）各加入口。
- 理由：设计文档 §9 明确要求作为新主视图；借用现有主题/组件体系，演示即产品骨架。

### D2 分层与代码落点（四位置同步修改的既有 IPC 模式）
| 层 | 路径 | 说明 |
| --- | --- | --- |
| 共享类型/IPC | `packages/shared/src/types/review.ts` | SourceDocument/ReviewCase/RulePack/ReviewItem/Evidence/Finding/ReviewRun + `REVIEW_IPC_CHANNELS` |
| 主进程服务 | `apps/electron/src/main/lib/review/*` | case-store / document-service / model-gateway / ai-service / run-service / demo-fixtures / review-ipc |
| IPC 注册 | `apps/electron/src/main/ipc.ts` 引入 `registerReviewIpc()` | 不把 7768 行 ipc.ts 进一步膨胀 |
| preload | `apps/electron/src/preload/index.ts` | `contextBridge.exposeInMainWorld('reviewAPI', …)`（沿用 agentPreviewAPI 的独立 expose 模式） |
| 渲染层 | `apps/electron/src/renderer/components/content-review/` + `atoms/review-atoms.ts` | 三栏、问题卡、联动、助手抽屉 |

### D3 数据模型：以设计文档 §9 的四个内部契约为准
`SourceDocument`（结构化块锚点）/ `ReviewCase` / `ReviewRun+Finding` / `ModelTask`。锚点（anchorId）指向 `SourceDocument.blocks[].id`，问题卡、规则大纲、条目全部引用同一锚点空间；三栏消费同一来源，不各造一套位置编号。定位精度按 文件→页→块 降级并显式标注。

### D4 本地存储：`getConfigDir()/review-cases/{caseId}/`
`case.json` + `source-docs/`（原件与解析块）+ `runs/{runId}.json`。JSON 文件方案，不引入本地数据库（遵守项目约束）。demo fixtures 在首次载入时**复制**进案卷目录再使用，运行期只读案卷目录。

### D5 模型出口：统一网关 + 双协议白名单（全局核心的 demo 落地）
- `review-model-gateway.ts`：审核专区唯一模型出口。
  - 允许渠道类型：`openai` / `openai-responses` / `custom`（OpenAI 兼容线）与 `ollama`（本地私有线，Ollama 原生 `/api/chat`，API Key 为空时用哨兵 `ollama`）。（后按决策 #27 收敛：白名单现为 `openai` / `custom` / `ollama` 三种，`openai-responses` 已移出；空 key 现行为省略 Authorization 头）
  - 其他厂商类型（anthropic/google/…）在网关入口被拒绝，错误信息可解释（安全合规叙事）。
- 项目级"删减所有其他厂商接口"是跨区重构（牵动 Chat/Agent/渠道体系），按设计文档 §12 由三区共同验收；本次交付（a）审核专区严格双出口（b）`REVIEW_MODEL_PROVIDERS` 白名单常量与过滤（c）收敛路线图写入本文档 §5。
- 结构化输出：提示词要求 JSON + 网关侧 JSON 提取/校验/失败重试一次；失败时任务标记 error，不伪造结果。

### D6 无模型凭证可演示：确定性模拟引擎
`ai-service` 双路径：
1. **真实路径**：渠道可用 → 网关调用（规则大纲提取 / 条目识别 / 审核发现 / 助手对话）。
2. **演示降级**：无可用渠道或调用失败 → `mock-review-engine` 用确定性算法（文本检索锚点、日期/分值/互斥规则比对）产出同 schema 结果；UI 与报告显式标注"模拟结果"。
理由：demo 必须离线可跑；真实与模拟共用同一数据契约，切换只影响结果来源标记。

### D7 演示数据（虚构，明确标注"模拟"）
放 `apps/electron/src/main/lib/review/demo-fixtures/`（TS 内嵌，esbuild 打包无路径问题）：
- 规则包 A：《学生综合素质测评实施办法（模拟）》markdown，含学年/发布单位/分值/上限/互斥条款。
- 申报材料：综测申报表（CSV，学生"张三（模拟）"5 条申报）。
- 证明：SVG 证书/证明图 4 张（无 OCR 依赖）。
- 预埋缺陷：等级冲突（红）、缺证明（黄）、分值超上限（红）、互斥重复计分（红）、日期越界（红）、信息模糊（黄）。
- 参考资料仅借鉴字段关系（cqes4cs.sql 的申请-规则-建议分结构、SXU 的证明分选语义），不使用其真实数据。

### D8 三栏联动机制：Jotai focus atom + DOM 锚点闪高亮
`reviewFocusAtom = { findingId, ruleAnchor?, subjectAnchor?, severity, nonce }`；各栏 `useEffect` 订阅 nonce，`scrollIntoView({block:'center'})` + 短时 CSS 类（红/黄/蓝）后移除。降级：锚点缺失时定位到文件头部并显示"仅定位到此文件/页"。

### D9 审核助手：`Ctrl+Shift+A`（渲染层 keydown，非全局快捷键）
避免与既有全局快捷键（Ctrl+K/F/M/B/Shift+P… 已占用）冲突；仅审核视图激活时生效。上下文注入：当前案卷 + 选中问题卡 + 已确认规则条目 + 相关申报条目。回答必须引用材料；无依据时明说。无渠道时降级为"基于问题卡元数据的静态解答"并标注。

### D10 测试与验证
- `bun test`：case-store 原子写、解析块锚点稳定性、规则比对引擎（上限/互斥/日期/缺证）、网关请求形状（OpenAI 兼容体 + Ollama 私有体 + 白名单拒绝）、focus 纯函数。
- `bun run typecheck` 全绿为合并线；代码审查按根目录 `software-development-code-review.md` 执行。

### D11 文档同步边界
AGENTS.md/CLAUDE.md 自身规定需经所有者允许才能修改 → 本次不改；全部决策记录于本文档与 `work/decision-log/`。不执行 git commit（用户未要求；工作树留给用户检查），版本号递增留给提交时执行。

## 2. 任务分解与执行状态

| # | 任务 | 执行方式 | 状态 |
| --- | --- | --- | --- |
| T1 | 共享类型契约 `review.ts` + IPC 常量 | 主会话 | 完成 |
| T2 | demo fixtures（规则/申报/证明/缺陷映射） | 子代理（mimo-v2.6-flash） | 完成 |
| T3 | 主进程：case-store + document-service | 子代理（mimo-v2.6-flash） | 完成 |
| T4 | 主进程：model-gateway（双协议）+ ai-service + run-service | 子代理（mimo-v2.6-flash） | 完成 |
| T5 | IPC 注册 + preload 桥接 | 主会话 | 完成 |
| T6 | 渲染层：三栏 UI + 联动 + 助手抽屉 | 子代理（mimo-v2.6-flash） | 完成 |
| T7 | 导航接入（active-view/侧栏/rail/MainArea） | 主会话 | 完成 |
| T8 | 测试补齐 + typecheck/test 修复 | 子代理 + 主会话 | 完成 |
| T9 | 代码审查（review 准则） | 子代理（mimo-v2.6-flash） | 完成（P1/P2 已修） |
| T10 | 验收报告 | 主会话 | 完成 |

## 3. 风险与回退

- 子代理产出质量不齐 → 契约先行（T1 主会话亲自写），子代理按契约实现，主会话集成审查。
- 真实模型输出不稳 → 网关 JSON 校验 + 一次重试 + 失败落 error 状态，demo 走模拟引擎兜底。
- PDF 分页锚点不可靠 → 定位精度降级已在 D3/D8 处理（文件→页→块）。

## 4. 验收（对齐设计文档 §13）

演示脚本：载入模拟案卷 → 左栏规则大纲出现且条款可展开 → 中栏 5 条申报 + 4 份证明识别完成 → 右栏出现 ≥3 红 + ≥2 黄问题卡 → 点击"等级冲突"卡：中栏红高亮申报行、左栏蓝高亮等级分值条款 → `Ctrl+Shift+A` 追问"为什么判冲突" → 导出预审报告（JSON+Markdown）→ 全部过程记录在案。

## 5. 模型通信收敛路线图（全局核心，超出 demo 的部分）

1. ✅ 审核专区网关双出口（本次）。
2. ⬜ Chat/Agent 渠道 UI 供应商列表收敛为 OpenAI 兼容 + 本地私有两类（需与负责同学同步）。
3. ⬜ `packages/core/src/providers/` 移除 anthropic/google 专用适配器，DeepSeek/智谱/豆包/通义等改走 OpenAI 兼容线（保留 `custom`）。
4. ⬜ Agent 运行时（Claude SDK / Pi）对非 OpenAI 协议的依赖评估与替换方案。
5. ⬜ 全局验收：攻击面清单 + 合规解释文档。
