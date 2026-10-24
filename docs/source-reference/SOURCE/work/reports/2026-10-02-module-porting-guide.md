# 内容审核专区模块拆解与移植指南

> 日期：2026-10-02。目的：说明如何把内容审核专区从 Profer（CDUT-Studio）整体拆出、改造后在其他 Electron/Node 桌面或服务端项目中复用。
> 本文档与 `2026-10-02-acceptance-report.md` 互为补充；验收结论见后者。

## 一、模块边界与依赖面

模块全部代码位于两处，自包含度高：

```
packages/shared/src/types/review.ts        # 类型契约（单文件，零依赖）
apps/electron/src/main/lib/review/         # 服务层 17 文件（12 产品代码 + 5 测试；demo 阶段 16 文件）
apps/electron/src/renderer/atoms/review-atoms.ts          # 状态
apps/electron/src/renderer/components/content-review/     # UI 11 文件（通用化新增 CaseManagerBar/CreateCaseDialog）
apps/electron/src/preload/index.ts 中 reviewAPI 段         # IPC 桥
apps/electron/src/main/ipc.ts 中 registerReviewIpc() 调用  # 注册点
```

**外部依赖四类**（前三类为 demo 阶段审计结论，通用化新增第四类 `../document-parser` 一处；已审计，`grep -rhn "from '@profer|from 'electron'"`）：

| 依赖 | 使用处 | 拆出时如何替换 |
| --- | --- | --- |
| `@profer/shared`（21 处 import，含测试与 fixtures；demo 阶段 16 处） | 全部类型 + 领域包 | 拷 `types/review.ts` + `types/review-domain-packs.ts`（后者含四个内置领域包数据，同样零依赖） |
| `@profer/core`（1 处） | `review-model-gateway.ts` 的 `resolveOpenAIChatCompletionsUrl(baseUrl, provider)` | 内联该函数（约 20 行：openai 拼 `/chat/completions`（已带该后缀则原样返回）、custom 视作完整端点仅去尾斜杠、ollama 分支归一 `/v1` 后缀——审核网关的 ollama 线走原生 `/api/chat`，不经此函数），或拷 `packages/core` 对应文件 |
| `electron`（2 个文件） | `review-ipc.ts`（ipcMain）、`case-import.ts`（dialog） | 服务端复用时：`review-ipc.ts` 换成你自己的 HTTP/RPC 路由层（14 个通道一一对应），`case-import.ts` 的 `dialog.showOpenDialog` 换成 Web 文件上传 |
| `../document-parser`（1 处） | `document-service.ts` 提取 PDF/Office 文本 | 该项目内既有解析器；移植时一并拷走，或换成你的 PDF/Office 解析库（保持 `extractTextFromFile(path): Promise<string>` 形状即可） |

**其余全部为 Node 内置能力**（fs/path/crypto/http），无数据库、无 ORM、无框架锁定。

## 二、架构分层（拆解视图）

```
┌─ 渲染层（React + Jotai，可整体替换为任意前端框架）
│   components/content-review/*   三栏 UI + 联动特效 + 助手抽屉
│   atoms/review-atoms.ts         reviewFocusAtom（联动核心）等 21 个 atoms
│           │ window.reviewAPI（preload contextBridge，14 方法）
├─ IPC 层
│   review-ipc.ts                 14 个 handler + 入参校验（枚举白名单/角色过滤）
│           │ 函数调用
├─ 服务层（纯 Node，无 Electron 依赖 ← 拆移植价值最高的一层）
│   case-store.ts        案卷/运行持久化（JSON 原子写、assertSafeId 防穿越）
│   document-service.ts  文本/SVG/PDF/Office 解析切块、稳定锚点 blk-*
│   review-model-gateway.ts  统一模型出口（白名单闸在解密/网络之前）
│   mock-review-engine.ts    确定性模拟引擎（六类检查，可独立用于测试）
│   ai-review-service.ts     大纲/条目/审核/助手四能力，真实+降级双路径
│   run-service.ts           运行编排（失败落 failed 记录不上抛）
│   report-service.ts        JSON+Markdown 报告导出
│   case-creation.ts / case-import.ts / report-data.ts
│   demo-fixtures/           虚构演示案卷（标注"模拟"，可替换为真实数据源）
└─ 数据
    {configDir}/review-cases/{caseId}/case.json + runs/*.json
    {configDir}/review-reports/*.json|*.md
```

## 三、移植步骤（三种场景）

### 场景 A：整块搬进另一个 Electron 应用（最常见）

1. 拷贝 `packages/shared/src/types/review.ts`（或并入对方 shared 包）。
2. 拷贝 `apps/electron/src/main/lib/review/` 整个目录（17 文件）。
3. 处理唯一一处 `@profer/core` 依赖：把 `resolveOpenAIChatCompletionsUrl` 内联进 `review-model-gateway.ts`。
4. 对方 preload 加 `reviewAPI` 段（对照本仓库 `apps/electron/src/preload/index.ts`，14 个方法均为 `ipcRenderer.invoke` 直传）。
5. 主进程 `ipc.ts` 调 `registerReviewIpc()`。
6. 渲染层拷 `components/content-review/` + `atoms/review-atoms.ts`，依赖 jotai/react/tailwind（对方无 jotai 时，把 21 个 atoms 改为 zustand/useState 均可——联动核心只是 `{findingId, anchors, severity, nonce}` 一个对象）。
7. 配置目录约定：模块通过 `getConfigDir()` 决定存储根；对方应用实现同名函数或全局替换为它的配置路径即可。

