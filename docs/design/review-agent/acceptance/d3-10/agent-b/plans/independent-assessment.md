# Agent B 独立验收：结果与限制

基线代码：`d16f047af653f7ba259456807c1fc150e9d0f417`；独立分支：`test/d3-10-agent-b-cross-business`。
执行环境：GitHub Actions Ubuntu，Bun 1.4.0，隔离 `PROFER_CONFIG_DIR`。本报告对照原始档案 Markdown `g01_archive_utilization_template_editor_spec_v1_5.md`（SHA-256：`65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`），不是以仓库 16 号摘要充作原制度。

## 独立预期（不是从工具结果反推）

- R08–R10：授权必须逐被代理人、档案件、操作、时效核对；B01 只承担局部委托范围，不产生行政批准。
- R23：复制授权必须独立于查阅；另一条查阅合格或具有查阅凭据，不能推断复制合格。
- R18：目录公布不意味着全文开放；档案开放状态必须留在 A 业务本地。
- R29、R33：合法电子证据替代和签批阶段须独立检查，不能机械拒绝；无法编码时报 `report-gap`，不得减损原必核义务。
- C 类家属卡/临时卡使用仓库合成规则；代理授权不等于亲属资格、服务事实或发卡批准。不得将 A 的档案法律效力来源带入 C。

## 实际执行结论

| 验收项 | 状态 | 可复核证据 |
|---|---|---|
| B01/B02 查询、冻结与跨业务引用 | **PASS** | `module-locks.json`、`bundles/handoff/frozen-index.json`、实际 `inspect` 命令日志 |
| A/C 两个制作工作区的来源隔离 | **PASS（合成技术范围）** | `workspaces/archive-r2.json`、`workspaces/campus-r2.json`、`plans/*-technical-plan.json` |
| B01 独立升级至 v2 | **PASS** | 新任务 `scope-trace`、冻结 digest、`plans/impact-old-consumers.json` |
| D1 revision 历史与旧版保留 | **PASS** | archive r1/r2/r3，campus r1/r2；独立 D1 存储 revision digest、parentDigest |
| 非签收删除检查拒止 | **PASS** | `logs/22.stderr` 的 `D3_UPGRADE_REMOVAL_NOT_ACKNOWLEDGED`；签收后 v3 测试升级成功，但 **v3 没有迁移现行业务消费者** |
| 干净环境导出/导入和 D2 指纹 | **PASS** | `bundles/archive-export.json`、`archive-reimport.json`；D2 fingerprint 相等 |
| A 查阅与复制分项编译 | **PASS** | `plans/archive-technical-plan.json`：read 与 copy 不同 subject；本地复制规则明确绑定 `item-1/copy` |
| 未核校规不会变成自动合规 | **PASS（D2 编译约束）** | read/copy 的 `authority=unverified-policy`，不是 `compliant` |
| 真实 Pi **服务回归** | **PASS（仓库合成案例）** | `logs/33.stdout`、`logs/33.stderr`：确实运行项目 `review-d3-pi-integration.test.ts` |
| 为 Agent B **新建真实 Pi Run** 并提交来源齐全的材料审读 | **NOT-RUN** | 当前只执行 Agent B 的 D2 计划编译与仓库 Pi 回归；无 Agent B 自身新建 Run；`runIds: []` |
| 在线大模型对材料的真实语义判断 | **NOT-RUN** | `tests/execution-summary.json` 的 `onlineModelRun=not-run` |
| 成都理工现行具体强制规则的正式效力 | **BLOCKED-BY-SOURCE** | 原 MD 明确列校本材料原件和制度版本未全部确认；`source-map.md` |
| 高级合法替代证据关系的无损自动编译 | **TOOLING-BLOCKED / 待专门复现** | `gaps/gap-request.json` → `gap-report.json`，原文 R08–R10/R29，Check ID、实例路径和显式 `runIds: []`；该回执是结构化票据，不等于运行态验证 |

### 实际锁摘要

