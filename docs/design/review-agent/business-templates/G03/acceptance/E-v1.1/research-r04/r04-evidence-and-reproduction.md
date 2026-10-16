# G03 研究 E r04｜证据、最小实证回放与复核规范

> 可审计等级：官方原文 F + 文件字节 SHA 实核 + C 静态复核 + 合成 S 的真实本地脚本执行。**没有真实平台登录、写入、订单批准、Pi/端到端/在线模型或 D Gold 测试。**

## 1. 证据账与固定输入

| 编号 | 材料 | 固定定位与摘要 | 证据性质 |
|---|---|---|---|
| E01 | r03 [固定提交](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/75f2488b0cab5d9c0dfa5aaf6ecc43758c54cfb2) | `experimental-cases-index.md` EXP-04/H23；`source-delta-summary.md` T09 | 旧研究冻结，仅复核 |
| E02 | [r03 事前源锁索引](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/ebc98c9e62860e35315e1259ac2d35bb42fa2d52/docs/design/review-agent/business-templates/G03/acceptance/research-source-lock-r03/README.md) | 源锁摘要，原三文件不在该 GitHub 分支 | 历史锁元数据 |
| E03 | `independent-source-register.md` | SHA256 `aada81048c795b47de2f045e4f43d1853522254b2b243e6cd3722aafc8ad2327` | 本次从文件库原件字节复算，匹配 r03 |
| E04 | `adversarial-cases.md` | SHA256 `f35b174e8e90ac303fee52cb528826049066a5a0f691ecfe4e1c868d73bb6884` | 同上 |
| E05 | `source-lock.json` | SHA256 `b1c2efe7f04bd23f6937c9063ad3f5b50219cb6587093809a5487e3a4bead094` | 同上 |
| E06 | `G03-T09_正式业务模板_MD_v0.1.md` | SHA256 `ca3195c16f7be049adbba5455393d1eb92bc7deda484721324784be7a1e720d0`；第 435–440、504、597 行 | C 规则真实字节及静态文本；非系统运行 |
| E07 | 成都理工[大仪管理员指南 PDF](https://dygx.cdut.edu.cn/genee/!upload/file/20250421165444_50685.pdf) | PDF 第 7–8 页（印刷第 6–7 页）送样设置（1）（3），含图 7 | 官方文本 F；仅证明产品设置能力 |
| E08 | 本地 `r04-exp04-contract-replay.py` | SHA256 `f323a82fe04e6505ad94d15d06a3cb939c367fb31400dd94310a36b1d476983e` | 本轮实际执行的 **合成规范检查脚本** |
| E09 | 本地 `r04-exp04-replay-results.json` | SHA256 `60a5a1e3b1b8a16125954231c56cdbfea27b583f3b5f6af68e1532577281c895` | 上述脚本的确定性结果，8/8 断言 |
 
E08/E09 在本次会话容器生成并附给用户；本 GitHub 公开文档仅提供来源 SHA/运行指令和结果摘要，**不虚称脚本已完整镜像仓库**。上述哈希是 SHA-256，GitHub contents API 返回的 blob SHA 是另一种标识，不得混用。

## 2. 原文 → C 规则 → 预期效果

**原文观察 F**：指南送样设置要求开启“接受送样预约”；“申请送样必须上传附件”按实际情况决定；“默认批准送样申请”勾选后软件自动批准、免去机主人工审核，并建议不勾选；修改后必须保存。它**没有给出**当前指定设备的真实配置、任何订单 ID、是否已提交或是否实际产生批准事件。

**C 静态观察**：T09 `R-29` 文本“批准事实始终来自正式审批事件”，配置未知 `WAIT_SOURCE`，开启但无正式事件 `WAIT_AUTHORITY`；`11` 显式要求有效事件才将官方状态置 `APPROVED`。第 10 节区分 `check_status`、`advice_status`、`official_status` 和 `execution_status`。该文本**未表现出**“配置即批准”的静态缺陷。

**推断边界**：平台自动审批开关开启后，系统**可能**在提交时即时生成订单级批准事件；为可信核验，需要查询有权审计源。没有事件记录并不等于有权系统肯定没有事件——只是在现有证据下不得断言 APPROVED。

## 3. 已执行的合成测试（S）

执行：`python r04-exp04-contract-replay.py > r04-exp04-replay-results.json`。脚本是独立编写的契约检查器，不读取 C 代码，不伪造后台日志，不用受限身份或真实订单。脚本中的 `attested=True` 仅表示**虚构前提**，不是一次真正的可信签名校验。

| Case | 设备/操作/订单版本 | 开关 | 事件 | 实际运行输出 |
|---|---|---:|---|---|
| C00 | SYNTH-DEVICE-01 / sample_entrust / order-r1 | false | 无 | SUBMITTED / WAIT_AUTHORITY |
| C01 | 同上 | true | 无 | SUBMITTED / WAIT_AUTHORITY |
| C02 | 同上 | true | 本订单、版本、提交后，有权模拟自动事件 | APPROVED |
| C03 | 同上 | false | 本订单、版本、提交后，有权模拟人工事件 | APPROVED |
| C04 | 同上 | true | 另一订单的批准事件 | SUBMITTED / WAIT_AUTHORITY |
| C05 | 同上 | true | 旧订单修订的事件 | SUBMITTED / WAIT_AUTHORITY |
| C06 | 同上 | true | 事件发生在提交前 | SUBMITTED / WAIT_AUTHORITY |
| C07 | 同上 | false | “系统自动批准”事件与关闭配置冲突 | SUBMITTED / WAIT_AUTHORITY |

**观察**：本地脚本执行成功，`8/8` 断言与契约预期相符，输出 JSON 与脚本的实际 SHA-256 已记录。**不能推出** CDUT Studio、实际平台、Pi 或在线模型存在相同行为。`business_defects_reproduced=0`。

## 4. 五元组及最低可信记录

一笔可判订单的证据对象须至少形成：

`(equipment_id, operation=sample_entrust, order_revision/policy_version, effective_config_snapshot, order_scoped_approval_event)`

1. **设备**：真实 `equipment_id`、所属管理单位/服务 `service_id`；不可混用另一资产的设置。
2. **操作**：`sample_entrust` 与 `self_operation` 区分；订单/行 `order_id / line_id` 和申请主体已绑定；需有提交回执及真实时间。
3. **版本**：`order_revision`、适用 `policy_profile_id`、配置版本、生效及变更时间；批准事件指向该次而非旧修订。
4. **配置**：由有权大仪管理角色导出、注明资产/服务/时点的已**保存生效**快照；包含 `acceptSample`、`attachmentRequired`、`autoApprove`、修改者身份作用域及可信时间戳。不要仅用打开设置页的当前勾选或一张未经证明的截图冒充历史值。
5. **事件**：由原平台/有权审计接口提供独立 `event_id`、`order_id`、`order_revision`、`APPROVED` 类型、源系统/授权操作者、发生时间、关联提交事件、签发权限与撤回/替换关系；查询证明或导出校验可供复核，真实 URL/令牌/账号仅留在具名授权的私有保管对象。

**若查“没有事件”**：必须额外证明查询时间窗、分页完整性、检索键、日志保留期和权限覆盖；否则只能表示“未取得可核事件”，状态 `WAIT_SOURCE/WAIT_AUTHORITY`，不能认定事件不存在，更不能将配置本身当批准。

## 5. 真后台最小复核步骤（未执行，需有权人）

- 有权平台管理员挑选获准测试的非个人敏感资产/订单，先冻结设备配置和提交回执及版本。
- 在 `autoApprove=false` 的设备/测试环境提交一单，确认未获批前的状态；有权人批准后导出真实订单级事件。
- 保持同一设备、服务、操作者作用域与其他设置不变，仅在授权测试环境开启 `autoApprove=true` **保存生效并冻结新配置版本**，提交另一可区分修订/测试单，导出订单提交与自动批准事件；不可声称跨不同订单“只变化一个条件”，须记录订单差异。
- 校验事件与具体订单、版本、主体、时间、配置相互绑定，检查平台是否展示 `APPROVED`；如仅能看见状态而无审计事件，则由平台方提供有权状态签发证据的等价机制。
- 对真实性、授权、撤销、时序不完整的事件不作“通过”；所有原件和凭据只存受控私库，公开库仅收脱敏摘要、固定哈希、操作方法和权限试验结论。

本轮平台证据状态：`LIVE_CONFIG=UNVERIFIED`；`LIVE_SUBMISSION=NOT_OBSERVED`；`LIVE_APPROVAL_EVENT=NOT_OBSERVED`；`PI/D4/END_TO_END=NOT_RUN`；`D_GOLD=NOT_ACCESSED`。
