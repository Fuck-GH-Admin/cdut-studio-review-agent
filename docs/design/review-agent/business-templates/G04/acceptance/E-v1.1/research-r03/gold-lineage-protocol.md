# G04 Gold freeze-label lineage experiment — privileged verification contract

## Access gate, run status and trust boundary

**REAL_HISTORICAL_GOLD_REPLAY = NOT_RUN_ACL.** No private S1...Sn snapshot was opened by r03. Current public Git includes only author provenance statements, archive hashes and metadata. Public SHA equality for *final* r01/r02 ZIP is NOT a replay of older private snapshots, not semantic validation and not an access-control attestation.

Admin-only inputs: private immutable snapshot URLs/paths, snapshot object version, independent acquisition timestamp (if available), policy label exactly as present in private frozen_manifest.json, prior audit report's referenced version and case-denominator definition. Do not share private paths in a public PR. Gold owner must attest lawful authorizations and access compartment before opening these objects.

### Evidence hierarchy (not interchangeable)

| Template | Public Git author statement / code (verified accessible) | Historical per-byte independent replay | Specific discriminating risk |
| --- | --- | --- | --- |
| T05 | D author's gold_provenance_and_acl_status.md at 9d4ffcc82a9b48a0dd1ac1ef38a5b632465ee659 claims S1→S4 all called FROZEN_GOLD_v1; S1→S2: 26 fact_checks changes; S2→S3: 26 observed timestamp changes; S3→S4: same Gold content | NOT_RUN_ACL | Which early claimed freeze is immutable, and did expected facts or only inputs/timestamps change? |
| T06 | D author's D_r01_incremental_changes_and_E_r02_handoff.md at 6a1ff22f2a6b65eb717dd21f0e803caa246e7529 claims 5 uploads same FROZEN_GOLD_v1; 28→148 assertions; 24 case files, later 8 source metadata changes | NOT_RUN_ACL | Assertions/case-coverage denominator changed; do not infer changed labels = wrong business answers |
| T08 | D author's E_r02_recheck_handoff.md at b9a8fe40b01afc6ff9d683420bceafe5a1f5eef2 states final manifest v2, earlier D report calls v1 | NOT_RUN_ACL | Old report/test result may be tied to v1 rather than final v2; determine exact referenced bytes |

Protected sources, unlike public metadata, must never be uploaded to branch, C author workspace, public CI or common project folder. The script's output is also restricted by default and must not be pasted into a public ticket unreviewed.

## Admin execute sequence

1. Record who authorized the private session and the exact scopes; prove current read allowlist (E/storage), C identity deny and unauthenticated public CI deny. Record request/response audit IDs and retention coverage. Do not fabricate historical access logs where none exist.
2. In a dedicated private workspace, map each T05 S1–S4, T06 S1–S5, T08 v1/v2 snapshot to immutable object ID, raw SHA256, label *inside its frozen manifest*, actual creation observation and official freeze/selection event. A filename label alone does not prove immutable freeze. Record missing snapshots explicitly.
3. Create local **restricted_input.json** with array snapshots in **chronological order**, each with template, snapshot, label, zip_path (real private local path, not Git URL). The script reads private ZIP bytes and emits only snapshot-level SHA/counts and aggregate changed Gold member count. This first stage is structural, **not a Gold interpretation**.
4. Run Python 3: python replay_gold_lineage.py restricted_input.json > restricted_result.json. Keep both JSONs restricted; inspect for same_label_gold_drift and changing member count. Verify independent SHA against actual archival/object records, not solely self-referential frozen_manifest from inside ZIP.
5. Using another *authorized* E person, reconstruct a **private** changed-case mapping for each changed Gold member. For every (template, unique case_id, duty_id, rule_source_version), determine whether the meaning changed: expectation state, evidence anchor, source locator, observed-at timestamp, scoring/assertion count, or mere packaging metadata. Compare frozen source duty and legal alternatives. Don't count raw JSON field changes as business defects.
6. Bind all historical old indexes, old report's claimed Gold version and final v2 report to specific object SHA. For T08, check old report references v1 but final scored Gold v2, and rebase the affected scoring run only if independently established. Report **denominator** as distinct verified cases × independent source obligations under the same legal/fictional policy scenario, plus coverage changes; raw 28→148 assertions is not automatically 120 new independent cases.
7. Only after semantic case comparison, assign: confirmed version-label integrity defect / changed test meaning / affected denominator / sources needed / tests needing regrade; do not mark Gold answer falsity unless actual official or explicitly simulated rule and case evidence contradict it.
8. Public-output allowlist: snapshot identifiers S1/S2..., template TXX, object hash if not sensitive policy prohibited, counts of changed Gold members and **aggregated** affected case/duty counts (minimum privacy threshold), kind of drift, semantic impact class and named unresolved categories. No paths, case IDs, hidden expected labels, trusted fixtures or policy_assumptions details outside private archive.
9. If admin cannot establish object access/denied-access proof or reconstruct earlier snapshots, log STAGED_NOT_EXECUTED / NOT_RUN_ACL, keep 0008 OPEN; do **not** assert historical equality, absence of leakage or reconstructed case denominator.

