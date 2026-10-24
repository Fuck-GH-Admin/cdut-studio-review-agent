# NB-19 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope `manager/assignments/nb-19-SCOPE.json` 18 文件/3706 行（p05-review-engine · p05.review-v3-residual）
- 交付：`deliveries/nb-19/`（seal_delivery.py/1 v2，sealId `seal-760acee7124aac19`，sealedAt 2026-10-23T16:29:09Z）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-19/SOURCE-CHECKLIST.md`（18 文件逐行全读+全树回源）；本轮对 18 篇手册全文逐篇回源比对
- **批次判定：accepted（18 accepted / 0 revision_required / 0 unknown）**
- 测试断言≠运行：产品测试/typecheck/build/GUI/真实模型 **NOT_RUN**

## G0 完整性（PASS）

- 18/18 源绑定独立重算 == MANIFEST == SCOPE：blob（git ls-tree HEAD）/ sha256（冻结树字节）/ 行数全等。
- 18/18 手册 `manualSha256` == stage 现字节 == COVERAGE/SOURCE-EVIDENCE 列值。
- 哈希链自洽：DONE.manifestSha256 == MANIFEST 实算、DONE.readySha256 == READY 实算、DONE.zipSha256 == ZIP 实算。
- ZIP `R07-nb-19-05fb2565.zip`（21 条目 = 18 stage 手册 + MANIFEST + 2 mechanical TSV；不含 READY/DONE，符合 seal v2 防自哈希循环设计）：无路径穿越/符号链接，逐条目与磁盘 0 mismatch。
- 交付 SCOPE.json 与 manager SCOPE 文件绑定一致；changes.diff（1868 行 new-file 补丁）与 stage 字节一致；人工证据列（SOURCE-EVIDENCE.tsv humanEvidence / COVERAGE.tsv humanCoverageNotes）18/18 非空，无机械列冒充。
- 元数据头 11 键 18/18 齐全；`status: authored`、reviewer 为包名配对（M-03）。

## G1 结构（PASS）

- 必备章节齐全有内容（结论与边界/导出/逻辑/调用链/IO/失败恢复/权限/影响面/测试/三分/覆盖表；test 手册为 目标/用例清单/真实断言/未覆盖/三分/覆盖表）。
- 导出清单与源码逐条吻合（抽查全量 export 行号：b4-r25 9 条、rule-source-diff 4 条、coordinator 5 条、t03 6 条、contract 4 条、producer 8 条、turn-budget 3 条、pi-http 4 条、demo-publish 8 条、report-snapshot 15 条）。
- 已证实/推断/未知三分 + NOT_RUN 明确 18/18；行号引用均在文件范围内可解析（偏差见 N 系列）。
- 测试计数与源码 `test(`/`it(` 逐点一致：7+5+8+1+16+12+1 = **50 用例**（7 测试文件）。

## G2 源码真实性（PASS，逐文件回源）

重点验证（相对独立预读的新声明全部回源）：

1. **proposal-producer**：receipt 幂等/`REQUEST_ID_COLLISION`/terminal 封链双检/旧 grant 不计覆盖（:200-202）/needs-resume 预算闸（:234-243）与源一致；作者如实记录 `read()` 内重复 `assertAuthorized`（:340/:342-345）现存实现观察——与 QA 预读结论一致。
2. **pi-http-provider-engine**：单 fetch/单 streamFunction、`redirect:'error'`、SSE 双 API 终帧判定（completions `[DONE]` / responses `response.completed`+type 正则）、禁 clone/tee、WeakSet 防复用、finally 恒 dispose——逐条对源无误；「无专属测试」否定经全树 `*.test.ts` grep 复核成立。
3. **coordinator**：冷 PID 恒 `recovery-required`/quota 四分类不重试/256 tombstone/CAS 失败不伪造终态/stop 无条件 abort——语义全对（行号漂移见 N-01）。
4. **T03 门**：`run@rev` 假 Run、awaiting 双计、例外/人工处置字段完备、`runCurrent` 先于 stage-pass 附加检查（:215 vs :219）；16 用例行号逐点与源一致；`selectT03CurrentRun` 无生产调用者（runtime-contract 仅用 `assessT03RunAction` :161/:185）否定成立。
5. **demo-publish**：IPC 链 review-ipc:960-963 → preload:4932 → ContentReviewView.tsx:168 三链抽验全中；`publishD4Templates`/`isCleanName` 无直接测试否定成立；政策引用恒空/semantic 判据/TAR-11 跳过语义对源无误。
6. **b4-r25/b4-rule-source-diff**：32 pin/1 spill（G06-T06/R-34 +2 行）/107 规则/3 模板/恢复哈希硬编码全部对源；两文件无直接测试否定成立；输出恒 `cannotAuthorizeSchool`/`candidateOnly`。
7. **report-snapshot**：决定引用缺失拒绝换用、supersedes 同 Run、受众降级（agent/mock/unknown/缺失）、archiveCycle 公式、指纹四元组——12 用例行号逐点一致；`reportAudienceOptions` 无调用/无测试否定成立。
8. **test 手册 7 篇**：用例数、fixture/mock 真实边界（R24 coordinator 全 mock、R22 假物理 Host、R22-C-03 linux-only）、未覆盖点、NOT_RUN 表述——与源逐行一致，无「已运行」冒充。

## 发现汇总

| id | 级别 | 对象 | 摘要 |
| --- | --- | --- | --- |
| N-01 | non_blocking | coordinator 手册 | 中段 9 处行号偏 1-5（语义无误） |
| N-02 | non_blocking | rule-source-diff 手册 | 7 处行号偏 1-2 |
| N-03 | non_blocking | b4-r25 手册 | 6 处行号偏（封口 :204-205→:202 等） |
| N-04 | non_blocking | producer 手册 | §3.1 引用偏 8-11、§3.2 ±1-3 |
| N-05 | non_blocking | t03 手册 | 3 处 ±1-3 |
| N-06 | non_blocking | contract 手册 | 3 处 ±2 |
| N-07 | non_blocking | demo-publish 手册 | IPC 注册行 :961→:960 |
| N-08 | non_blocking | turn-budget 手册 | 2 处 ±1-2 |
| N-09 | non_blocking | r22 测试手册 | fixture 区段 ±2-5 |
| M-01 | info | 交付元数据 | STATUS.json status 字段陈旧（pre-seal），不在哈希链内 |
| M-02 | info | QA 预读 | QA 清单「12 源+6 测试」笔误（实 11+7），作者已如实更正——reviewer 侧更正记录 |
| M-03 | info | 手册 YAML | reviewer=包名配对，符合惯例 |

每文件非阻断备注均归并为 1 条（≤2），无 blocking、无事实错误、无冒充已验 → 18/18 accepted，批次 accepted。N 系列是否开 nb-19-r1 由经理/作者裁决（修行号属可选精化）。

## 绑定

- 18 个 acceptedHashes（manual→sha256）见 `RESULT.json`/`REVIEWED-HASHES.json`（stage 现字节实算）。
- 未写 deliveries/inventory/manager/candidate/全局 FILES/COVERAGE/MANIFEST/INDEX；未改作者正文/源码；旧 reviews 未动。
