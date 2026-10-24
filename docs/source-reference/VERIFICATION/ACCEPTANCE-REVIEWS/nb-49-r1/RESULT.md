# NB-49-r1 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-49 链 r0→r1 闭合

**对象**：18 手册（修订批；sealId `seal-6f6ce4df22879fcf`）｜**冻结** `05fb2565e2…37c2`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**。**F-01~F-07+N-01~N-03 全部字节级关闭**；QA 机械抽核 14 处更正行号**全部精确**（含 createAgentPreset :1174、ensurePresetSystemReady :635、getPending :254、summarize :323 等），test( 计数 87 与手册一致；修订区无新错误；11 篇未改。

## 合入（18 篇，exact manualSha256）

| manual（…/main/lib/…） | manualSha256 |
| --- | --- |
| `apps/electron/src/main/lib/agent-model-routing.test.ts.md` | `c631fdb6057334bd8b5a34aaeb69581e904dcd110e2e98d490163477ecf8b338` |
| `apps/electron/src/main/lib/agent-model-routing.ts.md` | `cf09820949afa43b3f3e510ccf8995da46f0d320c0fd278167dd0c699a4b4ba0` |
| `apps/electron/src/main/lib/agent-model-selection.test.ts.md` | `43fd4f3b827d748029e4306b60496705d9e5a6c9e35833300c08f8d6f0735970` |
| `apps/electron/src/main/lib/agent-model-selection.ts.md` | `e2ce0d10527afc05f3de41cbf1956e0d23092c1c945bfc59364da57ec802b02c` |
| `apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts.md` | `f9ca2c915604bf5894f2739895358edb4662448b43daf88f2125a3a85fea947f` |
| `apps/electron/src/main/lib/agent-orchestrator-p0-guards.ts.md` | `763fc613f33d1a75a5a58fd9b0a5a8b3f5e193a90dd894e9ea54f4674bc9b3d7` |
| `apps/electron/src/main/lib/agent-orchestrator-permission-wiring.p06.test.ts.md` | `fa7d9a752f02e33ac4475a8d8fa52a208cdf412fa1feefea64e6295645997958` |
| `apps/electron/src/main/lib/agent-orchestrator.test.ts.md` | `bcf948a5b7ad95f00d2dd5189477f1b1bc1c94b3146c2df9b13e4e6999f3bc1d` |
| `apps/electron/src/main/lib/agent-ordinary-pending-access.ts.md` | `169a0f39a5d90357a674595c20ee73e42d939cb95d98afc2d364bc424836eb25` |
| `apps/electron/src/main/lib/agent-permission-service.cslab.test.ts.md` | `9bf38b10fdeb13b6843a36922e14bed4b5a030453775c91a9f947d62c15f179c` |
| `apps/electron/src/main/lib/agent-permission-service.powershell.test.ts.md` | `66c58da434302d8a09ecb9e70cceff828e2b65aea25745b2c5806bb3bafe252c` |
| `apps/electron/src/main/lib/agent-permission-service.ts.md` | `a73c9a990dcf5287661e07e13d5f60168c21c9f3664d9f29666323665c0cd5b6` |
| `apps/electron/src/main/lib/agent-platform-prompt.test.ts.md` | `e438ffff2bc847135e7e9d22630214d656f1288441a7f63510e6d05252c4bb4b` |
| `apps/electron/src/main/lib/agent-platform-prompt.ts.md` | `3ad401973ce4377c2b76a96240fa7fcc6eb20f4b0ea549b5f981060dc38952f3` |
| `apps/electron/src/main/lib/agent-preset-manager.test.ts.md` | `d9cb0629ac339de6b9f9b5a746beb181f0a9a6be37526ab159a0dd1c14cf7bd4` |
| `apps/electron/src/main/lib/agent-preset-manager.ts.md` | `4cce9a47e3b4f7388c31e27c8d36e3e10ed28e2ddae4ee437dc5d7e9d6f98694` |
| `apps/electron/src/main/lib/agent-preset-operations.test.ts.md` | `27623989b357a3f2c6beb547b9af95d351a640e1998172ad9922f55e26ba25ce` |
| `apps/electron/src/main/lib/agent-preset-operations.ts.md` | `d3d6c5cd740fadb8e01153d9276ef78f40865ae8982910b4ca284c90fb120772` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账；nb-49 报告保留不回写。
