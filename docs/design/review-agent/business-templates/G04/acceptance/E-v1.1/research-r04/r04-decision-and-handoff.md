# G04 E v1.1 research r04 — decision and responsibility handoff

**Disposition: RESEARCH_FINDING_STATIC_TRACEABILITY_GAP; not PASS, not a scored business defect, not a new first-time blind E1.** One useful new observation (Art.15 duty-to-C mapping) beyond r03's already-known legal exclusion of 'no police permit => no school fire check'.

## Decision

- **Refuted:** H3 `NO_FIRE_MODEL`. C already includes R-19 safety plan, R-20 emergency plan, F-50/MS-25 site inspection, R-27 specialist review, ST-10 manual pending and ST-14 pre-execution state. This must be retained in any defect write-up.
- **Not supported:** H1 `COMPLETE_GUARD` on the frozen C's explicit trace. No Article-15-specific on-site inspection-PASS trigger from `large campus event` independent of Order 505 and generic `有安保安全评估/整改`; no verified 'school fire organization' issuer/delegation mapping; no separately modeled organized-drill duty; equipment/egress atomics partial.
- **Supported:** H2 `PARTIAL_GENERIC` and conditional risk. This is an **observed structural coverage gap**; whether deployed software actually releases uninspected events remains **NOT_RUN** and requires a runtime test. Don't invent an authorization failure.
- **Legal guard:** For activities that actually come within Order 28 Art.15, the school's fire organization site-pass is an obligation before holding, notwithstanding Order 505 permit non-applicability. Do not infer a universal CDUT campus large-event attendance threshold or force the initial applicant to upload a later-site-check certificate.
- **No false authority equivalence:** `保卫处`, campus venue owner, meeting approver and state police authority do not automatically equal `学校消防机构`; CDUT may have a valid delegated role but actual competent source is missing.

## Most informative next single check

**Ask CDUT's current competent school fire/security authority exactly this, with a dated answer or official OA schema:** “For activities within Article 15, which current school unit/post signs the activity-site fire inspection outcome, which original record (field/status/issuer/venue/event-version/validity) establishes PASS before opening, and what evidence/timing demonstrates the mandated drill?”

This single authority response closes more U than another generic open web search. Archive authoritative title/issue date/validity scope/issuer and its permission to cite publicly. Do not ask unrelated TXX to redesign campus policies.

## Handoff by responsibility

| Owner | Action | Observable acceptance evidence |
|---|---|---|
| CDUT competent school fire/security source owner | Confirm Article-15 campus large-event applicability boundary, fire office delegation, drill procedure, official check record and execution timing | Dated official original / signed campus reply / authentic OA schema, explicit jurisdiction and validity |
| C T06 author (public-side) | Map each Art.15 atom (fire safety lead, equipment, egress elements, plan, organized drill, school-fire onsite PASS) to one or more R/F/MS/EV and stage. Preserve R-11 State Council police test. Define **required before holding** without demanding future artifacts during initial application | New separately versioned C with exact diff, SHA256 and author provenance; no overwrite of fixed C v0.1.1; distinguish unknown policy from not-applicable |
| Independent clean-room E1 reviewer (different, unexposed) | If proposing newly disputed source binding, independently source-lock actual original legal/local rule *before* viewing this report or C/D divergences | Ex ante independently frozen fact/applicability register and hashes |
| Independent E after lock / later technical owner | Review source→C atom coverage and perform paired cases A1/A2 and B1/B2 once new C is frozen; only then test runtime `can_execute` against actual authorized workflow | Clearly labeled static check vs D4 or end-to-end execution record; no simulated PASS promoted to actual |
| Storage admin + old D | Only authorized historical Gold T05 S1→S2 26 claimed `fact_checks` semantic replay with r03 script; if originals unavailable produce one precise unavailable-object/version statement | Private ACL allow/deny, original immutable object versions/SHA and private semantic case mapping; sanitized aggregate public summary **only if allowed** |

## Public/restricted boundary and issue state

- Do not fetch or publish private Gold, policy_assumptions, expected labels, object URL, ACL token, case identifier or privileged test report. R03 synthetic smoke test remains `PASS_SYNTHETIC_ONLY`; history remains `NOT_RUN_ACL`.
- Do not reopen E-G04-T06-0004: r02 closed only its **format** defect. This r04 concern is a distinct statutory traceability question, not a regression of seven Markdown URL fixes.
- E-G04-SOURCE-0006 stays `BLOCKED_SOURCE`; E-G04-GLOBAL-0002/0003 and E-G04-GOLD-LINEAGE-0008 stay as recorded, not auto-closed. No invented new P-level ticket before independent source qualification and author/static refinement.
- Formal E0–E4 acceptance = unchanged `BLOCKED_INPUT + BLOCKED_SOURCE`. Gold = `NOT_RUN_ACL`; D4 = `NOT_RUN`; Pi and end-to-end = `NOT_RUN`; school official authorization = `NOT_VERIFIED`.

**Stop condition for r04:** source-to-C comparison produced a falsifiable uncovered duty; do not grow additional paper checklists or pretend to run Gold without controlled access. Three-file public record is the complete research handoff.
