# p07-shared-libs：共享契约、纯核心与跨环境边界

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

共享包提供 Main/Renderer/CLI 共同使用的类型与纯行为；它们不因导出权限类型就拥有身份/文件/网络授权。全部 export/type/reexport 的精确来源在 API 注册表逐文件列出。

`@profer/shared` 统一导出 [packages/shared/src/index.ts:5](<../../SOURCE/packages/shared/src/index.ts>)；其 types 下定义 Agent、review V1/V2/C0/V3、CSLab、study 与通道族。修改签名需同时追 Main handler、preload、Renderer/Agent 调用方。C0 [packages/shared/src/types/review-v3-c0.ts:31](<../../SOURCE/packages/shared/src/types/review-v3-c0.ts>) 区分 Main Principal、不可变 Plan、物理 Source、Run evidence 和 ExecutionEvent；结构类型通过不等于当前授权通过。

`@profer/core` 根入口 [packages/core/src/index.ts:1](<../../SOURCE/packages/core/src/index.ts>) 只 runtime 导出 browser-safe providers/highlight，PDF/Office 只 type export；Node 实现通过 /pdf-engine、/office-engine 子路径消费。把 Node 子模块从根运行时重导出会污染 Renderer bundle。provider contract [packages/core/src/providers/types.ts:283](<../../SOURCE/packages/core/src/providers/types.ts>) 与普通 Pi adapter 是不同抽象面，不能仅有 ProviderAdapter 就认定 Agent runtime 已切换。

`@profer/session-core` 根 [packages/session-core/src/index.ts:1](<../../SOURCE/packages/session-core/src/index.ts>) 是读取字符串/legacy归一、turn分组、快照去重、transcript、outline/search/select/render 的纯接口；文件IO在 /node 子入口。Main 与 CLI 共用解析，避免各自复制一套不同的会话格式语义。

`@profer/project-core` [packages/project-core/src/index.ts:1](<../../SOURCE/packages/project-core/src/index.ts>) 导出任务图解析/事件应用/查询、Harness focus 和项目元数据纯函数；调用方负责事件来源和持久化。`@profer/agent-fabric` [packages/agent-fabric/src/index.ts:1](<../../SOURCE/packages/agent-fabric/src/index.ts>) 是协议/能力/node/task/state-machine/graph/events/artifacts/approval/gateway 契约层，Electron 服务装配在 p03，不绑定 Pi 或 Electron runtime。

`@profer/ui` [packages/ui/src/index.ts:5](<../../SOURCE/packages/ui/src/index.ts>) 提供共享界面 primitives、Markdown/代码块/Mermaid/hooks；React UI 包不持有 Case/会话落盘权威。模块纯函数可失败/返回校验结果，具体异常/联合类型仍以每个来源定义为准，不存在本层统一文件回滚或运行恢复服务。

继续阅读：[逐文件导航与接受状态](<../../INDEXES/p07-shared-libs.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
