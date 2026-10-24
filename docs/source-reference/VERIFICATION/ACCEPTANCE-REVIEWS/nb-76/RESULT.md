# NB-76 独立验收报告（G0/G1/G2）

- 批：nb-76（11 文件/1476 行，p03-integrations · cslab）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-76/`（sealId `seal-0eadc153bec5d3ca`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— **11 accepted / 0 revision_required / 0 unknown**。
- 测试/构建/GUI/uv 下载链/SQLite/Zotero 探活：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链/ZIP/源绑定 11/11（==SCOPE==MANIFEST）/manualSha256 无 drift/changes.diff 重放 11/11/人工列 11/11/元数据 11/11。

## G1 格式：PASS（带名引用 12/12 在范围）

## G2 源码真实性：FULL（11/11）
11 源文件 1476 行逐行深读 + 11 手册逐篇对照。

### 正向核验
1. **红线与分级语义三方一致**：uv 三级校验（官方权威不符即 reject **不可被 pinned/mirror 降级放行**、镜像自证仅判传输损坏须用户确认、无指纹拒绝）在源码 `classifyUvChecksum`、uv.test 4 用例、手册逐字一致；默认拒绝弹窗（defaultId 0）、审计双向留痕、临时目录 finally 清理、60s 总熔断、`UvConsentDeniedError` 终止整轮均如实转写。
2. **计数精确**：index 42 模块清单、cslab-types 8 项 re-export、cslab.test 3 锚点（含「controllerMessage 不含雫窝」「quantumCoherence=0 不伪造」「latencyMs=0」）、window-manager 5 导出、uri 4、bridge 3 与手册一致。
3. **红线注释全数转写**：「外部进程绝不 INSERT/UPDATE zotero.sqlite」（zotero-bridge 预留桩如实标注）、vault-cache「replaceVaultLinks 不自开事务须外裹」「空键返 0（SQLite 不支持 IN ()）」、window-manager 导航安全（will-navigate 拦截+http(s) 外开+deny 弹窗）与「初始上下文不推送防覆盖草稿」。
4. 跨文件归属登记（cslab-service/cslab-python-runtime 非本批）准确。

### 非阻断备注（3 条，随 rN 顺带关闭）
| 文件 | note |
| --- | --- |
| `cslab-uv.ts.md` | **N-NB76-01（low）**：「12 导出」→14；**N-NB76-03**：§9「8 用例」→9。 |
| `cslab-vault-cache.ts.md` | **N-NB76-02（low）**：「14 导出」→16。 |
| `cslab-uv.test.ts.md` | **N-NB76-03（low）**：「3 describe、8 test」→9（自身枚举 2+3+4=9）。 |

### 处置
**11 篇全量合入**（`reviews/nb-76/REVIEWED-HASHES.json` exact manualSha256）。证据：`reviews/nb-76/{RESULT.json,REVIEWED-HASHES.json,DONE.json}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
