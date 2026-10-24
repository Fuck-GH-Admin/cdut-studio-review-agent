# nb-133 独立复核报告（QA：docs-r07-qa-extra-01-20261024）

- 批次：nb-133（T8，p01-app-shell · p01.main-cross，18 文件 / 3871 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 作者：docs-r07-author-extra-01-20261024；封版 `seal-f8b485af769bc961`（sealedAt 2026-10-23T20:31:28Z）
- **batchVerdict：accepted（18/18）——本组收官批，手册正文零事实错误**

## G0 — PASS

18/18 字节=scope；MANIFEST→READY→DONE→ZIP 链复算全对；sealId 复算一致；ZIP 21 条目干净 0 漂移；front matter 逐字段合规；章节 12×11 + 6×6 全合规。

## G1 — PASS_WITH_NOTE

UNVERIFIED.md 六节显式，8 条实现注意点照实记录（含作者自查出的 `enqueueChange:123` entityId/workspaceId 疑似笔误、死信头注释路径与实现不一致、未用 import、非原子写等）；唯 §1 头部拆分求和错误（N-02）。

## G2 — PASS（18 篇全文对源，3871/3871 行）

- **计数全对**：导出 11/2/3/17/2/3/2/2/3/8/3/7；test 21/5/7/3/3/6=45。
- **行为事实逐条吻合**：cert-blacklist 四分支「泄露链严格先于校内豁免」+ issuerName-only 匹配论证 + 哨兵双通道回投；storage-service 先引用集后删 + 正则单向安全禁缓存论证 + 元目录豁免；sync-manager 死信 5 次阈值不静默丢弃 + 游标「>0 才推进」防倒退 + 401 刷新重试一次；runtime-process-registry 15s 去重 + 30s 巡检三段 + PID 转世拒绝 + 端口强证据；screenshot CSP `script-src 'none'`+消毒+串行锁；safe-file 三层容错（.tmp 提升/.bak skipBackup 防覆盖）；speculative-tool-engine 50MB 未实现驱逐+一次性消费 20s TTL；settings-service 旧键归一链+AI 代批双防线（通道剥离+严格布尔）。
- **跨文件引证实测命中**：ipc.ts:2200（剥离注释）/6677-6687/6749、index.ts:163/661/688/807/819/925-926（双会话 cert 装配）、settings-service **37 个消费文件恰中**、runtime-process-registry.test.ts（他批 9 用例断言级引用界定准确）。
- **否定/自查复核为真**：speculative-tool-engine 全树零生产消费者（孤立模块）、dead-letter 读取二导出零直接消费者、6 源文件零专属测试、`isSameProcess`/`terminateProcessTreeGracefully` 引而未用。

## Findings

| id | severity | 文件 | 摘要 | 处置 |
| --- | --- | --- | --- | --- |
| NB133-N-01 | minor | READY/DONE | 归属记旧波次角色（author-nb-47/qa-nb-47），实际 extra-01（第三例同类） | lead 合入登记按团队 JSON 更正；根因 seal_delivery.py 取 scope 归属 |
| NB133-N-02 | minor（计数） | UNVERIFIED.md | §1 拆分求和错误 3337/534（分项实为 729）→ 正确 **3142/729** | 勘误口径以本复核为准；随未来 rN 更正或记 errata；不影响手册技术事实 |

## QA 自身勘误（已关闭）

| id | 摘要 | 处置 |
| --- | --- | --- |
| QA-PRE133-N-01 | QA 预读拆分 3215/656 有误 | 更正为 **3142/729**（总数 3871 不变），PRE_READ_DONE 追加 errata 留痕 |

## 系统性观察（三批复发）

source/test 行数拆分求和错误在本组三批连发（作者三例 + QA 三例，总数均正确）——建议机械校验：按 kind 逐文件行数求和与总数交叉验证。

## NOT_RUN

产品测试 / typecheck / build / Electron-GUI / 真实 TLS / SSE / 同步网络 / 截图 / 进程巡检 / 磁盘清理 / bun test（45 用例仅断言级阅读）。未改源码/作者正文/candidate/全局总账/旧 seal；未 commit/push；未自审。
