# nb-81-r1 独立复验结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-81-r1`（revisionOf `nb-81`）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`；交付 sealId `seal-a3bb86075bd8c2ee`（ZIP `37f6c09d8eec…`，v2）
- 复核时间：2026-10-25T00:50:00Z · **NOT_RUN**：产品测试/typecheck/build/GUI/真实模型/并发注入

## 总判定：**accepted**（18 accepted / 0 revision_required / 0 unknown）

G0 PASS（字节差异恰=父批被拒篇、其余逐字节=父批 accepted；ZIP/哈希链全过）；G1 PASS（修复篇 0 越界）；G2 PASS（F 项全部 resolved）。

## 阻断项修复复验

| 篇 | 复验 |
| --- | --- |
| `lark-cli-service.ts.md` | F-01 计数改「1 个接口 + 11 个函数 = 12 个导出」= 源码 12（:55,56,57,119,121,152,158,174,191,192,193） |
| `lark-cli-service.test.ts.md` | F-02 改「共 5 个 test(（:15,25,29,40,58；describe :14 3 个、:39 1 个、:57 1 个）」= 源码 5，同句不再自相矛盾 |

## 残留备注（非阻断，沿用父批 accepted 篇）

| 篇 | 备注 |
| --- | --- |
| `agent-history-pagination.ts.md` | N-01 残留（`:88-111`→`:84-102` 未修，位于父批 accepted 篇、字节未动，沿用父批 N） |

## exact acceptedHashes（18）

| manual | manualSha256 |
| --- | --- |
| `browser-translate.ts.md` | `404642cfb1d0bc2a212476f174d282d9b457a73bdecd625056912fdb5c0e10a8` |
| `browser-view-layout.test.ts.md` | `bbe0e02bf5c3de893fc4cfc81152a1ee140402018cd49e89f26deb80992762dd` |
| `browser-view-layout.ts.md` | `1d8834f27d44d4502054a056b0a191e1533f0228f9a5438258ca509088ec0223` |
| `dingtalk-bridge-manager.ts.md` | `7394983e1a14c1e6db9e940d050f8b550f6a2548355509aaccf2521bf8e18f5e` |
| `dingtalk-bridge.ts.md` | `2cb8b092cbbfcbe2df56c7c3421fbd178e2436939df9ccbbf749c501aa0d1c12` |
| `dingtalk-config.ts.md` | `90414d6736ed9482e21e5f82f6d32d8aa093ac2a489d0985c3022d24cb049299` |
| `lark-cli-service.test.ts.md` | `851fc1ef819829cac9d58d9dc72bb8e994b3016c9799c16ac31d0ce003f1064a` |
| `lark-cli-service.ts.md` | `99da5cf23fbf823e49d2004a46249ffe9584fd41a5f64579981be0fae8d56307` |
| `lark-mcp-service.test.ts.md` | `001c90f687a1b1c54fc2aa693c511cf9042dcf534bfdec68ade0addf8e9cd6d5` |
| `lark-mcp-service.ts.md` | `a03d94450afa1e0bb6fb6dee88a183716f5b952cf16b035bcd7d8000703a5648` |
| `ppt-capability-gate.test.ts.md` | `4c133d906719c53b4789d1bb47360a18cdaa87a45d4758e98465a95af94eed40` |
| `ppt-capability-gate.ts.md` | `a40c9d7934287586cb212059101fdfbe00bb8e3d129e6f65de64d957d7d40d8a` |
| `ppt-delivery-audit-service.ts.md` | `4c90303610da04b130f6be381c4715d5343a3728a575c6a0d03e17c4892689bc` |
| `ppt-layout-engine.ts.md` | `dab2cbfd13df2e68d75ec96f0a2f4f1e93c38c4d60dc42032056e9d7e726345a` |
| `ppt-slide-components.ts.md` | `38b78ee726d10b2508cf7f50c282a3ec4cad9f1f960efd630d0245b9e670300a` |
| `ppt-style-pack-service.test.ts.md` | `141dc46cf2d1a80756dacb38956ca05279d76032cdf53077c8f9a57aa10981ab` |
| `ppt-style-pack-service.ts.md` | `aa78e71bed1b54a3b154ad45cfa9541e9f0c95a300b9d1414ee0e3c2bebbe178` |
| `process-monitor-posix.ts.md` | `7c44a149bf90f42865c850f18bd3d36fba215775c5f37c31715d32b25cc81b82` |

`rejectedHashes` 为空。

## 边界

未改源码/作者正文/candidate/全局总账；交付字节未动；未 commit/push。
