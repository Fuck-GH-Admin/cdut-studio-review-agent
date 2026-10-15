# G04 r03 distinguishing-case register — research facts versus release gate

## Evaluation semantics

- F = anchored official source fact with **explicit applicability**. General legislation is not proof of a current CDUT implementation threshold. F cases measure whether two independently legally meaningful duties can be separated.
- S = explicit **closed fictional school** scenario (SIM-CAMPUS-R03); assess consistency with the stipulated fictional rule only. No S condition is asserted for CDUT.
- U = actual current campus policy, form, delegation or interface unverified; expected decision must remain POLICY_PENDING / PENDING_AUTHORITY, not fabricated rejection/approval.
- Decision labels below denote hypothetical **material-review responses**, NEVER issued approvals; legal decision belongs to officials.

## F-CASE-01: personal lab admission is not a project safety review

dutyId: E1-G04-002 / E1-G04-006 / E1-G04-008 (inherited source facts).
sourceLocator: 成都理工大学 成理校发〔2023〕40号, articles 7, 10, 11, https://gz.cdut.edu.cn/__local/7/87/9D/8AD8CCD1A99607DFA7C053FA5E9_5E88AC4A_E9D3A.pdf
applicability: Person must complete applicable training for lab work; the teacher/research project owner separately submits experiment/project safety substantiation to their teaching/research unit; the latter action is project- and version-scoped, not conferred by a student training receipt.
changedFact: Pair A = student has verified appropriate training, project owner's safety substantiation is not submitted. Pair B = submitted project substantiation for the activity, but student's required training is not verified. Same project, person and risk profile otherwise.
expectedDecision: A => person-training fact may be satisfied; T04 project-review submission still missing/pending, not already approved. B => T04 submission exists but T03 person's training remains missing or requires authoritative checking; neither outcome is automatic lab admission.
admissibleAlternatives: Authorized electronic training record; project-specific signed/electronic submission; school-accepted equivalence only if independently verified. Do not demand a downstream approved-project seal as an original-applicant input.
evidenceAnchors: Training record identity/date/scope; project_id/protocol_version and submitted unit; missing fact must be recorded explicitly; an authorized record's effective phase.
failureMode: C/D common-mode collapsing TRAINED_PERSON, PROJECT_SUBMITTED and PROJECT_APPROVED into a single positive result; wrongly refusing training based solely on absence of unrelated paper certificate.
confidence: High for source duties, conditional for exact local training credential acceptance.
unresolved: CDUT specific 2026 accepted training electronic evidence, risk-specific approved project form and authority. No Gold opened.
researchCrosscheck: Source-defined contrasting expected responses only; no current C/D or Gold defect demonstrated.

## F-CASE-02: no State Council police permit does not mean no campus fire check

dutyId: E1-G04-012 / E1-G04-013 (inherited), F-G04-R03-01 (new research source).
sourceLocator: State Council Order 505 articles 2, 11–13, https://xzfg.moj.gov.cn/front/law/detail?LawID=204 ; Education/Public Security Order 28 article 15, https://hudong.moe.gov.cn/jyb_xxgk/xxgk/zhengce/guizhang/202112/P020211208562380319172.pdf
applicability: A legally applicable police large-public-event permit depends on legal organizer, general-public access, statutory event kind, audience size per event and exclusions. Separately, school-recognized large campus cultural/sports/assembly events fall under Order 28 article 15's event fire responsibility/check, independently of 505 public access status.
changedFact: Pair A = same 1500-person large campus stage performance by a lawful organization, **campus members/invited-only** (no general-public access). Pair B = same performance opened **to the general public**, same audience count and otherwise same characteristics; both set as large relevant campus events for the Article 15 counterexample.
expectedDecision: A => 505 general-public criterion is false, so do not auto-require 505 police permit or its 20-day filing; article 15 university fire-check duty remains applicable and must be verified separately before event. B => 505 requirements are potentially triggered subject to ALL other legal criteria and exceptions, so identify external police licensing status and required timing separately; Article 15 school fire-check also independent. Neither A nor B is automatically approved.
admissibleAlternatives: If organizer/actual statutory event classification or exceptions remain uncertain, use AWAIT_LEGAL_SCOPE_REVIEW; an official valid police license cannot substitute for school fire inspection, nor vice versa. Already approved venue booking does not discharge either.
evidenceAnchors: Event audience invitation policy, promotional registration mechanism, category and per-session headcount, organizer legal capacity, applicable exclusion, separate school fire inspection record and police license (if legally required), approval stages.
failureMode: POLICE_THRESHOLD_ONLY (misfire in A), or NO_POLICE_NO_FIRE_CHECK (false negative in A); improper transfer of school security/venue signoff to police.
confidence: High for the two general-source legal scopes; no claim that 1500 is a universal CDUT campus-fire-event threshold.
unresolved: 2026 CDUT school designation of 'large' relevant events, current local form/approval roles, standing Article 15 implementation and exceptions; requires clean-room E1 for any new disputed binding local rule.
researchCrosscheck: Existing C T06 v0.1.1 AX-06/R-11/W04/W05 explicitly keeps general-public/number/category/exclusions apart and W05 distinguishes police receipt from license. This **rules out a readily observable simplistic police-only threshold implementation in those inspected C segments**. Article 15's source-to-C exact duty coverage has not been fully evaluated; no defect ticket.
hypothesisEliminated: Assumption 'if Article 2 of Order 505 does not apply, no fire oversight is necessary for a large internal campus event' is REFUTED by Order 28 article 15.

