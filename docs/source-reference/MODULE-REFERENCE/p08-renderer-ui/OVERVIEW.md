# p08-renderer-ui：Renderer 导航、状态投影与业务交互

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

Renderer 负责 React/Jotai 状态、导航、表单和用户反馈，Main 文件/业务服务负责权威写入；本地 atoms 或可见按钮不是授权凭证。

入口 [apps/electron/src/renderer/main.tsx:1059](<../../SOURCE/apps/electron/src/renderer/main.tsx>) 先区分独立 preview/planning 窗口，主分支 :1123 render App。App 加载设置/onboarding 后通知 renderer ready（[apps/electron/src/renderer/App.tsx:38](<../../SOURCE/apps/electron/src/renderer/App.tsx>)、:58），AppShell 组合 MainArea。真实导航在 [apps/electron/src/renderer/components/tabs/MainArea.tsx:321](<../../SOURCE/apps/electron/src/renderer/components/tabs/MainArea.tsx>)：planning/agent-skills/CDUT专区/科学实验室/普通tab；材料审核由 [apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx:330](<../../SOURCE/apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx>) 挂 ContentReviewView，不能把未找到的 layout/MainArea 当入口。

审核工作台 `ContentReviewView` → useReviewActions（[apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:82](<../../SOURCE/apps/electron/src/renderer/components/content-review/ContentReviewView.tsx>)）→ `startBackgroundPiReviewV2`（[apps/electron/src/renderer/components/content-review/use-review-actions.ts:15](<../../SOURCE/apps/electron/src/renderer/components/content-review/use-review-actions.ts>)）→ preload reviewAPI → Main。启动 receipt 后另读 Run；UI 不自行造 assignment/actor/真实来源。review-atoms [apps/electron/src/renderer/atoms/review-atoms.ts:34](<../../SOURCE/apps/electron/src/renderer/atoms/review-atoms.ts>) 保存 workspace section、case/run/aggregate投影、stale/execution/focus；案卷/run/aggregate/stale/execution 缓存按 caseId 分开，section/selection/focus 另为界面状态，选择别案不应让旧响应覆盖当前案。

review actions/controller 负责调用、刷新和错误反馈；结构化 `ok:false`、IPC reject、部分提交 rejected/missingChecks、stale 和 cancelled 必须分别显示，不能把 Promise resolve 或技术 completed 显示成业务批准。T05/T07 capability/view 仅展示，最终权限/准备度由 Main 重核。

普通会话由 TabContent 渲染 AgentView，流事件/历史/刷新恢复通过 p02 的 bridge；MainArea 对 browser push 只为当前激活会话自动打开 tab，后台状态仍按 session 缓存（[apps/electron/src/renderer/components/tabs/MainArea.tsx:88](<../../SOURCE/apps/electron/src/renderer/components/tabs/MainArea.tsx>)）。切换/关闭订阅和异步回包必须保留 session/case currentity；比如 MainArea :153 起对旧回包设 cancelled 标记。

CSLab Worker client [apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:81](<../../SOURCE/apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts>) 用请求ID/pending表和30s超时做计算RPC，dispose拒绝未决任务；计算结果展示不等同 Main 业务存档。开发候选/作者预览界面即使能显示结果也不授学校发布与正式决定权限。所有 UI/窗口/Worker 真机行为本轮 NOT_RUN，现有组件测试文件只证明测试实现存在。

继续阅读：[逐文件导航与接受状态](<../../INDEXES/p08-renderer-ui.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
