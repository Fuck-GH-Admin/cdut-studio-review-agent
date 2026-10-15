# G03-T09 D original-author provenance / E-r01 DEP-001 & DEP-003 supplement (2026-10-15)

> Public, non-sensitive summary only. **No Gold, trusted fixtures, per-case answers, scoring data or access secrets are committed.** This is a **2026-10-15 incremental provenance commit**, **not** the original 2026-10-13 D author commit, not E r01's audit SHA, and not E r02 acceptance.

## Audit baseline

Read the following at audit freeze `audit/g03-e-v1-r01@1be43d8bacc015e1fd21949796defcdd3ecb96fc`:
- `acceptance/E-v1.0/E0-E1-blockers.md`, blob `941d639ae573dc36f0cb7e81afad03ec72182fdc`
- `acceptance/E-v1.0/E0-input-manifest.json`, blob `22b50c91dc23dc10023824d8159ddeb236e4b3f7`
- `acceptance/E-v1.0/E0-coverage-and-isolation.md`, blob `e19b0b3489dd02c39882fcbbfb31479c3d33b973`

DEP-001: ordinary Library co-location and **private Gold ACL unverified**; this is not an established leak. DEP-003: missing original-author Git provenance and supporting per-file pinning. T03 duplicate-version and T01 self-reported private ACL missing are separate issues and **not** T09 findings.

## Original T09 artifacts retained **bit-for-bit unchanged**

| Original artifact | Size bytes | SHA-256 | Status |
|---|---:|---|---|
| `G03-T09_INPUT_ONLY.zip` | 2440839 | `4519f755a0eb631525c55216ff2f09fd6cfd2ad05fbfe338bd3260ef95af5b75` | verified, unchanged |
| `G03-T09_EVALUATION_ONLY.zip` | 67466 | `05a3b47dad9d842b20727858dbf9aa704d392d1ff42f301c8ababb79b0738650` | verified, unchanged, **restricted** |
| `G03-T09_D_REPORTS.zip` | 13641 | `caa52e241e9999beef518421ba0673d7ff5a8e85c57c23d04a0c00d81b595224` | verified, unchanged |

Gold marker `FROZEN_GOLD_v1`; aggregate SHA-256 `8cd1e2840bda313eb12aab7aa4ad6bf9939432eea8bedb02e1d1b30aa1b4aad4`. Twenty-two Gold entries, 22 mock trusted fixtures and 133 public input members were rehashed against the original frozen internal manifest; **zero discrepancies**. Original Gold and mock fixtures remain in the original restricted evaluation ZIP (not uploaded here). No cases or decisions changed.

## A/B upstream fixed bytes — verified **now**, not retroactively

| Research upstream | SHA-256 | Result |
|---|---|---|
| `G03_A_领域总调研_研究交接包_v0.1_20261011.zip` | `4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3` | actual Library bytes + ZIP CRC verified, T09 A research handoff read |
| `G03-T09_B阶段深度调研_交接包_v0.2_本校补证_20261011.zip` | `4e2637e484b6d66f3928b6ab103a1b54153bf8e3346d4c123a83ae8dd94b0456` | actual Library bytes + ZIP CRC verified, B 00–07 & C/D handoff read |

Original D0 explicitly stated that A/B ZIPs had not been re-read **at the 2026-10-13 freeze**. Their retrieval on 2026-10-15 supplements provenance, but **does not erase or backdate that D0 PARTIAL statement**. D v2.1 prompt SHA: `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1`.

**Original D author Git commit = NOT_AVAILABLE.** A GitHub commit search for `G03-T09` did not locate a traceable original commit. E r01's audit SHA is NOT an author commit; this new change also cannot impersonate one.

## Public input-only static isolation check (actual original bytes)

- All ZIP CRCs pass; input members = 133 across 22 cases.
- Public input contains no `gold/`, `trusted_fixtures/`, `scoring/`, `coverage/`, `frozen_manifest` paths; no input/Evaluation member intersection.
- Scanned all plaintext JSON, Markdown, CSV and emails for explicit Gold/expected-status and internal answer field labels: 0 matches. Checked PDF metadata for these explicit labels: 0 matches.
- 57 PDFs parse; 22 application PDFs have text; 35 scanned proof PDFs have images but **no extractable text layer**.
- Representative application and scanned proof page visually inspected. This does not prove 100% semantic leakage absence or product OCR accuracy.

## Independent Gold and storage status

Original D author reported **no C rule body, C tests or C gold consumed**; the original author did see some *generic C migration metadata* during file search. We preserve this caveat rather than claiming absolute zero C-related exposure. This supplement has not opened C rule content or compared C and D.

**PRIVATE_ACL = UNVERIFIED**, **RESTRICTED_STORAGE = PENDING_ADMIN_ACTION**. The ordinary Library location is not evidence of a project-specific ACL. A storage administrator must place the exact original evaluation ZIP in genuinely restricted storage; preserve byte-level SHA/object version; grant only authorized E reviewers; demonstrate both an authorized successful read and an unauthorized denied read, and retain access logs. None of those proofs are available as of this supplement. **DEP-001 is not closed**.

All unknown 2026 institution-specific instrument config, source effectiveness and approval rights remain `SOURCE_PENDING`. No new Chinese-university mandatory rule or Gold rejection condition was fabricated.

## E r02 verification requests

- **E0**: independently recompute A/B/D byte SHA + ZIP CRC and bind specific versions; original-author Git SHA remains NOT_AVAILABLE.
- **E1**: independently check current original official rules and approval permissions, including 成都理工大学校发〔2023〕13号 applicability; do not force unknown conditions.
- **E2**: only the separate authorized E role reviews fixed C version against frozen D Gold and A/B sources, without asking the C author to inspect Gold.
- **E3**: validate real storage ACL / allow+deny access tests / audit trail, then recheck isolation and coverage. Merely separate ZIPs and public hashes do not prove ACL.
- Neither E r01 findings nor E r02 status are modified here.

**Local deliverables**: original three unchanged ZIPs plus separate dated public supplement containing an author statement, input boundary audit, restricted-storage administrative handoff, E r02 checklist, reproducible offline verification code, machine check summary, and SHA256SUMS. The Gold ZIP was not pushed to Git.
