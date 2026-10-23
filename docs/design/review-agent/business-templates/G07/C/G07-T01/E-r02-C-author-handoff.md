# G07-T01｜E r02 C 作者修复对接

## 已读取的 E r01 正式裁定

- `docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-decision.md`
- `docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-coverage-and-isolation.md`
- `docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-input-manifest.json`

审计冻结HEAD `ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab` 的 `BLOCKED_INPUT` 是缺完整冻结输入和 Gold 隔离证据，**未证明 T01 C 母版有内容缺陷**。此作者分支独立于审计分支。

## 修复分类与原件

分类为 `UNARCHIVED_AUTHOR_OUTPUT`：原 C v0.1 母版、规则矩阵、自检、模块建议、历史测试对接、现行 C v2.1 E 对接原件可找回，且原始 Git blob 与当前归档内容一致；A/B 仅只读镜像。未重写 32条规则。

典型 SHA-256（完整逐文件见 `E0-C-source-manifest.json`）：
- 原C母版：`392e63fd9d7e7da3926325682db65007daff44cc04e736791b1cabf065efdf2d`
- 规则矩阵：`03611e2c4d5bd90f0210dcf2554d359a47b67dcc45f4a88e50f60b69dd80286c`
- 作者自检：`6565946270f9b5876751e4db07c454214adeb73fe2d68361c834dc6cd7858dd9`
- 编辑器模块建议：`0682d2bf73f42079bff56fe72147c07e7e1cd557310419e7c6e00ca12b088643`
- 新 E 交接：`bb60b208d5a711eca25cc188094b4ddd790b6d502204bd9e78ef67dafb698129`
- 仅排版 v0.1.1：`39cdd8f00efb51fd54ea1dc728fb1bde924f084f459b6a40d37dd2cafc312def`

原历史作者 commit：`NOT_AVAILABLE`。本轮新归档 commit `5359d93670339bc5cfb379b9e67ffc40da12b3fa`，只证明此轮成功归档，不是原作者当年交付的 commit。

## T01 审核责任自检

- **只审核发生后的直接费用**：活动/竞赛/科研常规直接费的预算关联、发票与支付链、有效发生事实及费用行部分核销。
- **不同角色**：申请经办、实际垫付、项目负责人、财务审批与实际受款人不可混同；对公支付无需学生个人支付截图。
- **不得混用**：T03采购事前审批≠事后消费凭据；T04采购合同付款/验收≠T01小额直接费用；T02差旅、T05劳务、T06主办会议、T07借款各走独立目的。
- **校本不足**：成都理工2026智能报销具体角色权限、最新无票报销手续、系统票据和预算余额接口标记 `SOURCE_PENDING`，不能凭别校财务惯例自行制造强制门槛。
- **D/E独立性**：未读 D Gold、未改 D 答案、未运行 E 审计或真实审核系统。

## E r02 待由独立 E 复查（不是本作者宣称通过）

| 环节 | 复核动作 |
|---|---|
| E0 | 用固定提交核对本 T01 全套 C 原件 SHA256与 A/B 镜像；检查其他 T02—T07 的全域材料及安全 Gold 保管 ACL。整域当前仍 `BLOCKED_INPUT`。 |
| E1 | 在读取 C/D 业务结论前独立按 A/B 冻结政策事实、H/M/L 分母、取样计划与资料哈希，不让 C 的规则预设 E1 结论。 |
| E2 | 在 E1 冻结后才按 SHA 核对 T01 的32条 C 规则、合法例外、资金类型、部分核销与权限边界；显式选择 v0.1 或排版 v0.1.1。 |
| E3 | 经合法授权后由 E 独立检查 D 密封 Gold/盲材料、覆盖与泄漏风险；C 无权接触。 |
| E4 | 最终E结论只由独立E签署，不把本作者归档作验收通过证据。 |

**影响范围**：Git 公共文档归档与元数据，没有任何原C规则内容改动；审计冻结分支未修改。