## Minimal restricted input schema (illustrative, NO actual paths)

Use a private JSON of the following shape; this public sketch is intentionally not runnable and contains zero real Gold values:

    {
      "snapshots": [
        {"template":"T05","snapshot":"S1","label":"FROZEN_GOLD_v1","zip_path":"<PRIVATE_ARCHIVE_S1>"},
        {"template":"T05","snapshot":"S2","label":"FROZEN_GOLD_v1","zip_path":"<PRIVATE_ARCHIVE_S2>"}
      ]
    }

The restricted comparator compares case-sensitive Gold member paths and raw content SHA256 for each adjacent version, and reports aggregate changed counts. Different ZIP member naming or packaging reorganization can inflate counts; that is why authorized semantic mapping and a canonical-case manifest are required to close the experiment. Archive path normalization or heuristic matching must never silently assign case identity; identity needs source/manifest evidence. The script verifies no duplicate ZIP names and sets an uncompressed archive cap.

## Synthetic smoke test (NOT the requested private Gold replay)

Local, fully invented two-ZIP smoke test executed with FROZEN_GOLD_v1 reused and one synthetic gold JSON changed; comparator returned same_label_gold_drift=true, gold_members_changed=1. This establishes only that the comparator's mechanics can detect a **toy** byte difference. Real S1/S4 and S1/S5 objects have not been replayed. Current quantified *historical* semantic difference: UNKNOWN / NOT_RUN_ACL; verified **real business defects in C/D**: 0.

## Case evidence anchor validation

For any protected E2 semantic review, record privately: dutyId / original official sourceLocator / applicability / changedFact / expectedDecision / admissibleAlternatives / evidenceAnchors / failureMode / confidence / unresolved. Keep F (current applicable sourced) separate from S (versioned fictional rule) and U (campus policy unknown). An unsupported single unique expected state in U is a potential Gold weakness; it is NOT a proven false answer without checking scope and what the case states.

## Historical issue and next minimum cost

- Ticket E-G04-GOLD-LINEAGE-0008 remains OPEN P1 until independent historical byte replay and source-scoped semantic comparison. Only source metadata exists today.
- Ticket E-G04-GLOBAL-0003 remains OPEN for private ACL/log independence even if the final ZIP SHA matches. A new storage ACL now does not prove that no C exposure happened during original creation.
- T06 0004 remains RETESTED_CLOSED_FORMAT_ONLY. The 7 Markdown link fixes have no bearing on restricted Gold label reuse. Do not re-open merely to show activity.
- Cheapest non-private next action: admin publishes object presence/permissions **metadata-only** verification contract; clean-room E1 independently locks new Article 15 applicability. Cheapest private next action: compare T05 S1↔S2 (known claimed 26 fact_check changes) before all other snapshots; if no originals, stop and report exact missing object/version instead of repetitive generic blocker tables.

Status: public reproducibility specification COMMITTED, comparator syntax tested synthetic only; Gold real replay NOT_RUN_ACL, E2 NOT_RUN, D4 NOT_RUN, online model NOT_RUN, school administrative authorization NOT_VERIFIED.
