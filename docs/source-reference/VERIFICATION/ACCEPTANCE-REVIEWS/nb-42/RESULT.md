# NB-42 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 18 文件/2794 行（p07-shared-libs：project-core 10 + session-core 8）
- 交付：`deliveries/nb-42/`（seal_delivery.py/1 v2，sealId `seal-c54eec989385645b`，sealedAt 2026-10-23T17:15:13Z）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-42/SOURCE-CHECKLIST.md`（18 文件全读，含 project-core.test.ts 864 行三段；77 用例逐组点名）
- **批次判定：revision_required（13 accepted / 5 revision_required / 0 unknown）**——13 篇按 exact hash 合入；5 篇退回 `nb-42-r1`
- 测试/typecheck/build **NOT_RUN**

## G0 完整性（PASS）

18/18 源绑定（blob=git ls-tree HEAD/sha256/行数）== MANIFEST == SCOPE 独立重算全等；18/18 `manualSha256` == stage 字节；DONE 三哈希链自洽；ZIP `R07-nb-42-05fb2565.zip` 21 条目（不含 READY/DONE 属 v2）无穿越/0 mismatch；人工证据列 18/18 非空；元数据头 11 键 18/18。

## G1 结构（PASS）

18 篇章节齐全；导出清单语义与源吻合（计数问题见 F 系）；三分+NOT_RUN 18/18；批内 77 测试用例（70/5/2）与源 `test(` 总数一致。

## G2 源码真实性（13 PASS / 5 返修）

**正面确认（QA 预读硬约束全落实、多篇精确否定照实记录）**：
- graph-state 8 事件分支语义逐条吻合：dependsOn 显式替换 vs 合并、abandon 保守置 cancelled（completed 保留）、deleted 真删清悬挂引用、status_changed 缺 created fallback 重建、reconcileDependedBy 全局修复
- harness-query 焦点四级优先（in_progress 最旧→previous_focus 有效性→最旧 ready→blocked→graphless）与 `@verify:` 仅显式标记不推断
- task-tool-names `mcp__task[-_]graph__` 前缀兼容 + 历史裸名；project-meta `isSafeSessionId` 白名单防路径逃逸（8 类拒绝用例）
- group 五规则+mergeAdjacentSameModelTurns 阻断链（startsAfterWake/user 输入/compact 边界）+ `countTurns` 水位口径；read 旧格式检测/坏行静默容错；双入口浏览器安全边界（node.ts/read-fs.ts）
- 精确否定全部为真：countTurns/extractMeta/convertLegacyMessage 无外部消费者（agent-session-manager:1350 为本地同名函数）、session-core.test.ts/graph-parser 等批外标未知

**返修 5 篇（F-01..F-05，均为计数/归属事实错，语义描述正确）**：

| id | 对象 | 摘要 |
| --- | --- | --- |
| F-01 | types.ts.md | 「36 个导出」×3 处，实为 **33** |
| F-02 | graph-state.ts.md | graph-parser「同批另一文件」误述——不在 18 清单（index 手册的「18 清单外」才是对的） |
| F-03 | project-meta.ts.md | 「导出 11 条」实为 **12**（自身枚举 12 个位置） |
| F-04 | project-core/index.ts.md | 「types 36 类型」→33；「harness-query 4+4」→**3+4** |
| F-05 | project-core.test.ts.md | 「5 个顶层 describe」实为 **7**（自列 7 组矛盾）；graph-parser「12 用例」实为 **17**；graph-state「11 用例」实为 **12**；「引 35 符号」实为 **33** |

非阻断：M-01 正面确认；M-02 批外限定与 NOT_RUN。QA 过程备注：生成产物时曾因两个同名 `index.ts.md`（project-core/session-core）键冲突误伤后者，已按完整路径重建三件产物修正（session-core/index 实为 accepted）。

## 合入绑定

- **acceptedHashes（13）**：harness-query.ts / task-tool-names.ts / harness-query.test / task-tool-names.test / tsconfig.json / session-core 的 package.json / group.ts / index.ts / node.ts / read-fs.ts / read.ts / render-markdown.ts / outline.ts
- **rejectedHashes（5）**：F-01..F-05 手册当前哈希不合入；`nb-42-r1` 修订后按新 hash 复验。见 `RESULT.json`/`REVIEWED-HASHES.json`。
- 未写 deliveries/inventory/manager/candidate/全局 FILES/COVERAGE/MANIFEST/INDEX；预读产物原样保留。
