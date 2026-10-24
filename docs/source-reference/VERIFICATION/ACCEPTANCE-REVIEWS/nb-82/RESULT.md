# NB-82 独立 QA 验收报告（D0）

- 批次 `nb-82`（p03-integrations · p03.browser-bridges，18 文件 / 4649 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-23d161e252555a15`（18:18:09Z）；QA `docs-r07-qa-nb-06-20261023`（09:30:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（6 minor，每文件 ≤2）
- **NOT_RUN**（批内 58 个测试用例静态读断言）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-82-SCOPE。

## G2 — 逐文件（18 文件 4649 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| remote-service.ts | accepted | NB82-N3（31 vs 24 用例）、NB82-N4（~50 vs 74 命令） |
| skin-manager-service.ts | accepted | NB82-N5（8 vs 10 用例） |
| skin-manager-service.test.ts | accepted | NB82-N6（"8 个 test()" vs 10，自家清单列 10 项） |
| process-monitor.ts | accepted | NB82-N2（17 vs 19 导出） |
| remote-relay-client.ts | accepted | NB82-N1（3 vs 4 导出） |
| 其余 12 篇 | accepted | — |

复算命中：10 测试文件 **58 用例**断言行号基本全对（含 uuid/startedAt 逐字透传、symlink 逃逸拒绝、诱饵目录不泄露、事件日志三分支、端口锚定防误判）；红线逐条对源——远程披露边界（depth>32 fail closed/只检 ID 形态）、review 会话默认拒绝、客户端 roots 永不采纳、附件绝不授权整个 configDir、CSLab 信任仅显式 bypass、Relay ticket 仅握手发送+帧限、pid 无转世双因子 kill、皮肤包禁符号链接/ZIP 穿越/Windows 保留名跨平台拒——全部与手册摘录一致。remote-service（2156 行）命令面与生命周期描述逐段吻合。

## findings（6 minor，计数口径，grep 定案）

31→24 用例、~50→74 命令、17→19/3→4 导出、8→10 用例（两处）。无行为/红线/测试存在性错误。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-82/RESULT.json.acceptedHashes`，脚本生成三方核验）；6 findings 记 ACCEPTED-ERRATA，G4 前关闭。
