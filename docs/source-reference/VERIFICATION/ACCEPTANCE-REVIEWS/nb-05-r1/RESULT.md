# NB-05-r1 独立复核（docs-r07-qa-nb-05，MiMo/max）

**批次**：nb-05-r1（revisionOf nb-05）｜**冻结**：`05fb2565e2…37c2`｜**对象**：`apps/electron/src/main/ipc.ts`（8114 行）+ 手册 `ipc.ts.md`（1028 行，manualSha256 `7a8d945a0915a74c0fb9583f963b834565c57aa61f500c739aeb3c9c6bf5dff5`）

## 结论

**G0 PASS / G1 PASS / G2 PASS → batchVerdict = accepted（1 文件 accepted，0 revision_required，0 unknown）**；2 条非阻断 minor（N-01 分支计数/措辞、N-02 trivial 计数），可随任一未来修订轮顺带关闭。

## G0（完整性/哈希链，全部 QA 实算）

- 父批链：`SUPERSEDED-BY.parentSealed` 5/5 一致（父批 READY/DONE/MANIFEST/ZIP/手册字节未改）；r1 链：manual `7a8d945a…` 四处一致（SUPERSEDED-BY/READY.manualHashes/MANIFEST/SOURCE-EVIDENCE），ZIP `220d6ba3…`、MANIFEST `4411cbb3…`、READY `ac5c7a40…`、DONE `b5bdeb91…`、sealId `seal-ce3f146e62a6ede5` 交叉一致（seal v2，ZIP 不含 READY/DONE 属设计）。
- ZIP 4 条目逐字节=mnt 磁盘，0 穿越/0 符号链接/0 mismatch，mtime 全 1980-01-01。
- 返修链：`before/`==父批 stage 逐字节；`changes.diff`（`5b5d80c0…`）单 hunk（§6 行号倒置 `ipc.ts:4266-2475`→`4266-4275`），`git apply` 重放 == stage 逐字节。
- 源绑定：blob `691ae29c…`/sha256 `cdd428a9…`/8114 行 = SCOPE = 冻结树 = MANIFEST（独立实算）。

## G1（结构证据）

11 章齐备有实内容；5/5 导出与行号相符；§3.2 矩阵 A-U 分组计数合计 589 = 机械 584 handle + 5 on（on 行 1347/2302/2495/2914/2943 与 QA 独立提取一致）；829 处 path:line 引用 0 倒置/0 越界/0 悬空（10 个仓库路径全存在）；三分法与 NOT_RUN 齐备。

## G2（源码真实性，全文件而非抽样）

- 覆盖：**589/589 注册行全被矩阵引用（missing=0，机械比对）**；QA 预读已独立逐行读完源码 8114 行并自建 589 行矩阵（`reviews/nb-05/SOURCE-CHECKLIST.md`），本次按 r1 封版字节全量比对手册 1028 行。
- 事实核对 ≥30 组全部相符：导出/内部符号、注册期副作用 13 项、守卫体系（deny-by-default、只读放宽、54/43 守卫计数、KILL 双因子、热切回滚）、§10 全部 12 条现存实现矛盾逐条回源属实（含 QA 预读未发现的 4 条：3890 注释错位、4051"不广播"vs 4090 投影、ATTACH/DETACH realpath 不对称、GET_MESSAGES/GET_SDK_MESSAGES 守卫不对称）。
- 跨文件引用抽核：ipc-sender-guard.ts:22-59、agent-session-manager.ts:658-664、runtime.ts:361-408、planning.ts:13、goal-ipc-routing.test.ts 5 断言、ipc-sender-guard.test.ts 5 断言——逐条回源一致。
- 测试边界：断言≠运行，本轮 **NOT_RUN**（产品测试/typecheck/build/GUI/真实模型/网络均未运行）。

## Findings（均非阻断）

| id | severity | 摘要 | action |
| --- | --- | --- | --- |
| N-01 | minor | §6 team/本地分支称"14 处"实测 17 处 `type==='team'`；首例 6921-6926（LIST_TODOS）实为 workspaceId presence 路由，矩阵 6920 行"为 team 时"同误 | rN 改为 17 处 + LIST_TODOS 单列 presence 判定 |
| N-02 | minor | §11"副作用 14 项"vs §3.0 实表 13 行；"815 处引用"vs 反引号口径实测 814（宽口径 829） | rN 统一计数口径并注明统计正则 |

## 绑定

acceptedHashes = `{"MODULE-REFERENCE/p01-app-shell/FILE-REFERENCE/apps/electron/src/main/ipc.ts.md": "7a8d945a0915a74c0fb9583f963b834565c57aa61f500c739aeb3c9c6bf5dff5"}`；旧接受不套新字节，本结论只绑 r1 当前字节。QA 自纠：预读清单对 LIST_TODOS 同样简写"team→"，以 N-01 为补充更正记录（不回写已发布清单）。
