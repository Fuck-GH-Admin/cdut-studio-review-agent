# Agent C C0｜独立集成预检（2026-10-17）

**状态：C0_INPUT_VERIFIED / RUNTIME_NOT_RUN / GOLD_UNREAD。** 此报告仅涵盖 C0，不能当作业务验收。

## 固定来源
- D3-R0：`4b191c729f3d5f8135c73b87c17642023f6c3986`
- A 固定提交：`e3321add7322fba29169f0faeac9bc66571067e0`，PR #81（不跟随分支 HEAD）
- G01-I v1.7 原文提交：`8989941b6fb5651564e32d11c4215b6a6d5a5209`；期望 SHA256 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329`（C 已读取 GitHub 源，尚未独立重算原始 UTF-8 字节）
- B 输入 ZIP `33ad9e1fe5104cae91463218293ae58ccd27c934ff091b0687b20c64d699b26c`：**C 本地逐字节 SHA 匹配、CRC 合格**；120 实体文件、28 个 case JSON、28 个测试可信夹具、58 个现行材料 MD + 1 个旧版 MD；119 条文件清单哈希/大小及 59 条材料索引哈希全通过。
- B Gold 存在于用户文件库，但 C0 **未读取、未解压、未核验内部内容**。不得把 B 的封存报告当成 C 的证明。

## 已读资料与接口
已从 D3 固定提交读取 `AGENTS.md`、`README.md`、设计文档 37/24/32/35、D1 `review-authoring-v1.ts`、D3 `review-d3-library.ts`、D2 `review-d2-plan.ts`、`review-d2-runtime.ts`、`review-d2-execution-gates.ts`。还读取 A 的来源目录、映射表、工作区、选择、49 Check 实际计划、验证记录、问题表及专项测试。

D1 CLI = validate/save/read/diff；D3 CLI = validate/export/import/freeze 等；D2 CLI = preview/register/create/attach（写操作必须隔离 `PROFER_CONFIG_DIR`）。A 的 D2 计划包含 **49 rules / 49 mappings / 0 subjects / 0 targets**，不是 B 的 28 个业务动态计划。

## C 真正执行过什么
`python3 tests/verify_input_zip.py INPUT.zip --output PRIVATE_RESULT.json`，退出码 0，完成封包/清单/索引/案卷-可信夹具匹配。完整输入和详细输出保存在私有 C0 本地目录，没有公开推送。

未运行独立 Bun D1/D2/D3 CLI、Pi 或 28 个真实业务案卷。原因：本会话容器无 Bun、GitHub DNS 克隆不可用；连接器允许冻结源码读取及提交，但不等于运行服务。A 自述 CI 38978918519 属于 A 的运行而非 C 的独立回执。本 PR 附独立 Bun 测试；仅在 C 分支 CI 可核后另行记录结果。

## C0 已确定的技术门槛
- `D2_SCENARIO_SCOPE_REQUIRED`：目前带情景的模板仅允许单一校园卡 Target，不允许 G01-I 合法学生多字段动态 Target。
- `D2_UNMAPPED_ADVANCED`：非空高级事实-证据关系禁止静默编译。
- 单纯更改 `caseFields` 不参与 A 的 D2 49 条通用语义计划选择；可信学籍源与申请人陈述没有已接线的 typed 权限契约。
- 当期校规仍待确认，不能把外校或旧版条款提升为正式拒件要求。
