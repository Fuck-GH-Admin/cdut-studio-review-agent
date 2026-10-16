# G04 E v1.1 research r04 — question, competing hypotheses, scoped result

> Research-only follow-up to r03; **not** a clean-room E1, formal E0–E4 acceptance, approval, Gold verdict, or system execution test. E investigator has already been exposed to C-side disagreements. Date of this work: 2026-10-16.

## Provenance before comparison

- Frozen parent: `research/g04-e-v1p1-r03@7cb692851f00efc6196e84e080b8e40e7017e7b1` (Git commit and recursive tree fetched).
- Parent research artifacts present: `research-r03/README.md` Git blob `5455a0ac1f525b9d027c0d9cce0be100e3643f4d`; `research-cases.md` blob `fd28206e3d923df5305b882a5dcd74773fc9c8fe`; `gold-lineage-protocol.md` blob `75c50612961526b21001f8ccb216bb9249ac60d3`; `replay_gold_lineage.py` blob `8219dae6a503abd05e226a724c6027540378a0ed`. Git blob SHA-1 **is not** content SHA-256.
- C fixed input recovered from **authorized accessible ChatGPT Library public-side C asset**, NOT private D/Gold: `G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md`; **recomputed raw SHA-256** `d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2`, size 186090 bytes, 1087 lines. Equals r02 archived newMasterSHA256. This is C author material, **not E-authored code**; original C Git commit still NOT_AVAILABLE. Do not mistake Library upload date or r03 Git SHA for initial C author freeze.
- Primary official HTML: Ministry of Education / Ministry of Public Security Order No.28, *高等学校消防安全管理规定*, Article 15: https://www.moe.gov.cn/jyb_xxgk/xxgk/zhengce/guizhang/202112/t20211206_585092.html ; independently cross-displayed in national fire authority https://www.119.gov.cn/gk/flfg/bmgz/2022/1031.shtml . Read as a **published official source**, not privately SHA-frozen original bytes.
- Secondary official scope comparator: State Council Order No.505 Articles 2, 11–13: https://xzfg.moj.gov.cn/front/law/detail?LawID=204 .

## Single discriminating question

**For an event definitely within Order 28 Article 15's 'large campus activity/exhibition' scope, does G04-T06 C v0.1.1 require distinct, effective-school-fire-organization onsite inspection PASS before 'may hold / can_execute', regardless of Order 505 public police permit applicability? Are the remaining Article 15 obligations individually traceable?**

Do **not** assume 1000 people is CDUT's Article 15 large-campus-event threshold; that number belongs to a *different* legal applicability test (Order 505).

### Mutually exclusive structural hypotheses

- H1 / COMPLETE_GUARD: C has an enforceable Article-15-specific trigger, issuer-specific school fire inspection PASS, and pre-event hard guard, separate from generic security permission/police license, including drill traceability.
- H2 / PARTIAL_GENERIC: C has generic responsible person, plans, security specialists and site checks, but no complete explicit Article-15 rule-to-evidence-to-authority-to-execution linkage.
- H3 / NO_FIRE_MODEL: C entirely lacks site/fire inspection fields and specialist judgment.

**Observed structural result: H2 is supported; H1 and H3 are not supported by the frozen C source.** C `F-50`, `MS-25`, `R-27`, `ST-10` show generic site inspection, refuting H3. But `R-27` activates on `有安保安全评估/整改`, `MS-25` says `保卫处现场检查`, and neither names the Article-15 duty/competent school fire organization nor an inspection-PASS dependency for each in-scope event. A whole-document exact-text inspection found `消防机构` (0), `现场检查合格` (0), `疏散指示` (0), `应急照明` (0), `消防车通道` (0), and `演练` (1, in bibliography CD02 context, not an operative C rule). **Text absence alone is not a run-time failure claim**; the existing partial modeling and alternative labels were read before deciding.

## Two fact-minimal distinction checks (source-expected only; no D case or Gold used)

**Pair A (onsite inspection):** same campus-event facts, known to be within Order 28 Art.15, campus members/invitees only, otherwise document/venue/organizer/security approvals held constant. A1: competent school fire organization **has not passed** onsite check. A2: the same competent authority has issued effective onsite check PASS for same activity, venue and version. Source expectation: A1 **CANNOT_HOLD / FIRE_CHECK_PENDING**; A2 **FIRE_CHECK_DUTY_SATISFIED** (other approval gates may still be pending). The exact current C issuer-to-state guard cannot be established; A1 vs A2 would require C author policy map and a D4/runtime test to establish actual misclassification.

**Pair B (exercise):** same otherwise-compliant applicable campus activity, plan present. B1: no organized fire/extinguishing and emergency-evacuation drill demonstrated by authorized sources at the required stage. B2: legally sufficient drill was actually organized. Source expectation: B1 **DRILL_DUTY_UNRESOLVED**, B2 **DRILL_DUTY_SATISFIED**; neither should be forced as an initially uploaded *post-event artifact*. C covers an emergency plan but does not expose a distinct drill duty. Current 2026 CDUT acceptable record and timing remains U.

These are source-to-template static distinguishing cases **NOT_EXECUTED**. No authority was impersonated and no restricted Gold touched.

## F / S / U classification

- **F:** Article 15 statutory duty exists for activities that fall within its textual scope; designated fire-responsible person, operative measures, fire equipment, evacuation means, plan and organized drill, school fire organization onsite check *before holding*, and separately required external approval when legally applicable. Order 505 permit is not a substitute.
- **S:** None applied to determine the actual CDUT policy. The pairs are minimal hypothetical *facts under the stated F legal scope*, not an invented university policy or claimed official case outcome.
- **U:** CDUT 2026 Article-15 applicability determination at the boundary; competent campus fire institution and delegated position; acceptable onsite-check/drill record, timing and school workflow; whether R-27 generic gate is actually enforced in a configured runtime.

Decision level: **STATIC_TRACEABILITY_GAP / CONDITIONAL_RELEASE_GUARD_RISK**, **NOT_PROVEN_RUNTIME_DEFECT**. Do not upgrade to formal E2 failure or release pass.
