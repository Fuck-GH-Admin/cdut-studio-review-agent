# p05-review-engine：解析、审核运行、证据与报告

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

该分区包括文档解析/能力库、应用与事实/证据服务、V1/V2 运行图、普通 Pi 案卷审核、模板/报告和 V3 技术提案能力。入口版本并存，不能仅按名字认定谁替代谁。

材料由 [apps/electron/src/main/lib/review/document-service.ts:466](<../../SOURCE/apps/electron/src/main/lib/review/document-service.ts>) 解析为可引用块，再由登记/导入服务绑定真实 DocumentVersion。解析文本、来源原件、材料版本与读取 receipt 分开：文档能力库 [apps/electron/src/main/lib/review/document-capability-library.ts:67](<../../SOURCE/apps/electron/src/main/lib/review/document-capability-library.ts>) 只读当前激活版本，块分页/图像读取受大小/路径/格式限制。仅“文本里包含 quote”不能证明当前 Agent 读过它。

工作台普通 Pi 主链是 use-review-actions →后台 bridge → preparePiReviewRunV2 [apps/electron/src/main/lib/review/pi-case-review-service.ts:452](<../../SOURCE/apps/electron/src/main/lib/review/pi-case-review-service.ts>) → admission [apps/electron/src/main/lib/review/review-pi-admission.ts:64](<../../SOURCE/apps/electron/src/main/lib/review/review-pi-admission.ts>) → p02 的 runAgent。prepare 固定模板/输入 manifest/规则目标、建立 grant+run；admission 只在真实 owner 取得后 ACK，running 文件不是 ACK。复用旧 Run 只允许模板/输入一致的部分完成检查点。

直接工具由宿主绑定 case/run/actor。submitPiReviewResultV2 [apps/electron/src/main/lib/review/pi-case-review-service.ts:915](<../../SOURCE/apps/electron/src/main/lib/review/pi-case-review-service.ts>) 核当前 grant/运行/模板/输入、事实类型/作用域/引用和语义目标，逐项接收或拒绝；确定性检查由服务重算。文字需当前读取账/完整预览，图像须真实图像块核验（:738）。模型不能指定业务 Actor、制造确定性规则通过或越过未确认规则。

状态不变量：finish=true 且无 missing/rejected 才标 completed；否则有效部分保留并保持 running（:1040）。completed 后 business readiness 独立落盘（:1094），分析结束不是批准。宿主回合结束却无有效 finish→partially-completed，停止→cancelled，失败→failed（[apps/electron/src/main/lib/review/pi-case-review-service.ts:1128](<../../SOURCE/apps/electron/src/main/lib/review/pi-case-review-service.ts>)）。报告必须保留分析、当前输入有效性与正式决定的区别。

run-store-v2 [apps/electron/src/main/lib/review/run-store-v2.ts:24](<../../SOURCE/apps/electron/src/main/lib/review/run-store-v2.ts>) 是独立 runs-v2 文件与 artifacts；该 writer 固定 tmp+rename，不承诺原生 Case 主账的跨PID锁。启动对 queued/running 做 interrupted 拒止/failed 标记；冷恢复需用户确认新回合，不重放未知 Provider 请求。另有 runReviewCaseV2 [apps/electron/src/main/lib/review/run-service-v2.ts:97](<../../SOURCE/apps/electron/src/main/lib/review/run-service-v2.ts>) 的 executor graph，由 p06 async service/批次调用，不能与普通 Pi 直接审核混画成同一次执行。

V3ExecutionEventAdapter [apps/electron/src/main/lib/review/review-execution-event-adapter.ts:85](<../../SOURCE/apps/electron/src/main/lib/review/review-execution-event-adapter.ts>) 是带序号/ACK/物理来源身份的 durable proposal outbox，不写 Case/Check/Decision；guardedRead :253 await 两侧重核授权。技术 Owner/SDK/background 能力的测试和内部实现不能直接充当当前业务 Run 已封存或学校已批准的证明。

继续阅读：[逐文件导航与接受状态](<../../INDEXES/p05-review-engine.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
