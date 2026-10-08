# DeepSeek review baseline

This is the before-change run captured on 2026-10-08, using the student award-credit synthetic case and template `student-award-credit-v1@1`. The case input, completed run record, checkpoint artifacts, and model audit are kept under `cases/deepseek-capability-benchmark-v1/`.

The baseline completed in 19.378 seconds with 2 Pi queries. The provider reported 13,377 input tokens, 47,488 cache-read tokens, 3,955 output tokens, and about USD 0.00904. Counting uncached plus cache-read input, that is 60,865 input tokens. Pi's streaming result messages made the old harness's assistant-message/tool-call totals count repeated deltas; those two counters are not reliable and should not be compared.

All six planned checks completed. One produced an effective verdict and five correctly remained pending human confirmation. The model identified the synthetic certificate and team-membership uncertainty and did not infer a school score from the announcement. However, the image attachment was rejected by the configured DeepSeek-compatible endpoint, and the run marked each source document unread because the agent had no document-reading capability beyond search. This is the historical baseline; the post-change run will use a clean copy of the same four source files and template.
