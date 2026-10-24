# NB-40-r2 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-40 链 r0→r1→r2 闭合

**对象**：`packages/agent-fabric` 18 手册（修订批，源文件未动）｜**冻结** `05fb2565e2…37c2`｜sealId `seal-4f9c1643c23a7308`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18 accepted / 0 revision / 0 unknown）**。nb-40-r1 的 3 条阻断（F-01~F-03）**全部字节级关闭**，N-01~N-03 一并修复；残留 1 条 minor（N-09）。

## 复验要点

- **G0**：链交叉一致；before/ 18/18==r1 stage（11 篇 hash 不变、7 篇为声明修订）；changes.diff 13 hunks/7 文件 `git apply` 重放==stage；ZIP 21 条目 0 mismatch；18/18 源绑定==SCOPE。
- **G2 逐 hunk**：①F-01 protocol.ts.md→"13 条 export（12 对象+1 类型别名）"+补 `ProtocolErrorCodeValue :85` ✓；②F-02 state-machine.ts.md "12 状态"→14 三处 +"7 导出+1 内部迁移表" ✓；③F-03 capabilities.ts.md→"12 条 export"+补 `TrustLevelValue :97` ✓；④N-01 gateway "7 态事件映射（…）"==源 ✓；⑤N-02 消费者统一"6 源+2 测试（8 文件）" ✓；⑥N-03 离线测试标题澄清注 ✓。修订区无新错误。
- **残留 N-09（minor）**：capabilities.ts.md 括号分解"…+2 函数…"应为 3 函数（isTrustAtLeast/resolveEffectiveCapabilities/assertCapability），和=11≠headline 12；headline 与 §11 正确。

## 合入（18 篇 exact manualSha256，以 r2 为准；7 篇替代 r1 同名 hash）

| manual | manualSha256 |
| --- | --- |
| `package.json.md` | `f34e52699b8852a0f2ab8be36c07b1e44f9bcfae4036e4c370b64b772943a733` |
| `src/approval.ts.md` | `35a952978ff6226dfdca86cd13aa5e0135a9901853efb72e69d5d638a60e48e7` |
| `src/artifacts.ts.md` | `e583188668add8d24583e7182dbbe88fd3e5626513faedb5dce13e0d18334531` |
| `src/capabilities.ts.md` | `403551f0b7192a961478d308dc04085ca88d316b4433942cab018032a81fae31` |
| `src/contract-events.test.ts.md` | `356aa9d08ed7fe04fa0b6b27ee649ca555991b302d9a68bc7a601b95c5567abe` |
| `src/contract-gateway.test.ts.md` | `db3ae68985dd11990e6a3d5c2b0d3ed644142419d9684a863aebc334dbbb83d4` |
| `src/contract-protocol.test.ts.md` | `2871383322590986b57cc31d17b382c9282c315e35be70ac33793173445a1649` |
| `src/contract-security.test.ts.md` | `e96c6b0a1cc74176f8f416bffe2ea5396ac55eb6634975548efe817f019fb605` |
| `src/contract-state-machine.test.ts.md` | `9bcc84355393d1ae78655099f8d88bcfe61550222fb1e297ec4119ce538a2420` |
| `src/contract-task-graph.test.ts.md` | `46aa57f5d5e4819031c90ad97ef6f08dfa80d9140f02384a6c45d378788c30d4` |
| `src/contract-task.test.ts.md` | `ecf3581c510884ccddd0a90dfffbc4edbb7178dee577c71e3ab9ee394b933711` |
| `src/events.ts.md` | `58c569ba4a04152383f1ba28aa854305a47e96894b3b875b2588962c40705058` |
| `src/gateway.ts.md` | `1d7359f2386f115fe94f676a602872d9e8b0168ff850bb73e96659ce77bd9e2a` |
| `src/index.ts.md` | `c396071b14e04950ab3da0387872bb2e7f26df15998d5df7742ecf1fff29c47e` |
| `src/node.ts.md` | `6926cf8be236176cf666be0b2f0fd2e0ef31d6a7985ff5f0c2ba4d07a00e5df3` |
| `src/protocol.ts.md` | `7ca5524800c60c817e9c49a3fc379fb0a2edc44a985c56f39e7a5a86858fc77e` |
| `src/state-machine.ts.md` | `77c60bdbd17fd8b3f92383f6e6da2ffd19e54bf5d295c827a4995a5c94abc629` |
| `src/task-graph.ts.md` | `655d18195dec7fa286f7f1979e22c9267bae074edae23d85e8d3fb8eb735d13a` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账；r1 报告与字节保留不回写。
