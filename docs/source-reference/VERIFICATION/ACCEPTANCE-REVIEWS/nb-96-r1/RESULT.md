# NB-96-r1 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-96 链 r0→r1 闭合

**对象**：18 手册（修订批；sealId `seal-2a87f04feb20e06d`）｜**冻结** `05fb2565e2…37c2`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**。**F-01~F-04+N-01 全部字节级关闭**（孤儿件照实/伪鉴权照实/调用方更正/API 原名/未登录过滤补记）；DataManagement 更正行号机械核对全部精确（QA 自纠：原 evidence 行号系约数）；12 篇未改、无新错误。

## 合入（18 篇，exact manualSha256，以 r1 为准）

| manual（…/renderer/components/settings/…） | manualSha256 |
| --- | --- |
| `apps/electron/src/renderer/components/settings/AboutSettings.tsx.md` | `791f98261c82c6ea773582ca6a7b441084ced1edcc2979cb36e5863bcef41bfa` |
| `apps/electron/src/renderer/components/settings/AppearanceSettings.tsx.md` | `e80381affe312f0dcce07332b87d5b28650847271a791c05495c1ded657f1934` |
| `apps/electron/src/renderer/components/settings/BotDefaultSettings.tsx.md` | `86e713bc4e03c3bb6171f32fff844b9b2b25da032f1c9ef310b6c45e8f937f62` |
| `apps/electron/src/renderer/components/settings/BotHubSettings.tsx.md` | `cc65c70261477a81a846fd9c6d92de5156df6872d1883cac06a5e396f0a85f2e` |
| `apps/electron/src/renderer/components/settings/ChannelForm.tsx.md` | `b37ba0585d4bb5bebf20a2db2b324895f4f573504ba875d7e9039448179693c1` |
| `apps/electron/src/renderer/components/settings/ChannelSettings.tsx.md` | `272f241db03913ee481a657c164420257f9372144f856c267de1f9fec7af3414` |
| `apps/electron/src/renderer/components/settings/DataManagementSettings.tsx.md` | `77ea25ed0230f0e10ee475f840bfa420f514fa58eacb45d6807e732246e65e24` |
| `apps/electron/src/renderer/components/settings/DeveloperSettings.tsx.md` | `5b723a3e54c1a33cd1a8e1a4d607f62db37b16e5eab58903d4b79e597cbfad87` |
| `apps/electron/src/renderer/components/settings/DingTalkSettings.tsx.md` | `2b42b806ef1bda4ab26a6304560b3376b1e9d6c4e3fbdc484d8d9b10ab4a0b86` |
| `apps/electron/src/renderer/components/settings/FeishuSettings.tsx.md` | `bf33caf728ecfae41fbbc0015556d641a099ba52c0620a828d16a79cb64148cb` |
| `apps/electron/src/renderer/components/settings/GeneralSettings.tsx.md` | `8aa0258d67de21c0b492ba5b0b2d1a942e5cbcfad054377c483196f9093d8b7f` |
| `apps/electron/src/renderer/components/settings/McpServerForm.tsx.md` | `32a7f45762b52a2f98c54d16ad99662da3d2dc98fcba0b27fee761d36a6ad9de` |
| `apps/electron/src/renderer/components/settings/MigrationSettings.tsx.md` | `16c5a531bb6b46df8bf6f4bfe22a37589ea5e1ca5b237364765ece105f001be9` |
| `apps/electron/src/renderer/components/settings/ModelAvailabilityBar.tsx.md` | `a1354d263e6d7f44d76f0232d7f23a0d130dc8b931e265b83a7cdd5524f6a064` |
| `apps/electron/src/renderer/components/settings/OpenApiSettings.tsx.md` | `4bbbd26a0ce3845f9887b6939c72983a94925e3e9addd91a18808e3674275d9f` |
| `apps/electron/src/renderer/components/settings/ProxySettings.tsx.md` | `9ee1476575f161e78b754f88b0a6380db296b75c258c93478ec84447d6cb28b2` |
| `apps/electron/src/renderer/components/settings/ReleaseNotesViewer.tsx.md` | `7e98c8c410c0b7f340b4de2004811c25f0925c90686b12d8934c07b6bc26858e` |
| `apps/electron/src/renderer/components/settings/SettingsPanel.tsx.md` | `a9043abf468d554cd4e4f7f3624a8f32b597a71b3e5d62e70faa28079236c300` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账；nb-96 报告保留不回写。
