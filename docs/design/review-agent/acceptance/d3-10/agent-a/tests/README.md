# Case matrix and execution meaning

`cases.json` contains three independently written synthetic texts and their predeclared GOLD classification: positive, negative (all headings but placeholder body) and unknown (damaged unreadable body). `verify-plan.py` computes a transparent **non-Pi** GOLD-oracle result and tests that the modified rule text/coverage remains in the real D2 plan. This does **not** submit any material to Pi; `actual-results.json` explicitly marks each Pi execution `not-run`. No synthetic self-review is presented as a model outcome.
