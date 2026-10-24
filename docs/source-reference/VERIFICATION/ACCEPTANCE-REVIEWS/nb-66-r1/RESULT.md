# NB-66-r1 独立复验报告 — batchVerdict: accepted（18/18）

- `nb-66-r1`（revisionOf nb-66，sealId `seal-6e4ba1efcd0d61bf`）；frozenSha `05fb2565…37c2`。
- **G0 PASS**（before/ 2 篇==父 stage、重放 2/2、RESPONSE after-hash 2/2、链一致）。
- **G2 PASS_WITH_NOTES**：**NB66-F-01/F-02 全关闭**——gpt-image-connection 篇如实改写"孤儿模块（全树含动态口径仅 test 引用）+预期用途与已证实调用链分离"✅；file-search 篇消费归 ipc.ts:427+preload、remote-service 零命中如实标注✅。16 篇逐字节未变子批重登记。
- **残余 NB66-N-01**（minor→errata）：7 篇 §2 行号漂移（与行号类合并清单一起关）。
- 18 accepted；`acceptedHashes` 18 个 exact manualSha256（2 新+16 同 r0）。NOT_RUN；哈希脚本生成。nb-66 系列闭链。
