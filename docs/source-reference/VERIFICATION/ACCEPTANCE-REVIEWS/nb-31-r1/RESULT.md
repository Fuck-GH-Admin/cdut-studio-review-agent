# NB-31-R1 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-31 链闭合

**对象**：18 手册（修订批，sealId `seal-6784ca0a1725368f`）｜旧报告 reviews/nb-31/ 保留未动

## 结论

**G0/G1/G2 PASS → accepted（18/18）**。三点全关闭，对基线精确：F01 测试用例 1→**2** ✓（test( 机械=2）；F02 导出 18→**19** ✓（export 语句=19）；F03 被测符号 17→**16** ✓（4 const+12 fn 导入实测=16）；无新错误；未变文件绑定旧 acceptedHashes（15/16+）。

| manual | manualSha256 | 证据 |
| --- | --- | --- |
| `packages/shared/src/utils/automation-schedule.ts.md` | `d59edc6a432d7b87b52509b65629b956a4b0efe625f4b58a9470426f2913887d` | bind-old |
| `packages/shared/src/utils/beijing-time.test.ts.md` | `cbf33376e345de14be08c50dbf202fabffd79e839778e4dd88599660133b46b8` | bind-old |
| `packages/shared/src/utils/beijing-time.ts.md` | `11c76a8354207c467c38ffaa7c1f948f492f3371853d28135648682ef670c73d` | bind-old |
| `packages/shared/src/utils/capabilities-diff.test.ts.md` | `bcaf8e2ad85306d5818580ec618fd4d92bd295bea83883b39bce48f3f77066d7` | bind-old |
| `packages/shared/src/utils/capabilities-diff.ts.md` | `403bedcdc1a7171fbaf3e47b994dbc21b16d0605f76e71b368a963b793b4754b` | bind-old |
| `packages/shared/src/utils/channel-plan-quota.test.ts.md` | `ae168e6f87b4073328a2ecccfe28257090b5f686ebc05ab9e1065aef5246a98b` | bind-old |
| `packages/shared/src/utils/channel-plan-quota.ts.md` | `d6cad3fab1d3c79b794ea092dee0bab495b59eb610c35590ae7e04cecfd85443` | r1-hunk-verified |
| `packages/shared/src/utils/context-entropy-pruner.test.ts.md` | `469f5060d37391fedb11e0a2c50975eeed41b954fe1df45bc2ac513a0cf8b3f3` | bind-old |
| `packages/shared/src/utils/context-entropy-pruner.ts.md` | `0777e2a4453a9f41a5738cca68f05e401073829ad68ba65248c4e08b56dca92e` | bind-old |
| `packages/shared/src/utils/context-usage.ts.md` | `1480e05716d80b5db98e03c809178bc2d31128d53520a3ac6bde883a674b0a0f` | bind-old |
| `packages/shared/src/utils/context-window.test.ts.md` | `c73434dc80073f71405b4f87fb8796b38d6742a1dc65304f3390b2417676a045` | r1-hunk-verified |
| `packages/shared/src/utils/context-window.ts.md` | `0a49f91145ed870d44d6367b6b64ed34c9a9cee774292f37b031e65f03a0ba6e` | bind-old |
| `packages/shared/src/utils/cslab-analysis.ts.md` | `5b8d1a3d7b4a614a85a4ae74ed4d041a8ad058888f15972c3d16adcd4e7039e9` | bind-old |
| `packages/shared/src/utils/cslab-canvas.ts.md` | `1791941bb73bf02cbd56c37f17fd81226931b7e6f544ffa931f56d9bc220cfc3` | bind-old |
| `packages/shared/src/utils/cslab-cif.test.ts.md` | `f595e66658fa34d0323ec17383247c908840cd5e2584abf56abb729eca13d678` | bind-old |
| `packages/shared/src/utils/cslab-cif.ts.md` | `0550bcce0cdbaaba184bca194f82e945af640db98062e22399778879efe22d62` | bind-old |
| `packages/shared/src/utils/cslab-crystal.ts.md` | `da47924ca87385ab34b352a32d6773097766f332a4b4580fced07b36691103b0` | r1-hunk-verified |
| `packages/shared/src/utils/cslab-dag.ts.md` | `dc791b3db3adb5c599f69c8e190f8e8869b0770ad47a8c3accc207f33d0b6942` | bind-old |

NOT_RUN；未改源码/旧 seal/candidate/accepted。
