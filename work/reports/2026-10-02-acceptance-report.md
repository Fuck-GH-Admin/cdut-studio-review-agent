# 内容审核专区 Demo 验收报告

> 日期：2026-10-02。设计依据：`docs/design/2026-10-01-cdut-studio-content-review-demo.md`。
> 实施决策档案：`docs/plans/2026-10-02-content-review-demo-implementation.md`；过程决策：`work/decision-log/2026-10-02-decision-log.md`（41 条；本报告 §一-§七 验收时为 28 条）。
> 代码审查报告：`work/reports/2026-10-02-code-review.md`。

## 一、交付清单

### 共享契约（packages/shared）
- `src/types/review.ts`：SourceDocument / ReviewCase / RulePack / ReviewItem / EvidenceDocument / ReviewRun / ReviewFinding / ReviewAssistantMessage / ReviewReportData + `REVIEW_IPC_CHANNELS`（14 通道，通用化新增 UPDATE_CASE_SETTINGS）+ `REVIEW_MODEL_PROVIDERS` 白名单（3 出口）+ `REVIEW_MODEL_PROVIDER_REJECTED_NOTICE`
- 设计文档 §9 的四个内部契约（SourceDocument / ReviewCase / ReviewRun+Finding / ModelTask）全部落地。

### 主进程服务（apps/electron/src/main/lib/review/，17 文件 4670 行；demo 验收时为 16 文件 3452 行）
| 文件 | 职责 |
| --- | --- |
| case-store.ts | 案卷 JSON 原子存储（.tmp+rename）、assertSafeId 防路径穿越、demo 案卷幂等载入 |
| document-service.ts | 文本/SVG 解析切块，稳定锚点 ID（blk-*），不支持格式显式 failed（通用化后支持 PDF/Office 文本层提取与图片 Vision 路径，见 §八） |
| review-model-gateway.ts | 统一模型出口：白名单强制（OpenAI 兼容线 + Ollama 本地私有线）、尊重渠道/模型 enabled、复用 core URL 解析器、60s 超时（审核运行专用 150s，D19/决策 #36）、代理感知 |
| mock-review-engine.ts | 确定性模拟审核（六类检查：等级冲突/缺证明/超上限/互斥/日期越界/看不清），generatedBy 可溯源 |
| ai-review-service.ts | 大纲生成/条目识别/审核运行/助手对话四能力，真实+降级双路径，结果回写案卷 |
| run-service.ts | 审核运行编排，失败落 failed 记录不上抛 |
| report-service.ts | 预审报告导出（JSON+MD，MD 转义、原子写、防撞名） |
| case-creation.ts / case-import.ts / report-data.ts | 空案卷创建 / 主进程受控导入（大小校验+原件复制）/ 报告数据访问 |
| review-ipc.ts | 14 个 IPC handler（通用化新增 UPDATE_CASE_SETTINGS），全部入参校验（枚举白名单、system 角色注入面阻断） |
| demo-fixtures/demo-case-fixture.ts | 虚构演示案卷（明确标注"模拟"）：1 规则 + 1 申报 + 4 SVG 证明、6 条目、7 条大纲、32 个稳定锚点块 |
| 5 个测试文件（demo 阶段 4 个，通用化新增 review-generalization.test.ts） | 56 个 BDD 式测试（demo 阶段 32 个，Given/When/Then 命名）；另将 ContentReviewView 纳入既有 window-controls-host-coverage 守卫测试（+4） |

### 渲染层（apps/electron/src/renderer/）
- `atoms/review-atoms.ts`：reviewFocusAtom（三栏联动唯一驱动，nonce 机制）等 21 个 atoms（demo 阶段 19 个）
- `components/content-review/`：三栏工作台（ContentReviewView + 左中右三栏 + SourceBlockView 共用高亮定位块 + FindingCard 问题卡 + RuleOutlineList 大纲 + AssistantDrawer 助手抽屉 + use-review-actions）
- 导航接入：ActiveView 新值 `content-review`、侧栏展开态/窄轨入口、MainArea 分支、键盘焦点映射

