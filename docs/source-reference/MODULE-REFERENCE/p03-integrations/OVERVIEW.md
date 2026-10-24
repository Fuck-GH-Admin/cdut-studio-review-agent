# p03-integrations：外部集成、实验室与周边服务

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

此分区涵盖 browser/CDUT/CSLab、远程服务、Agent Fabric、study/RAG/team 等邻接能力；它们复用 Main/Agent 接口，但没有一套共同数据库或统一恢复协议。

CSLab 已接线为 main/ipc.registerIpcHandlers → registerCsLabIpc（[apps/electron/src/main/ipc.ts:6223](<../../SOURCE/apps/electron/src/main/ipc.ts>)）→ router → manager/iron-cage/manuscript/science 等服务。router 的集中 handle 包装在 [apps/electron/src/main/lib/cslab/cslab-router.ts:258](<../../SOURCE/apps/electron/src/main/lib/cslab/cslab-router.ts>)，除 AUTH_EXEMPT_CHANNELS 外调用 assertCsLabUnlocked；门禁是本地实验室访问门禁，不是学校身份认证。

实验室对象/文稿/材料元数据由 DB 与 manager 管，原件、Markdown/sidecar、DOCX、Parquet/preview 为不同落点；例如 digitized figure 先写图，再写 Parquet 与 preview（[apps/electron/src/main/lib/cslab/cslab-dataset-store.ts:110](<../../SOURCE/apps/electron/src/main/lib/cslab/cslab-dataset-store.ts>)）。不能把多文件顺序写称为完整数据库事务；失败时需按各 writer 的实际产物核对，不将磁盘文件存在等同业务登记完成。Service 遥测是本地单节点/内存负载，初始化日志有预置说明（[apps/electron/src/main/lib/cslab/cslab-service.ts:23](<../../SOURCE/apps/electron/src/main/lib/cslab/cslab-service.ts>)），不是集群实时遥测证明。

浏览器计算 Worker 与 Main 落盘分开：CSLab worker client 用 Vite ?worker 实例、请求ID/pending表和30s超时，dispose 拒绝未完成请求（[apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:39](<../../SOURCE/apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts>)、:81、:176）。Worker 计算返回不等于实验室已存档。

CDUT 登录管理器使用独立持久 session partition（[apps/electron/src/main/lib/cdut/cdut-auth-manager.ts:45](<../../SOURCE/apps/electron/src/main/lib/cdut/cdut-auth-manager.ts>)）、登录窗和 keepalive；主进程证书策略在 [apps/electron/src/main/index.ts:135](<../../SOURCE/apps/electron/src/main/index.ts>) 拒绝黑名单、对明确 CDUT 域分支处理。不能从本地 UI 标签推导已获得学校审核权限。

远程服务由设置或显式入口启动，token 保存在同一配置根 remote-token.json（[apps/electron/src/main/lib/remote-service.ts:409](<../../SOURCE/apps/electron/src/main/lib/remote-service.ts>)），命令分发 [apps/electron/src/main/lib/remote-service.ts:793](<../../SOURCE/apps/electron/src/main/lib/remote-service.ts>) 复用 Agent 服务；不要把 remote 独立 HTTP/WS 端口混成 Electron IPC。Agent Fabric 则有显式 start/stop 与 file task/event stores（[apps/electron/src/main/lib/agent-fabric/agent-fabric-service.ts:76](<../../SOURCE/apps/electron/src/main/lib/agent-fabric/agent-fabric-service.ts>)、:138），共享协议来自 p07。

失败/恢复：网络、登录、Worker、Python/外部工具、文件/SQLite 各有自己的错误边界；本概览只静态证明已见装配，不宣布网络/真实学校/Python/HPC 全链运行成功。对应源码/手册和当前接受状态见逐文件导航。

继续阅读：[逐文件导航与接受状态](<../../INDEXES/p03-integrations.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