| 固定资产 | Digest SHA-256 | 作用 |
|---|---|---|
| B01 v1 `agent-authorization` | `e48d279ce5c813b2bcf9163b44a413bfd44de0291b1de93687af95ef3b1cbb5d` | C 的所有实例、A 的 copy 继续固定 |
| B01 v2 | `e4e43ba9a072b59cfb58db9b0e3e2d11657cdfc14585e18a25efc884dd13f7cb` | 仅 A 的 `item-1/read` 显式升级，新 `scope-trace` |
| B01 v3（负例专用） | `c18ddc248614e448a76adbe9cb3c3a62cb16258b46220b6ceb40f79a7e67ca13` | 仅用于删除 Check ID 未签收拒止与恢复，不是新业务锁 |
| B02 v1 `evidence-source-boundary` | `98cc16b522702baf1e98c042dcc3d1381d386188e6db9495feaeab6e54295f90` | C 与 A 仅共享事实和原件版本对应 |

D1 A 版本链：r1 `4066035af52f...` → r2 `aca1c15f3ffa...` → r3 `aee8989b6dbc...`。r2 的 parentDigest 为 r1；r3 的 parentDigest 为 r2。原 r1 通过真实 D1 read 回读，未漂移。

## 实际 D2 计划

- **A 计划**：fingerprint `dea4870a11dd2eba0dd7e0715e572d823fc69ba00fea3ed44af4ad58aa7bd1a6`，6 条 Check 映射。
- **C family 计划**：fingerprint `a936cf04712d6201ccd0b2f9e67752823ae6cf2110cc1cfb373c215764f1913c`，5 条 Check 映射。
- A `module/item-1-read/authorization` → `d2-item1-read`，A `module/item-1-copy/authorization` → `d2-item1-copy`。
- A 本地 `module/item-1-copy-local/copy-authorization` → `d2-item1-copy`，`authority=unverified-policy`。不能因为有一条档案业务要求，就自动得到校方合法许可。
- A 升级新增 `module/item-1-read/scope-trace` → `d2-item1-read`，没有转给 copy。

## 用户体验、错误恢复与缺陷归因

1. **实际制作返工**：首次用案卷级 localTask 表达“复制独立授权”时，编译后的 `targetScope=case`，不能保证只作用到 `copy`。这是本次 Agent 的**制作建模错误**，并非有证据表明公共 D3 编译器坏了。复查编译计划后，改成业务本地模块加 `objectKey=item-1/copy`；再次执行33条实际命令、17条断言全部通过。
2. **错误恢复**：测试 B01 v3 替换 Check ID 无签收时实际拒绝；追加正确签收后成功。**签收检查 ID 不等于授权删掉 R08–R10**，新任务仍表达原范围核验义务。
3. **工具限制**：合法替代证据、来源法定效力、分阶段批准的复杂关系还不能据本轮结果称已无损执行。提供结构化 `report-gap`；当前票据只经过格式校验，`verifiedAgainstRun=false`。
4. **运行局限**：没有为 Agent B 自建真实 Pi Run，也没有在线模型审读。已执行的是 D2 技术计划和仓库 Pi **服务**合成测试，不据此评价识别准确率。
5. **来源限制**：本会话原 MD 在用户文件库中可核，公开仓库中仅提交来源定位和 SHA-256，不上传全量业务文件；成都理工未核实的强制规则不进入测试强制判定。
6. **日志可追溯**：`run-log.md`列出33次 CLI/Bun 命令及每条退出码；`logs/*.stdout`和`logs/*.stderr`均已提交。此前首次生成时 Git ignore 忽略日志、再次运行使用了既有输出路径；现独立验收工作流先清理隔离产物并强制登记日志，复跑成功。均只修改验收工具，不修改 D3 公共源代码。

## 独立裁定

**Agent B 的实际 D3-10 制作、冻结、影响分析、显式升级、拒止/恢复、D2 计划与携包机制：PASS。**

**在线模型表现、Agent B 自己的完整 Pi Run、正式校本制度确认：NOT-RUN / BLOCKED-BY-SOURCE。**

此裁定只针对 **Agent B 独立验收**，不签发整个 D3-10 或 D3 Release；仍需 Agent A 与第三方统一复验、PR CI 的权限/准入检查。