### preload
- 独立 `reviewAPI` expose（14 个方法，通用化新增 updateCaseSettings），沿用 agentPreviewAPI 先例。

## 二、核心功能验收（对照设计文档 §13）

| 验收点 | 结果 | 证据 |
| --- | --- | --- |
| 打开/上传标注"模拟"的规则与申请材料 | ✅ | loadDemoCase 幂等载入 demo-zhangsan-2026；fixture 全部带"（模拟）"标注 |
| 左栏规则大纲 | ✅ | 7 类条款大纲（fixture 预置 + AI 真实路径可覆盖），Collapsible 分组，条款可点击蓝色定位原文 |
| 中栏申报事项与证明绑定 | ✅ | 6 条目卡 + 4 证据卡，双向绑定，识别状态三态徽标 |
| 右栏问题卡（红/黄分级） | ✅ | 7 条发现：4 红（等级冲突/互斥×2/日期越界）+ 3 黄（缺证明×2/看不清），覆盖摘要四格 |
| **点击问题卡三栏联动** | ✅ | nonce 驱动：中栏红/黄高亮申报行、左栏蓝色高亮规则原文、scrollIntoView 居中 + 2.5s 闪高亮、精度降级角标"仅定位到此文件/页" |
| **快捷键唤起 AI 助手** | ✅ | Ctrl+Shift+A / Cmd+Shift+A 唤起对话抽屉，带入案卷+选中问题卡上下文，3 个快捷提问，degraded 离线模式标注 |
| 修正/补件后重审 | ✅ | 重审生成新 run 记录（run-{timestamp}-{random}），旧记录保留可追溯 |
| 导出可交接的预审报告 | ✅ | JSON + Markdown 双格式，含依据版本/发现表格/覆盖摘要/人工处理占位 |
| 模型通信收敛（全局核心） | ✅（demo 范围） | 审核专区唯一出口 review-model-gateway：白名单外 provider 在解密/网络调用前直接拒绝（有测试锁定）；停用渠道/模型不再被调用 |

## 三、验证结果

- `bun run typecheck`：全部 9 包 ✅（0 错误）
- `bun test apps/electron/src/main/lib/review/`：**32 pass / 0 fail**（含 --isolate CI 同款参数；demo 阶段数字，当前为 56 pass / 0 fail，见 §八·一）；连同 window-controls 覆盖测试合计 36 pass / 0 fail
- `bun run check:boundaries`：✅ 无边界违规
- E2E 服务链冒烟：loadDemoCase → 大纲 7 条 → 条目 6 条 → 审核 7 findings → 导出 JSON+MD ✅
- esbuild 主进程打包：registerReviewIpc 进 bundle ✅（审查代理验证）
- 代码审查（按根目录 review 准则）：P0=0；P1×3、P2×7 全部修复（P2-F10 残留收尾见 §八·一）；P3×6 中 4 项已修（F13/F14/F15a/F15b），2 项记入已知边界

## 四、已知边界（不阻塞 demo，均已记录决策日志）

1. **案卷管理 UI 缺位**：createCase/importDocument/deleteCase 三层已通但渲染层无入口（P3-F11）。演示只用演示案卷；导入链路已修复并通过服务层验证。（已于通用化 T3 交付：左栏案卷管理条 + 新建/按角色导入/删除 + 领域包切换，见 §八）
2. **失败路径测试盲区**（P3-F12）：停用渠道 status、报告无运行抛错等契约行为建议后续补测试。
3. **openai-responses 移出白名单**：网关只实现 chat completions 一条线；responses 协议按迭代 2 处理（决策 #27）。
4. **AI 大纲/条目回写**用"写前重读合并"缓解读改写窗口，未做 per-case 写队列（P2-F8 部分缓解，demo 单用户场景足够）。
5. **全局通信收敛**（删减 Chat/Agent 的其他厂商接口）超出审核专区范围，路线图见实施计划 §5，需三区共同验收。

## 五、演示脚本（建议演示顺序）