## F-CASE-03: construction presence, campus access and actual welding permit are independent

dutyId: F-G04-R03-02 / F-G04-R03-03 (new research), E1-G04-015 (inherited); A candidate N18, G04-T02/T01/T07.
sourceLocator: Education/Public Security Order 28 articles 17, 22, 23, same https://hudong.moe.gov.cn/jyb_xxgk/xxgk/zhengce/guizhang/202112/P020211208562380319172.pdf ; G04 A-v0.1 unified catalog T01/T02/T07; old E3 N18 issue OPEN.
applicability: Article 17 deals with contractor's construction-site fire responsibility and school fire oversight; Article 23 separately binds campus employing unit of outside workers; Article 22 governs special electric/gas hot work via school fire approval. Neither article provides the missing authoritative CDUT **long-term campus gate access** procedure. The worker's outside-worker status and contractor/college affiliation must be established case by case.
changedFact: Pair A = enrolled long-term contracted construction worker works on non-hot-work installation, has one-time visitor QR and valid construction contract. Pair B = same worker/site/day with planned gas welding instead of non-hot-work installation; no campus fire office permission has been recorded.
expectedDecision: A => contract and QR do not independently establish long-term campus entry entitlement; keep T02/N18 routing U and separate school/construction fire responsibility. Do not demand a welding permit for activity known not to involve such hot work. B => campus long-term entry still U, but applicable Article 22 hot-work authority is distinct and must remain pending before welding even if contract and gate QR exist; trained/credentialed worker alone cannot waive school fire approval.
admissibleAlternatives: Actual employer/campus security-recognized long-term external worker roster or valid gate credential if accepted; school fire-approved electronic permit if actually issued; ordinary classroom activity outside special hot-work scope requires distinct policy analysis, not blanket rejection.
evidenceAnchors: Authorized employer/contractor scope, school affiliated employing unit, campus gate/time permission from competent source, site and scope, welding operation plan, operator qualification, fire approval/inspection record if applicable.
failureMode: Visitor credential auto-promoted to permanent access; completed construction contract auto-promoted to hot-work approval; no-welding case mistaken for needing hot-work license.
confidence: High for the different statutory fire responsibilities; LOW / POLICY_PENDING for CDUT 2026 N18 access, employer sponsorship evidence and exact role.
unresolved: Whether N18 is temporary visitor subtype, separate long-term registered channel, or hybrid linked duties; authority and form not supplied. DO NOT force a template split or enforce a rejection yet.
researchCrosscheck: Cross-template purpose differs by subject, action and issuing authority. Actual C/D behavior beyond previously published source review = NOT_TESTED.

## S-CASE-01: closed synthetic routing example (not a real university rule)

dutyId: SIM-CAMPUS-R03-ACCESS-01.
sourceLocator: Closed invented rule SIM-CAMPUS-R03-v1 **written only for this test**: guest pass permits one visit of at most 24h; employees of contracted vendors stationed >= 30 days request employer-linked long-term badge; hot-work requires an independent, active facilities-fire permit.
applicability: The invented school SIM-CAMPUS-R03 only. **Not CDUT.**
changedFact: Same vendor technician changes from a 4h guest visit without hot-work to a 60-day vendor stationing with welding.
expectedDecision: First case -> under synthetic guest-pass channel; second -> synthetic long-term badge routing AND distinct fire permission; neither channel alone grants the other.
admissibleAlternatives: School simulation explicitly accepts administrative authorization records or signed approved digital system tokens.
evidenceAnchors: Synthetic policy version, badge duration, task scope, authorizing role.
failureMode: Duration and task activity collapsed into one identity entitlement.
confidence: High strictly within the closed fictional rule.
unresolved: No real-world implications; do not write SIM duration as CDUT requirement.

## Bounded U questions, not mandatory rejects

- U-01 N18 long-term external construction worker identity, sponsoring unit, residence period and **who controls campus gate/door access** in 2026; source-owner: Security + project/construction unit.
- U-02 2026 CDUT local event safety/Article 15 on-site inspection form, campus 'large event' classification and actual delegated decision maker; source-owner: competent school fire/security unit.
- U-03 Whether T05 has a separate compulsory one-off permission for every high temperature / overnight experiment, and exactly when; source-owner: lab safety office.
- U-04 T07 current authorized hot-work form, exact issuing post, duration, emergency pathway, general-teaching welding applicability; source-owner: school fire unit.
- U-05 T01 room-door operation permission and executable access update authorization scope; source-owner: asset/physical security operator.

Each U is a question with a concrete authority, not a current CDUT hard deny rule. Authorized clarifying sources can convert appropriate U portions to F through a newly blinded E1.

## New clean-room E1 handoff (do not provide this document to the blind reviewer)

Give the clean-room reviewer ONLY fixed A/B official source indexes and the original links to the full Order 28 regulation (articles 15/17/23), Order 505 and any competent 2026 CDUT original official issue documents. Ask them to register applicability, affected action/person, time/phase, responsible authority, permitted decision and unknowns, then freeze signed source notes and hashes. **Do not show them C or D comparisons, these hypothesis labels or Gold problems before their freeze.** Only after their independent lock compare new F to this research and C, never by retroactively calling the research blind.
