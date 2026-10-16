# G02 研究 E r04｜证据账本与最小复现

## 1. 固定输入完整性（直接从 GitHub 读取）

- r03 HEAD = `3f0579a96588fd3fdf930774ddc8d0385a5e6b28`；`research-evidence-lock.json` blob = `236dff3517629e94eab9c3a86e4c44ddd57ea385`。
- 同一 HEAD 下：`research-difference-map.md` blob `bc65e120da739b2ec900d266bda65de00ce7d963`；`reproducible-adversarial-cases.md` blob `19f1620477c3c05c739da115013ae0d0264cd0f7`；`research-verdict.md` blob `eb3a01c8f4562d068a69285746ac34536b4e8c2c`。与 r03 内 `published_file_blobs` 登记一致。
- 最初的三份独立源锁正文**未公开入库**，其 `independent-source-register.md` SHA-256=`bcb709d7720b0b19eec526a61daeb486d13cba52f66cab5310e0b6adcc719ff1`、`adversarial-cases.md`=`d952431003e8090863999feb87267ebb50158b73b5383539452312ba315afdf3`、`source-lock.json`=`960ddc4d992f8ca3d2628b730983e52d5c67c2ee08aab940904ebe47cf03b0f7` **仅验证 r03 已登记的值，未重新取得正文计算 SHA-256**。不倒签历史。
- r03 记录的旧 C-T03 母版 SHA-256=`b4b3a859d4d85d322347189d253e0e1a7fe4f6003a2a01a4a0c36ea877fe6040`；该 C 完整母版不在本分支文件树，**本轮不谎称重算原始字节**。

## 2. 新核到的作者澄清（作者自述≠独立运行实证）

- 公开作者分支 `author/g02-t03-c-r01-condition-conjunction-20261016@c99ec3254f3c0d1c80cd176268e61a54eca4d3f9` 已有 `README.md`（blob `44c3a749b539f36a87c2006d4e75befb7cf1c360`）和作者侧 `RC04-author-minimal-counterexample.md`（blob `07a6f5d1607614e4736f95e864d30422351377c6`）。
- 其作者声明：旧 BR-02「与BR-03按受益身份分流」、BR-03「可叠加BR-02」、SC-06「BR-03+BR-02」有表述不一致；新版显式 AND、并存的 PENDING、许可/后台分层。旧 v0.1 MD SHA-256=`b4b3a859d4d85d322347189d253e0e1a7fe4f6003a2a01a4a0c36ea877fe6040`，作者声称新 v0.1.1 MD SHA-256=`e3d1d01555d49564931ac38892567ea23eab5ecd898afc3b67a8e4a26abe7380`。
- **限制**：该提交只有说明与作者合成例；作者明确 11 件修订包未入仓。E 未取得修订母版原字节复算，不能宣布修订已正式进入运行模板。

## 3. 校本原文事实核对（F 与 U）

独立打开本校官方《网络安全管理办法（试行）》PDF，并核对 §10（PDF 页索引 5）和 §11（PDF 页索引 7；印刷 p9）文字及后一页图像。§11 对外来公司用于安装、调试、测试的管理账号作严格控制，并规定最小授权、定期清理收回；§10 的信息系统登记备案不能替代个人具体资源许可。**这是旧校本文件的具体对象区分，不表示 2026 专项授权表单的当前有效要求已查清。**

原文：<https://wxc.cdut.edu.cn/__local/9/8F/4D/EDCE5568A88F519606DEA2F2537_C718DC5C_C843B.pdf>，§10/§11。2024 公邮混合入口事实维持 r03 已锁研究结论，2026 现行性仍交来源持有人确认，不能延伸为 T03 权限事实。

## 4. 工程代码候选的真实边界（静态核对）

针对已定位的项目代码，冻结取自 r03 HEAD 的精确 Git blobs：