1. 打开应用 → 侧栏"内容审核"（演示徽标）→ 自动载入模拟案卷，顶栏显示"离线模拟模式"（无渠道）或"OpenAI 兼容出口"/"本地私有出口"（有渠道）
2. 左栏：点"生成规则大纲"（无渠道时降级为预置大纲，日志注明）→ 展开各分类 → 点"等级分值"条款 → 原文蓝色高亮
3. 中栏：点"识别条目" → 6 条申报卡与 4 份证据卡出现 → 点"校园歌手大赛"条目 → 申报行定位
4. 右栏：点"开始审核" → 7 张问题卡（4 红 3 黄）+ 覆盖摘要
5. **联动演示**：点"申报等级与证明等级冲突"卡 → 中栏红高亮"蓝桥杯…一等奖"行 + 左栏蓝高亮分值条款；点"日期越界"卡 → 中栏红高亮 + 左栏时间范围条款
6. 按 `Ctrl+Shift+A` → 助手抽屉 → 点快捷提问"为什么这样判？" → 得到引用本案材料的回答（离线时为静态解答并标注）
7. 点"导出预审报告" → 提示文件路径 → 打开 Markdown 报告核对
8. 重审一次 → runs 目录出现新记录（旧记录保留）

## 六、真机 AI 验证（2026-10-02 06:17 补录）

| 项 | 结果 |
| --- | --- |
| 模型出口 | bai 本地代理（127.0.0.1:8000，OpenAI 兼容）→ mimo-v2.6-flash，走审核专区白名单 `custom` 出口 |
| AI 审核运行 | `engine: 'ai'`，25 秒返回 7 条发现，全部 `generatedBy: 'ai'`（等级冲突/缺证明×2/日期越界/证明看不清/规则未覆盖/信息不全） |
| 审核助手 | 真实模型路径回答（引用案卷上下文），非降级静态解答 |
| 报告导出 | JSON+MD 双格式，报告标注"审核引擎：AI 审核" |
| mock↔AI 切换 | 仅靠渠道配置切换，零代码改动；渠道缺失时自动降级确定性引擎 |
| UI 截图取证 | 三栏工作台/7 张问题卡/联动高亮/助手抽屉均在 Electron 43 + Xvfb 实机截图确认（.workdir/e2e-shots/） |

修复记录：AI findings 锚点校验改"宽进严出"（决策 #31）后，AI 路径从 100% 降级修复为正常出结论。

## 七、参考素材对照（/references）

按用户指令核查了参考项目对"待审材料"的可供给情况：

| 素材 | 可供给内容 | demo 现状 |
| --- | --- | --- |
| cqes4cs-v1.1 | 申请表/规则层级/教师复核/异议的表结构（SQL），学生成绩模板 | 字段关系已映射进 ReviewCase 设计；其异校规则与测试学生**未**导入 |
| comprehensive-performance-simplifier | 证明图片分组/错误项/需补证/可复用语义 | 已采纳为证据绑定设计 |
| rda-tiger-17734784 | 真实申请表 PDF/DOCX、评委表、评分 XLSX | 可作 document-service PDF/DOCX 解析扩展的测试样本（待做） |
| oulad-uci | 7 关联 CSV 批量数据 | 适合批量压力测试（暂未用） |
| evaluate | 仅 README，无源码无许可 | 只作类别覆盖面参考，不作为数据源 |

结论：demo 用 fixture 是刻意虚构（合规）；要接"真实感材料"，rda-tiger 的表单样本可直接喂给现有解析器做第二批演示数据，cqes4cs 的 SQL 字段关系可扩展 ReviewCase schema。

## 八、通用化升级（2026-10-02 补章）

原 demo 只适用于综测场景且只能用演示案卷。本轮拆除三堵墙，实测证据：

| 墙 | 改造前 | 改造后（真机实测） |
| --- | --- | --- |
| **格式墙** | PDF/DOCX/XLSX/图片→占位 failed | PDF 真实提取（371 字符/8 块）、Office 走 pdf-parse/pdfjs/word-extractor/mammoth、图片带 Vision 附件路径；扫描件无文本层→`partial` + 中文说明（不伪造） |
| **领域墙** | prompt/类别/发现类型写死综测 | 四内置领域包（综测/合同/费用报销/自定义）；真机合同案卷 AI 产出 `missing-clause`(红)/`unclear-payment`/`unclear-liability`/`invalid-reference`，并识别出合同跳号缺 Clause 5 |
| **入口墙** | 渲染层只能载入演示案卷 | 左栏案卷管理条：选择/新建（含领域包选择）/按角色导入/删除（演示卷禁删）+ 领域包切换；真机截图与 IPC 实测通过 |

