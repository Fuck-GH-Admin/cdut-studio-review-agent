# NB-18-r1 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-18 链闭合

**对象**：18 手册（修订批，sealId `seal-492ad9dac92a3f8a`）｜**冻结** `05fb2565e2…37c2`｜旧报告 reviews/nb-18/（qa-nb-30）保留未动

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**。F01(major)~F04+R01/R02 **六点全关闭**，逐 hunk 对预读基线实测值核验全中（5/11 锚、12 元组、11 码、6 码名/7 失败点、:47 构造器码、components/ 路径）；13 篇未变文件绑定旧 acceptedHashes 同源证据；无新错误。

## 合入（18 篇，exact manualSha256）

| manual（…/review/…） | manualSha256 | 证据 |
| --- | --- | --- |
| `review-v3-a-host-technical-handoff.ts.md` | `29e1d896e1c517b2391da941f1a23bb8a17ad16e3a85440557c9bc2dfc9cea55` | bind-old-accepted |
| `review-v3-a23-physical-host-observer.ts.md` | `9c48e0c75b2aa2f9e7561a1d4f60655832031e582b5dc7c6fcd49b29b2ebd98f` | bind-old-accepted |
| `review-v3-a25-c11-local-execution-ports.test.ts.md` | `a24b5b23e16a5d852c0bd2bf7e830fe5ea819ed7a4aa02db3bcd2879f10466a9` | bind-old-accepted |
| `review-v3-a25-c11-local-execution-ports.ts.md` | `32efb4396938fcb9c1dc7f1669a23ff25dd57f7d9331fcd9f263257c0e29e11d` | bind-old-accepted |
| `review-v3-a26-native-pi-session-factory.test.ts.md` | `576b6e8549380bafcf9c01563820881e7fa60c8c488599a414e720fab9227489` | bind-old-accepted |
| `review-v3-a26-native-pi-session-factory.ts.md` | `cb85604fcdff2657b29c57be7b6e031c0e84d6831a842c52652d07d5f0f74c8e` | bind-old-accepted |
| `review-v3-b-bulk-remediation-cycle.ts.md` | `2baa7643a4285f95d3921f20c20d119405b2fdd58b2f438378daa793e7ecd07f` | bind-old-accepted |
| `review-v3-b-candidate-readiness-workbench.ts.md` | `1ece7d942d1d38c969276b7e219db6b473d59ed7ca00c21a7c4e6ae607734bef` | bind-old-accepted |
| `review-v3-b30-current-materials-read.test.ts.md` | `bf97e6eaec282d353c92dcad6f9249657e6752af1da13721fc5051fe3a269b6f` | bind-old-accepted |
| `review-v3-b30-current-materials-read.ts.md` | `490fba6ec3dcd2825e70a19a4baa4896fd39ba0d606f4f6115db40ae7c484b63` | bind-old-accepted |
| `review-v3-b33-currentity-snapshot.test.ts.md` | `fcc1212c68149e048206f0724e4967c4c9dc71a6cc4463820e4f1aa5f7b863f1` | bind-old-accepted |
| `review-v3-b33-currentity-snapshot.ts.md` | `bc3d8959e4ec79925acf8263f3908e9ab040449b90806296bd5c264525fc82fe` | bind-old-accepted |
| `review-v3-b4-bulk-evidence-workbench.ts.md` | `2b67f27e8308f555896af8e982749879e631d83bb0dfa4c6bf27f065d6eae9c7` | bind-old-accepted |
| `review-v3-b4-conflict-and-instance-guard.ts.md` | `4a9e324d4df2715a381de56905d7f19b536c74c638ddf404d3a5968b1813b5df` | bind-old-accepted |
| `review-v3-b4-high-risk-semantic-evidence.ts.md` | `b05ae1aa45d481e6daea51d5402832c199e1b815e3b9dd70d6f4d46a45eb7b08` | bind-old-accepted |
| `review-v3-b4-object-isolation.ts.md` | `5d76903a184e7d2d900f7314e99b407531a75e7c4c39f9bc8d2d9b201ab069ef` | bind-old-accepted |
| `review-v3-b4-obligation-lineage.ts.md` | `b8a209759763fbd0683fc17a370bb1ee7b95a75c0fe5c04e7e6a451d6cb3f241` | bind-old-accepted |
| `review-v3-b4-original-byte-verifier.ts.md` | `938b125455501e3042b5425819565ee958053a9cc7bd660d7e080df5f27e3e4a` | bind-old-accepted |

NOT_RUN 全部；未改源码/旧 seal/candidate/accepted。
