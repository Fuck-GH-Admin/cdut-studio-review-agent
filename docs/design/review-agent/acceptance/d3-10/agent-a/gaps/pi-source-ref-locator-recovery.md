# A-004 — SourceRef block/quote mismatch: failed test then corrected author input

- Run: [38090577999](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38090577999), step `20-pi-real-service-synthetic-receipts` exited 1. The raw error in the job log states: `引用不属于本案当前激活材料，或 blockId/引文与解析原文不匹配`.
- Cause: the independent test author had selected **the first paragraph block** (`摘要`) for the negative case while quoting `待填写`, which actually appears in a later block. The service correctly rejected the mismatched SourceRef; it was not a D3 compilation or semantic rule defect.
- Minimal reproduction: register a `.txt` material with lines `摘要\n...\n正文\n待填写\n...`, then submit `sourceRefs=[{documentVersionId, blockId: firstBlock.blockId, quote:'待填写'}]` for the negative Check. The desired quote does not exist in `firstBlock.text`; rejection is expected.
- Recovery: select the block containing the desired excerpt (`document.blocks.find(b => b.kind!=='image' && b.text.includes(quote))`), preserve the unchanged Check/Rule/Source mapping, retry with valid version and matching block. Add a separate deliberate bad-location negative control; do not disable SourceRef validation.
- Owner: test input, **not** shared runtime code. This friction highlights that first-time authors need clear advice: evidence location is **block-specific**, not merely a documentVersionId and arbitrary quote.
- Status: awaiting rerun with corrected locator.
