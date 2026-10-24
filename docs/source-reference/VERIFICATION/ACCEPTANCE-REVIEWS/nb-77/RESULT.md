# NB-77 独立验收报告（G0/G1/G2）

- 批：nb-77（18 文件/3985 行，p03-integrations：agent-fabric 8/context-rag 5/feishu 5）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-77/`（sealId `seal-3c634b8ef06bc19d`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— **18 accepted / 0 revision_required / 0 unknown（零 findings 零 notes，本组首个全清批次）**。
- 测试/构建/GUI/飞书 API/Fabric 服务/真实 Agent：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链/ZIP/源绑定 18/18（==SCOPE==MANIFEST）/manualSha256 无 drift/changes.diff 重放 18/18/人工列 18/18/元数据 18/18。

## G1 格式：PASS（带名引用 30/30 在范围）

## G2 源码真实性：FULL（18/18，无偏差）
18 源文件 3985 行逐行深读（事实库 `reviews/nb-77/SOURCE-CHECKLIST.md` §1-12）+ 18 手册逐篇对照。

### 机械核验全对
- **导出计数 12/12 文件一致**：config 6/pairing 7/service 4/executor 2/store 3/server 4/chunks 16/retrieval 6/index 5/card-stream 1/run-state 12/renderer 2。
- **测试用例计数 6/6 文件一致**：store 3/server 10/chunks 6/retrieval 5/run-state 2/renderer 3。

### 内容亮点（全部实测核对为真）
1. **安全红线全数转写**：fabric-config host 硬锁 127.0.0.1（`PROFER_AGENT_FABRIC_HOST` 故意不支持）、fabric-pairing token 只存 sha256 明文一次性、fabric-server **actor 防冒充**（测试以 `spoofed-attacker` 锚定）、fabric-store requestId 幂等+事件序号重启不重置、executor 产物读取白名单（仅 session-transcript-*、512KB）。
2. **语义红线如实**：「不得声称执行了未实际运行的命令或测试」提示词、buildTaskResult 空置不编造、conversation-chunks「不采信不编造/thinking 不入索引/绝不改原始 JSONL」、conversation-index 只读红线、card-renderer 全卡片零 Emoji 断言。
3. **阈值与理由齐全**：30KB element 限制→工具≥3 折叠、Pi 累计快照按 uuid 替换防重复拼接、1800 字句界拆绝不截句、证据排除最近轮防与 recent_context 重复、400ms 节流+终态强制 flush、双引擎二次 RRF（BM25 1.5/0.75+覆盖 1.0/0.6+1-hop、词法×社群 0.7/0.3）。
4. **诚实登记**：zara 设计参考出处、@larksuiteoapi 三方依赖、hierarchical-graphrag 跨目录、配对脚本跨入口并发写无锁、bypassPermissions 现状（Phase 2/4 补齐）、各测试未覆盖面清单。

### 处置
**18 篇全量合入**（`reviews/nb-77/REVIEWED-HASHES.json` exact manualSha256）。证据：`reviews/nb-77/{RESULT.json,REVIEWED-HASHES.json,DONE.json,SOURCE-CHECKLIST.md}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
