# NB-69 独立验收报告（G0/G1/G2）

- 批：nb-69（14 文件/8585 行，p03-integrations · cdut 集成域）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-69/`（sealId `seal-2ae04e8153f86c0e`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— **14 accepted / 0 revision_required / 0 unknown**。
- 测试/构建/CAS 真实登录/青果端点/CDP 实跑：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链/ZIP/源绑定 14/14（==SCOPE==MANIFEST）/manualSha256 无 drift/changes.diff 重放 14/14/人工列 14/14/元数据 14/14。

## G1 格式：PASS（带名引用 31/31，含 3 处批外引用 index.ts:11/ipc.ts:150/pi-builtin-tools.ts:124 逐一对树核实在范围）

## G2 源码真实性：FULL（14/14）
14 源文件 8585 行逐行深读（事实库 `reviews/nb-69/SOURCE-CHECKLIST.md` §1-12）+ 14 手册逐篇对照。本批质量良好：

### 正向核验
1. **计数精确**：jw-client 40 导出、yanhu-browser-tools.test 80 test/22 describe（grep 双源一致）、auth-manager.test 9、domain-tools 4——与手册一致。
2. **负向声明属实**：「cdut-jw-client 全文件无超时/Abort」grep=0 成立；演示态"绝不编造教室/楼宇"红线在源码注释、domain-tools.test 断言（`toEqual([])`）、demo-service 手册三方一致。
3. **疑点照实登记**（质量亮点）：jw-client UNVERIFIED 6 条（kbjcmsid 硬编码 UUID:1250、注释「课程编号」vs 实现「课程体系」、午休列 sections=[12] 依赖消费端排除等）；auth-manager 6 条（明文密码入渲染脚本、StoredCdutAccount 缺 'expired'、'2.5 秒' 无实现等）；yanhu 手册如实登记 BUG-44~50/27~30 **无对应测试**+「标题与内容不符，空行疑似删测痕迹」；domain-tools 手册登记"标题宣称的网格对齐/停用词过滤无断言"。
4. **跨文件归属登记一致**：demo-service→jw-client 4 helpers、auth.test→extractProfilePhotoUrl、yanhu 被测模块均不在本批。

### 非阻断备注（2 条，随 rN 顺带关闭）
| 文件 | note |
| --- | --- |
| `cdut-demo/demo-service.test.ts.md` | **N-NB69-01（low）**：「6 test」应为 7（枚举第 6 项合并 :97/:106 两个 test）。 |
| `cdut-jw-client.ts.md` | **N-NB69-02（low）**：写操作启发式「6 处」应为 10 处精确+1 变体（:2660 加「不符合」），实测 :673/:716/:1794/:1817/:1953/:1976/:2004/:2660/:2686/:2789/:2933。 |

### 处置
**14 篇全量合入**（`reviews/nb-69/REVIEWED-HASHES.json` exact manualSha256）。证据：`reviews/nb-69/{RESULT.json,REVIEWED-HASHES.json,DONE.json,SOURCE-CHECKLIST.md}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