### 场景 B：抽成独立服务（Web 后端）

1. 同上 1-3。
2. 弃用 `review-ipc.ts`，写 HTTP 路由：`POST /review/cases/:id/run` 对应 `RUN_REVIEW` 等，14 通道语义见 `review.ts` 的 `REVIEW_IPC_CHANNELS` 注释。
3. `case-import.ts` 的 dialog 换 multer/表单上传；其余服务层零改动。
4. 前端可复用渲染层组件树，把 `window.reviewAPI.*` 调用替换为 fetch 封装（接口签名一一对应）。

### 场景 C：只要"AI 审核引擎"能力（不要 UI）

只需要 4 个文件：`review-model-gateway.ts` + `mock-review-engine.ts` + `ai-review-service.ts` + `run-service.ts`，外加类型文件。它们是纯函数式调用：`startReviewRun(caseData, 'ai')` 进、`ReviewRun` 出。白名单机制保证模型出口可控。

## 三·五、领域包：换业务域的第一入口（2026-10-02 新增）

模块已内置四个领域包，**换业务域优先改领域包数据，而不是改代码**：

```ts
// packages/shared/src/types/review-domain-packs.ts
const MY_DOMAIN: ReviewDomainPack = {
  id: 'my-domain',
  name: '我的审批场景',
  description: '一句话说明（UI 下拉展示）',
  ruleCategories: ['类别一', '类别二'],           // 注入大纲提取 prompt
  findingKinds: [                                  // 问题类型表
    { id: 'my-issue', label: '我的问题', defaultSeverity: 'red', hint: '判定口径' },
    { id: 'other', label: '其他问题', defaultSeverity: 'yellow' },
  ],
  constraintKinds: ['max-score', 'date-range'],
  prompts: { role: '你是XX审核助手', guideline: '审核视角：…' },
  builtin: false,
}
```

加入 `BUILTIN_DOMAIN_PACKS` 即出现在 UI 领域包下拉里。要点：
- 类型表必须含 `other`（未知类型的收敛目标）
- `defaultSeverity` 决定模型未给严重度时的回落色
- 结构化指令（JSON 字段、锚点回引）在服务层硬编码，领域包只放领域知识——避免每个包各写一份导致漂移

## 四、改造要点（换业务域时改什么）

| 要改的 | 位置 | 说明 |
| --- | --- | --- |
| 审核规则/领域 prompt | **首选** `types/review-domain-packs.ts` 加领域包 | 已抽成数据（D14），无需改服务层代码 |
| mock 引擎的确定性规则 | `mock-review-engine.ts` | 六类检查（等级冲突/缺证明/超上限/互斥/日期越界/看不清）仍是综测语义；新领域若要用"无模型出口也能跑"的确定性审核，需在此补规则 |
| 锚点/切块逻辑 | `document-service.ts` | 已支持文本/CSV/SVG/PDF/Office（经 `../document-parser`）+ 图片（Vision 通路）；锚点协议 `blk-<slug>-NNN` 不变。多页 PDF 的页码目前恒为 1（待做） |
| 白名单出口 | `review.ts` 的 `REVIEW_MODEL_PROVIDERS` | 三值 `openai/custom/ollama`；`REVIEW_MODEL_PROVIDER_REJECTED_NOTICE` 文案同步 |
| 演示数据 | `demo-fixtures/` | 全部标注"模拟"；换真实数据时保持 `ReviewCase` schema 即可 |
| 联动特效语义 | `reviewFocusAtom` | 红黄蓝=severity；若新域有不同分级，改 `FindingSeverity` + `SourceBlockView` 高亮色映射 |

## 五、本仓库实测结论（拆出可行性证据）

- 服务层在 bun test 下以 `PROFER_CONFIG_DIR` 重定向即完整运行（56 测试；demo 阶段 32），**无 Electron 运行时依赖**（bunfig 的 electron mock 即证明）。
- 真机验证（2026-10-02 06:17，Electron 43 + 本地 bai 代理 mimo-v2.6-flash）：AI 引擎全链路 25 秒返回 7 条发现（`engine: 'ai'`、`generatedBy: 'ai'`）、助手真实模型回答、报告导出——同一套代码仅靠渠道配置从 mock 切到 AI，无一行代码改动。
- 网关与 UI 解耦：`getReviewModelGatewayStatus().available` 一处布尔决定走 AI 还是 mock，移植后接入方只需提供渠道配置（`channels.json`，API Key 用 `token-crypto` 同款 AES-256-GCM 或退化为明文占位）。

## 六、参考素材（references/）与数据源扩展

`/references` 已就位四类素材，均可作为第二批测试数据源：

| 素材 | 用法 |
| --- | --- |
| `cqes4cs-v1.1/cqes4cs.sql` | 申请/规则/复核表结构对照；字段关系可映射为 `ReviewCase` 扩展 schema（勿导入其真实数据） |
| `comprehensive-performance-simplifier` | "多图分选/错误/需补证"证据绑定语义，已在设计文档 §4 采纳 |
| `rda-tiger-17734784` | PDF/DOCX/XLSX 跨格式表单样本，适合验证 `document-service` 扩展解析器 |
| `oulad-uci` | 批量结构压力测试（7 关联 CSV）；注意 `studentVle.csv` 未解压约 454MB |

`evaluate` 项目仅 README、无源码无许可，只作类别覆盖面参考，不作为数据源（见 references/README.md 边界说明）。
