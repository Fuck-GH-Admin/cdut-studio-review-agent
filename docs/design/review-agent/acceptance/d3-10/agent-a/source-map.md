# Responsibility and source mapping

| Item | Provenance | Duty | Status / authority |
|---|---|---|---|
| `plain-document@1:local/heading-coverage` initial | Repository `docs/design/review-agent/fixtures/d3-minimal-workspace.json` localTasks[0], adapted with a distinct workspace ID | Must check **摘要、正文、结论** headings, report unreadable as unknown; provide evidence, limit administrative scope | `user-synthetic-spec`, synthetic / content-checked / request-scope; not an official school policy |
| Same Check ID, revision 2 | Agent A authored synthetic change specified in this acceptance task and `tests/cases.json` | Still check all three headings; **also** inspect under-heading nonempty readable **non-placeholder** text; unreadable pages unknown; reason and material/version locator required | **Same** `user-synthetic-spec` source ID and sourceBinding; synthetic-only; no authority escalation |

Exact SourceBinding: `plain-document@1:local/heading-coverage → [user-synthetic-spec]`. One local responsibility yields one runtime D2 Check/Rule; one rule is **not** proof that three individual chapters were actually each read by Pi. No university policy is asserted. `source.kind=synthetic` is not administrative approval.

Revision 2 deliberately changes the completion and limits as well as the requirement, but retains the original three headings and unknown-handling obligation. The synthetic source is an authored test specification, not a quotation from any CDUT regulation. No shared B01/B02 module is suitable for this zero-authorization, plain-text-only task.

## P2: independent decision granularity — revision 3

The same three section duties of revision 2 are **not removed**. To avoid conflating their decisions, `workspaces/granular-revision-3.json` represents exactly three independently evaluable local tasks:

| Runtime Check ID | Original duty | Bound authority |
|---|---|---|
| `local/abstract-completeness` | 摘要 heading + readable non-placeholder text, real version/locator, unknown when unreadable | `user-synthetic-spec` |
| `local/body-completeness` | 正文 heading + readable non-placeholder text, real version/locator, unknown when unreadable | `user-synthetic-spec` |
| `local/conclusion-completeness` | 结论 heading + readable non-placeholder text, real version/locator, unknown when unreadable | `user-synthetic-spec` |

Expected D2 denominator becomes 3, with three independent Rule IDs and source mappings. **A valid SourceRef proves only traceability and permitted block/version identity, not that all three natural-language obligations were performed.** A single overall `compliant` is never derived from an arbitrary one of these three references. Cases in `tests/granularity-expected.json` predeclare distinct statuses; no online model is claimed to infer them.
