# p02-agent-runtime：Agent 执行权、会话、工具与技能

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

当前生产组合为 [apps/electron/src/main/lib/agent-service.ts:54](<../../../../baseline/source/apps/electron/src/main/lib/agent-service.ts>) PiAgentAdapter + AgentOrchestrator + EventBus；共享 runtime 类型/默认均为 Pi（[packages/shared/src/types/agent-provider.ts:12](<../../../../baseline/source/packages/shared/src/types/agent-provider.ts>)、:33/:41）。保留的 Claude 字面量/清理函数/旧注释不代表第二条当前 runtime。

普通输入从 main IPC → runAgent [apps/electron/src/main/lib/agent-service.ts:277](<../../../../baseline/source/apps/electron/src/main/lib/agent-service.ts>) → orchestrator.sendMessage → adapter；事件总线转发 renderer/headless 订阅，session JSONL 保存历史，内存 active/completed backlog 用于刷新恢复而非永久主账。Agent service 排除 review-owned/已删 owner 的普通会话投影，审核内部 session 不能因使用同一个执行器而暴露为普通聊天。

执行权属于 Orchestrator 的 active owner；busy 拒绝不能广播该 owner 的伪终态（[apps/electron/src/main/lib/agent-service.ts:366](<../../../../baseline/source/apps/electron/src/main/lib/agent-service.ts>)）。stopAgent 仅请求停止；stopAgentAndWait 等真实生命周期 finally 释放，超时 reject 不代表释放（[apps/electron/src/main/lib/agent-orchestrator.ts:3672](<../../../../baseline/source/apps/electron/src/main/lib/agent-orchestrator.ts>)）。删除等依赖步骤不能先清持久文件后等待停止。

会话生命周期由 [apps/electron/src/main/lib/agent-session-manager.ts:552](<../../../../baseline/source/apps/electron/src/main/lib/agent-session-manager.ts>) 创建，workspace 由 [apps/electron/src/main/lib/agent-workspace-manager.ts:190](<../../../../baseline/source/apps/electron/src/main/lib/agent-workspace-manager.ts>) 创建及索引 writer 管理；metadata、消息文件、Pi harness 日志分别有职责，不把任意一份会话快照当完整执行证据。分叉复制 settled harness events 的路径在 [apps/electron/src/main/lib/pi-harness/pi-harness-store.ts:69](<../../../../baseline/source/apps/electron/src/main/lib/pi-harness/pi-harness-store.ts>)。

工具和技能在 orchestrator 组装。review-ops 根据预设/禁用分组/当前用户轮绑定注入（[apps/electron/src/main/lib/adapters/pi-builtin-tools.ts:2087](<../../../../baseline/source/apps/electron/src/main/lib/adapters/pi-builtin-tools.ts>)）；直接审核再由 [apps/electron/src/main/lib/agent-orchestrator.ts:1706](<../../../../baseline/source/apps/electron/src/main/lib/agent-orchestrator.ts>) 筛成受限四项工具，:1852 重核工具许可。普通操作工具与直接审核工具是不同分支，不能把一般会话可用工具全带入严格审核。

失败/恢复：执行状态、session metadata、工具结果、harness checkpoint 不是同一状态机。真实运行回调按 owner 收尾；工具路径授权 realpath、permission 和 grant 仍需逐项核对。内部 V3 owner/技术 spool 能力存在，不表示已替换普通 Pi 主链；见 API 的 V3 内部接口节。

继续阅读：[逐文件导航与接受状态](<../../../INDEX-VERIFICATION/p02-agent-runtime.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