| 文件/引用 | Blob | 实际可证实 | 不能证实 |
|---|---|---|---|
| `apps/electron/src/main/lib/review/deterministic-engine.ts` / `evaluateCondition` | `9108fb29ccb5a19ecd6e14a9a1e2319b8f77d565` | AST `all/any/not` 三值求值；未知不自动判通过 | BR-02/BR-03 的完整规则绑定及业务状态生成 |
| `apps/electron/src/main/lib/review/resource-check.ts` / `runGoldenSet` | `e86543f3f967500fc954250f1f55faeffdeca871` | 对显式给定的条件 AST 测三值，计算确定性通过率 | 自动编译 G02-T03 C 文本，或访问受控 D Gold |
| `apps/electron/src/main/lib/review/template-store.ts` / `validateTemplate` | `ff57065307f09be5c7e7aee65038d9aa13166171` | 模板字段引用与依赖完整性的一些静态校验 | SC-06 联合授权的动态执行 |
| `apps/electron/src/main/lib/review/builtin-templates.ts` | `452046913bf2673e6c3e13a55e391e8f2073e135` | 内建/示例模板集合入口 | 目标 T03 的可执行映射 |
| `apps/electron/src/main/lib/review/fixtures/all-templates-fixture.ts` | `6922a6b18df4720058b4534f32b261287ddcd712` | 默认样例为虚构政策的模板 fixtures | 校本专项权限实际判定 |

以上只证明**检查过的入口中尚无可运行的 G02-T03 C→AST→结果状态接线证据**，不是断言整个产品不存在任何其它接入。通用引擎返回 `true/false/unknown`，不直接返回 `PENDING_RESOURCE_OWNER`。因此 `TOOLING_NOT_AVAILABLE_FOR_TARGET_BINDING`，不以运行通用引擎的能力冒称产品通过。

## 5. 独立封闭模拟实测（S-CLOSED，不是实际产品）

独立 Node.js 脚本：`node r04-synthetic-conjunction-check.mjs > r04-synthetic-results.json`。输入使用 `Contractor-Q`、`R1`，没有真账号、外部授权动作或 Gold。运行环境 Node v22.16.0；本机两次运行输出完全相同。

- 脚本 SHA-256（本轮执行时的固定字节）：`5284f36c90bb6e559a8c8760227638f8dbadff75f15a99af108ce7dbf84ecc6d`。
- 标准输出 JSON SHA-256：`d0c9a45e636ee9770931f812553490e9d9a277f50a136e2e46677325f9d7e882`。
- 结果：8/8 独立模型断言通过；RC04 (I=true, A=missing, N=true, P 未证, T 未证) → `PENDING_RESOURCE_OWNER + PENDING_APPROVAL`, implementationAllowed=false。
- 附加越权反事实：I=true/A=missing，即使输入同时**声称** P=true、T=true，仍被属主缺权挡下（不能信下游声称绕过前置门）。显式终拒优先；I=A=N=P=true 而 T=false 仅 `APPROVED_NOT_PROVISIONED`。
- OR 错误模型：`true || false = true`，而正确双门 `true && false = false`；最小事实变化足以辨识错误合并。
- **不得误报**：本脚本是根据研究规定编写的独立 S oracle，绝不是从 C 母版转换的工程组件；`8/8` 只指 S 断言，不是 C、D4、Pi 或校规评分；`PENDING_*` 是研究标签，不保证项目 TS 枚举存在。

## 6. 要变成真正技术实证还缺什么

工程方须指出可固定的 (a) C v0.1.1 母版真实原始字节 SHA 与规则 id/版本，(b) BR-02/03 与 SC-06 编译/绑定路径、规则 AST，(c) 校内担保与资源批准两条证据各自映射到的**独立字段**，(d) 运行命令及脱敏 `I/A/N/P/T` 中间值/最终状态与日志 SHA，(e) 许可已形成和后台已开通两层事实的分别来源。缺任一，不得报“真实审核 Agent 已跑通”。
