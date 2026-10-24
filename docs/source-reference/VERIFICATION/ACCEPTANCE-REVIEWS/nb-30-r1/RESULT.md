# NB-30-R1 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-30 链闭合

**对象**：18 手册（修订批，sealId `seal-a6f6707875a67266`）｜旧报告 reviews/nb-30/ 保留未动

## 结论

**G0/G1/G2 PASS → accepted（18/18）**。十点全关闭，对预读基线实测值逐 hunk 核：F01 SAFE_BASH_PATTERNS 22→**21** ✓；F02 后缀 22→**19** ✓；F03 Browser* 13→**15** ✓；F04 导出 function 9+const 6 ✓；F05 测试手册 22→21 ✓；F06 ofv 4+3+1+6=14 ✓；F07 triage 12 类型/接口+4 函数（矛盾消除）✓；F08 message.tsx :583,591 真实使用+:536 注释证据 ✓；F09 StudySourceTrace :37,89+:18 注释证据 ✓；R01 type 1+interface 1 分开计数 ✓；无新错误；未变文件绑定旧 acceptedHashes（12/16+）。

| manual | manualSha256 | 证据 |
| --- | --- | --- |
| `packages/shared/src/agent/index.ts.md` | `8f8509e3cfc4a8d7536c3ab784fc502d314dba28e792f5ce489b7edb521995d9` | bind-old |
| `packages/shared/src/config/index.ts.md` | `594845060760a76fbc107f222b55304a55431de3243aace6c964ffb8fd302c7c` | bind-old |
| `packages/shared/src/constants/browser-file-sentinels.test.ts.md` | `df39c6c7945ac4827a4beec701f931284dd600511d206c5e0b98440f777eaa34` | bind-old |
| `packages/shared/src/constants/browser-file-sentinels.ts.md` | `a8637187b3207bc54f883bb940e148ef0c2b079329dc9aed026797118a7ae642` | bind-old |
| `packages/shared/src/constants/document-anchor.test.ts.md` | `68b680bbe49a71beec5e9d46441cb3a26e57ca0cb515a17bb939b2b2840140b9` | bind-old |
| `packages/shared/src/constants/document-anchor.ts.md` | `d947a71e604857290462569f5559b01cebc69fdc9b19ba81fb0ebbb7c0e4ea8c` | r1-hunk-verified |
| `packages/shared/src/constants/ofv-theme-bridge.test.ts.md` | `0b226e0c20ea31d82aa81235b02785fdfcd7b8f40b28d14c9751d3ce17db6899` | bind-old |
| `packages/shared/src/constants/ofv-theme-bridge.ts.md` | `5893b6448dee8abcb56f2992785b0f281ff87601694cba0e16bdb8b6a40567f4` | r1-hunk-verified |
| `packages/shared/src/constants/permission-rules.test.ts.md` | `f78874a99e21aaac52ad537db9902bd56f72243f396b322c509ed75c1fed7f67` | r1-hunk-verified |
| `packages/shared/src/constants/permission-rules.ts.md` | `4e7ff340ab839923daec161c087f676183ba978140e61b2577af1495226c4fcb` | r1-hunk-verified |
| `packages/shared/src/constants/session-storage.ts.md` | `b31c592ad6305bff7aa54633e919e0359b6b498f0482a4c10ccbc52aed481540` | bind-old |
| `packages/shared/src/index.ts.md` | `86a28227bb69445f0032019a1a57b8161d673789a48e7f6c40fd6592026b18d6` | bind-old |
| `packages/shared/src/review/batch-review-triage.test.ts.md` | `b83df68dafa47c7d060073611f580934fe23afd1554ffacf5526893ba4908ac1` | bind-old |
| `packages/shared/src/review/batch-review-triage.ts.md` | `4e13d1f588cffdee3b9d70e1cd5d7c1c54eeca1c2906c251844a4f0f015d5105` | r1-hunk-verified |
| `packages/shared/src/review/decision-readiness-v2.ts.md` | `ede87c9465ff641175bc1455597b039d7ed93acc60f15da74f8a8a221da87bd2` | r1-hunk-verified |
| `packages/shared/src/review/t01-typed-criteria.ts.md` | `5492a5adb2d2d591c3fa6d887c91b8acadcaa6ba3537e11c653840e1dad9ae21` | bind-old |
| `packages/shared/src/utils/agent-image-attachment.test.ts.md` | `9b8402d80c645a5a41c926d2b29eab0119fd9b42fab7ab3f8c4e3780f76ec888` | bind-old |
| `packages/shared/src/utils/agent-image-attachment.ts.md` | `a65a9e13eb0def4acc895db660215be50ae8504509caaeb7767d0b802f6d7063` | bind-old |

NOT_RUN；未改源码/旧 seal/candidate/accepted。
