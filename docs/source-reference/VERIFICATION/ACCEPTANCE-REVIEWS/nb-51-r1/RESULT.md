# NB-51-r1 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-51 链 r0→r1 闭合

**对象**：18 手册（修订批；sealId `seal-dddcffe30327ed17`）｜**冻结** `05fb2565e2…37c2`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**。**F-01 字节级关闭**：§4/§8/§9/§11 四处计数统一为 54（6 文件口径 2/17/11/13/10/1）并新增全组口径句（10 文件 81：+compaction 11/send-binding 6/send-coordinator 4/deletion 6）——与 QA 机械实测完全吻合；修订区无新错误；17 篇逐字节未变。

## 合入（18 篇，exact manualSha256）

| manual（…/apps/electron/src/main/lib/…） | manualSha256 |
| --- | --- |
| `apps/electron/src/main/lib/agent-send-binding.test.ts.md` | `5bcbbd535cdbeb72463f8d070a0b2a7383054fa46fee3bb7529c316c47019e96` |
| `apps/electron/src/main/lib/agent-send-binding.ts.md` | `4c269d01f3dfe121724bf80c17aed35a81aaa941b4a061f11a8f59165a79d623` |
| `apps/electron/src/main/lib/agent-send-coordinator.test.ts.md` | `da56213d750ce336a92803f2e8237895d1b861f96f1bd9c9313ac030a10cd8b5` |
| `apps/electron/src/main/lib/agent-send-coordinator.ts.md` | `8485da77b3cdc7148c82bd472d91b695a5c70bbcc0e23f3593a0bf15902cee9a` |
| `apps/electron/src/main/lib/agent-service.ts.md` | `023b7bda68413259efdffb750e00c74111d918e760a76eb52ff1e62b45ead1ba` |
| `apps/electron/src/main/lib/agent-session-compaction.test.ts.md` | `440d40d15f4999b194789a36b95cf9d50f5804c837a7aa62db75c1bb33cd45d5` |
| `apps/electron/src/main/lib/agent-session-compaction.ts.md` | `83138970ecd0dd79bb0bb53f0a5fdf8cd1e0cbc51501337b3139627f9f29acc7` |
| `apps/electron/src/main/lib/agent-session-deletion.test.ts.md` | `f5fb8e8d369ccd6183d3f936d87858fe1cdddd1ddfce086c380abe66be57db5f` |
| `apps/electron/src/main/lib/agent-session-deletion.ts.md` | `9b95440a50ebf25016936488888b779574feebb1214290edb3cf7ec931214a7a` |
| `apps/electron/src/main/lib/agent-session-index-cache.test.ts.md` | `0703ad21e2465289fdc2de21b36f9004bb4cd6e29b1427ef1b487baa0bb7315e` |
| `apps/electron/src/main/lib/agent-session-manager.oversized-sanitize.test.ts.md` | `ed6a9269f3d33331da786379c787bc0a47c9c3402847b5fccc9df5354819282f` |
| `apps/electron/src/main/lib/agent-session-manager.pi-fork.test.ts.md` | `3585db1d6ded5285ffe9f1c2fcb124e9fb1862e73c3ceb0cdcd018bcb28438c6` |
| `apps/electron/src/main/lib/agent-session-manager.pi-runtime.test.ts.md` | `1db14c5df964c2d76a3ca41c90f7a18a3fb0a332d738acc3c926dad780022afa` |
| `apps/electron/src/main/lib/agent-session-manager.ts.md` | `c3a192ce4b74e3ae6668afc69e84bd855681833228252cbde699bd21ad5dd9e7` |
| `apps/electron/src/main/lib/agent-session-pagination.test.ts.md` | `d352c000524dbff8a656e29553e19ca76771af47dfec0fdcadf0d757a82cd7a3` |
| `apps/electron/src/main/lib/agent-session-payload-externalization.test.ts.md` | `7d979dd850804eb31dfe847504a621ac28b5bd45e3a6f370115f98833128fb23` |
| `apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts.md` | `179a805048595cb64bfa0b84fb5dde2ec7f996ad35eb162ea492cfdf0955dc72` |
| `apps/electron/src/main/lib/agent-session-ui-projection.ts.md` | `48dd3173e9fd99aa1a69b501d013683c9da7d72dc0bb7b361b6387150b78a7ec` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账；nb-51 报告保留不回写。