**新增能力**：多待审文件（`subjectDocumentIds`，两份文件同时送模型并提示跨文件比对）、跨文档矛盾发现（`cross-document-mismatch` + `counterpartAnchor` 双处高亮）、Vision 图片识别（模型不支持时自动去图重试并在结论标注）。

**真机验证记录**：
- 合同场景（真实 PDF+PNG+TXT）：引擎 ai、20.0s、6 条领域化发现、规则大纲 5 条合同类别、条目 7 条合同类别
- 综测回归（demo-zhangsan-2026）：引擎 ai、41.6s、7 条发现（无退化）

**已知边界**：多页 PDF 页码信息丢失（块级 page 恒为 1）；扫描件 PDF 无 OCR（需人工或后续接入）；无真实扫描件样本，partial 分支以空文本层 PDF 等价验证；领域包为内置四包，用户自定义包需改代码（UI 自定义编辑未做）。

**测试**：review 目录 56 pass / 0 fail（新增 19 个通用化用例）；typecheck 9 包全绿；boundaries 无违规。

### 八·一、新会话续接收尾验证（2026-10-02 补录）

上一会话在最终验证中途中断，本会话按"工作区即权威"原则重新验收：

| 项 | 结果 | 说明 |
| --- | --- | --- |
| review 测试（官方入口 `bun test --isolate`） | ✅ 56 pass / 0 fail / 206 expect | 裸 `bun test`（无 isolate）下 gateway 白名单 2 用例红是 `review-generalization.test.ts` 的 `mock.module` 跨文件泄漏（bun 同进程语义），非产品缺陷（决策 #38）；官方入口与 CI 均带 `--isolate` 不受影响 |
| typecheck 9 包 | ✅ 全绿（exit 0） | 含本轮测试文件改动 |
| check:boundaries | ✅ 无违规 | |
| P2-F10 残留修复 | ✅ | case-store / gateway 两测试的写死 `/home/miku` 配置根改为 `import.meta.dir` 上溯 + afterAll 清理（决策 #39）；`work/tmp/profer-test-*` 残留 20+ 目录已清 |
| 全仓回归 | ✅ 3122 pass / 3 fail | 3 个失败均为历史遗留且与本模块无关（macOS 打包守卫、macOS zsh 环境加载、Skill 路由），Linux 宿主平台差异 |
| 真机冒烟 | ✅ 通过 | Electron（Xvfb :99 + CDP 9222）实机启动，经侧栏 `[data-profer-navigation-item="content-review"]` 进入三栏工作台；innerText 断言 3/3（载入演示案卷/规则大纲/开始审核+导出预审报告）；「载入演示案卷」后 7 条大纲、6 条目、4 证明、开始审核可用（截图 smoke-1/2/3.png 于 .workdir/e2e-shots/，smoke-3=载入后满数据态）；会话日志 ERROR=0、Unhandled=0、`[审核专区] IPC 处理器注册完成`。环境注意：dev 渲染层必须先起 `bun run dev:vite`（5174），否则 ERR_CONNECTION_TIMED_OUT（决策 #41） |

## 九、结论

内容审核专区 demo 已达成"完整的一次审核流程"验收：**规则导入 → 大纲生成 → 条目识别 → 逐项预审 → 双侧原文定位与三色高亮联动 → 助手追问 → 预审报告导出** 全链路可运行；离线（无模型凭证）与在线（OpenAI 兼容/本地私有）两种模式同schema切换；安全合规叙事落实为可解释的白名单拒绝机制。剩余校方接入层、全局通信收敛按设计文档 §5/§12 路线图推进；案卷管理 UI 已于通用化 T3 交付（见 §八）。
