# D4 G01-I C′｜C′0 无 Gold 分阶段工程记录

**状态：`INPUT_PREFLIGHT_PASS / C0_TO_C1_STAGED / ENV_NOT_RUN`。不是 28 案技术验收，更不是业务 PASS。**

## 身份与原始保全

- R1 技术固定提交 `94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`；A′ 固定提交 `38277ce925347284d03347cef85ee59c6f30ec26`；GitHub compare: A′ 对 R1 `ahead_by=5`、`behind_by=0`，PR #84 仍 Draft。
- 原 B r02 INPUT ZIP 字节从用户私有文件库取得；106134 字节，SHA256 `33ad9e1fe5104cae91463218293ae58ccd27c934ff091b0687b20c64d699b26c`。
- 本地只读复核：120 ZIP 成员、CRC、119 manifest 成员 SHA、28 案索引、59 材料哈希、28 受控 fixture、申请人材料/可信源分离，**0 input 结构错误**。
- ZIP 自述 `manifest.freezeVersion=r02`，README 和 case-schema 标题遗留 r01；保持原字节不修改。
- 本 C′ 阶段**没有读取** Gold；无 Gold ACL/访问日志佐证，**不能**标 `STRONG_BLIND_ACL_VERIFIED`。

## 28 案分母（原始 B 全集）

| 分类 | 数量 | 证据 |
|---|---:|---|
| `RUN_ACTUAL` | 0 | 本地缺 Bun 与完整仓库运行环境；公开 CI 独立合成样例非 B 原案 |
| `PASS_STRUCTURE_ONLY` | 0 | 未以假造引擎行为计数 |
| `BLOCKED_ENGINE` | 0 | 尚不能断言 28 个原案已真正触发引擎错误 |
| `BLOCKED_POLICY` | 0 | 本轮未真实业务执行，不用政策缺口填补 RUN 口径 |
| `NOT_RUN` | **28** | pre-Gold 私有映射逐案保留 |

`Gold 可比分母=0`；误送审、误拒、漏报和错误人工核验 **未测/不可估计**，不是 0 个已证实错误。核心校规 C01/C02 当前有效性、C03 2024 研究生全文、校方审批权限与真实可信接口仍然待核。

## 独立技术 CI（与 B 28 案完全区分）

C′ 在独立分支增加无需 Gold 的 Bun 工程测试、GitHub Actions 工作流和原 ZIP 私有预检工具。新增技术测试复核动态两个字段/单字段指纹、申请人自述与受控底账分隔、文书共用但证据主体/版本/确认状态独立、复杂 Claim 拒止、旧 D2 兼容和受控 Pi 工具回执。必须以实际 Action log 确定 Pass/Fail；不能拿 A′ 自测代替 C′。

## 仍未完成的关口

1. 在具备 Bun + 仓库依赖的隔离宿主，以**私有本地挂载**方式提供原 B ZIP（不上传公开 Git）；完成有来源许可的 S01–S13 手工选择与字段/阶段/政策适配审计。
2. 将 28 案逐项走 D1 save/diff → D3 export/import → D2 preview/register/create → Pi 工具/服务，记录真实 Case/Run、SourceRef、Plan/代码指纹与退出码；先建立第二份不可变 `pre-gold` 运行快照，再进入下一阶段。
3. 另由获授权评分侧获取 B r02 Gold 原始 ZIP、核实哈希、比较 issue/分流/材料责任；没有可信 ACL/独立时序记录，不签强盲审。
4. 对 `D2_UNMAPPED_ADVANCED` 复杂 Claim、13场景自动辨识不足、正式权威来源和 P0–P7 校务流程建立公共能力缺口清单，不能以语义任务当作真正行政判断能力。

**判定：`TECHNICAL_RUNTIME_ACCEPTED_WITH_SCOPE = NO`（B 原 28 案未真实执行）**；R1 合成引擎回归即使通过，也只证明限定的技术运行能力。