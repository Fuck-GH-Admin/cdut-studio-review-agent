# Structured Pi service test clarification

`pi-synthetic-interface.ts` registers each of the three synthetic text files via the **real** backend `registerMaterial`, creates a D2 technical case, invokes `preparePiReviewRunV2`, submits **predeclared** synthetic statuses via `submitPiReviewResultV2`, then calls `verifyD2PiRun` and checks SourceRef enforcement. The case outputs are written to `pi-structured-results.json`.

This tests backend receipt correctness, source/version gates, and whether the edited *natural-language task reaches the real Pi prompt*. It does not test whether any model can derive those statuses itself; online model inference is deliberately `not-run`.
