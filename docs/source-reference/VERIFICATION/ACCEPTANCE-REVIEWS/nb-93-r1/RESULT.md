# nb-93-r1 独立复验结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-93-r1`（revisionOf `nb-93`）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`；交付 sealId `seal-ed5a8900fec0e70c`（ZIP `9e5c30d0ef13…`，v2）
- 复核时间：2026-10-25T00:50:00Z · **NOT_RUN**：产品测试/typecheck/build/GUI/真实模型/并发注入

## 总判定：**accepted**（18 accepted / 0 revision_required / 0 unknown）

G0 PASS（字节差异恰=父批被拒篇、其余逐字节=父批 accepted；ZIP/哈希链全过）；G1 PASS（修复篇 0 越界）；G2 PASS（F 项全部 resolved）。

## 阻断项修复复验

| 篇 | 复验 |
| --- | --- |
| `TaskProgressCard.tsx.md` | F-01 改「1 个组件 = 1 个导出（TaskProgressCardProps 为内部接口未导出，:95 无 export，下游无法 import）」；表行同步改「内部接口（未导出）」= 源码 1 export |

## 残留备注（非阻断，沿用父批 accepted 篇）

| 篇 | 备注 |
| --- | --- |
| `agent-history-pagination.ts.md` | N-01 残留（`:88-111`→`:84-102` 未修，父批 accepted 篇字节未动，沿用父批 N） |

## exact acceptedHashes（18）

| manual | manualSha256 |
| --- | --- |
| `SidePanel.tsx.md` | `d9253839005aba9d6d53cb510a22993fb03e03b41f4d1b8d05354d2409893af8` |
| `TaskBadge.tsx.md` | `a44503119048a2e56044e6b219c100d8d0add077c12de48c82f1806d7462a65e` |
| `TaskProgressCard.tsx.md` | `6b634f7c2d4408aa0cbac5ed40a09c2cd0be3e20a430f3a6eb70787aa1e1d5c8` |
| `TurnFileChangesSummary.test.ts.md` | `875818e59276afd2e667f4ab4ce8f1234adfad70516d59c9e378ce0d3d1cf2bb` |
| `TurnFileChangesSummary.tsx.md` | `d9a95c6b1b8e12845638f1f01a194c02fef07d4bc4762b28c58883f33aa6961c` |
| `WorkspaceSelector.tsx.md` | `3adf6ae74e9be5793371fa33c23be2c9ad4d4266d511827ed49408a121b73de2` |
| `agent-history-pagination.test.ts.md` | `f7d032b5d47481ad65b96b2162b0a7802ceff52cf487781899f09039144aa44c` |
| `agent-history-pagination.ts.md` | `fc79f52064613c9359dec104d73e45416a54d1ecfef4b6a14bcaf0b11d4e17bd` |
| `agent-image-generation-timeline.test.ts.md` | `82df68a4b1071ea34fa3cdbc8d3b9d91ebdbab3166628b9dbfdfcbd9cb1b067b` |
| `agent-image-generation-timeline.ts.md` | `76d70584cbc35eda77f0596e226e781b27cf7e4652929886ad1726b33d4e2e78` |
| `agent-renderable-image.tsx.md` | `44010bf0e955b9b2f497ac6a57de94575bd655300911062d418930f3dbfbe428` |
| `context-usage-badge-channel.test.ts.md` | `b918f960cbcad3e9dbb1c3b344186c2238727a506c26ecd20683d54991705590` |
| `context-usage-badge-channel.ts.md` | `42b65afe4dba4ef2d8ef85d8e62ab02cc4922eb82a7e057cceae239b3a4f5b86` |
| `image-attachment-marker.test.ts.md` | `c93d9d1aae1275d49959e742d6d214956256465eddf23a4186623d9e1c37b13c` |
| `image-attachment-marker.ts.md` | `8193479d16eb616fb0d3122913cf512bd13d4a65de6a97b5bdd2ef5830697395` |
| `index.ts.md` | `9e02f14a67df720029f0f2c4268621387b088ac5ddb1bbe1ad9cf16df3a4b7ec` |
| `inline-image-sources.test.ts.md` | `de0cb6d209e4ba2fcf6b6529516002cc02804fda80deae608fcf64c941e416cb` |
| `inline-image-sources.ts.md` | `6acdba9f73a09753bb75c8c65b60b231644b8fec9ca9f6abbddddb6cfb6cc3cd` |

`rejectedHashes` 为空。

## 边界

未改源码/作者正文/candidate/全局总账；交付字节未动；未 commit/push。
