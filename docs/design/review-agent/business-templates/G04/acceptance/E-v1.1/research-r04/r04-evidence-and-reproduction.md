# G04 E research r04 — evidence, duty crosswalk, reproducibility

Scope: external law read + **frozen public-side C static review only**. Not Gold, not Pi, not D4; do not infer an executed system response.

## Fixed inputs / provenance

1. Git parent commit: `7cb692851f00efc6196e84e080b8e40e7017e7b1` (2026-10-16 r03 research branch); repository `Fuck-GH-Admin/cdut-studio-review-agent`.
2. C Library asset name: `G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md`, exact **SHA-256 `d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2`**, 186090 bytes / 1087 text lines, independently computed from accessible Library original. Matching prior r02 final-manifest T06C.newMasterSHA256. C original production Git SHA not available; do not substitute this research branch's SHA.
3. Order 28 official Article 15 ministry HTML: https://www.moe.gov.cn/jyb_xxgk/xxgk/zhengce/guizhang/202112/t20211206_585092.html . Official cross-check https://www.119.gov.cn/gk/flfg/bmgz/2022/1031.shtml ; retrieved for r04 on 2026-10-16. External page bytes **not separately frozen/hash-locked**, so locator + published article are the source anchor, not a fabricated source lock.
4. State Council Order 505 Article 2 and Articles 11–13: https://xzfg.moj.gov.cn/front/law/detail?LawID=204 ; only for separate public-police-permit applicability.
5. Inherited read-only r03/official E-v1.0 research documents in `docs/design/review-agent/business-templates/G04/acceptance/`; previous Gold, source-lock and issue statuses are not edited.

## Article 15 atom-to-C crosswalk (F scope; author C design, NOT verified CDUT deployed workflow)

| Source statutory duty (Art.15) | Static frozen C anchor (1-based lines) | Observation | Consequence / unresolved |
|---|---|---|---|
| Organizer appoints dedicated fire safety lead; establishes and performs duties | `Organizer`, `SafetyLead` lines 45,50; F-25 line 151; R-19 lines 498–506 | PARTIAL: responsible person / safety plan modeled; *specific fire-safety assignment and exercise of duty* not separately enumerated | Add independent trace anchor or show formal equivalence; do not require new separate form without local evidence |
| Fire facilities and equipment present, intact and effective | MS-22 line 227; R-27 lines 586–594 | PARTIAL: generic venue '消防条件', expert check, not itemized fire equipment effectiveness | Specialist-owned evidence criteria, not AI technical certification |
| Evacuation routes, exits, wayfinding, emergency lights and fire lanes conform | F-36 line 162, MS-11 line 216, R-27 line 588 | PARTIAL: exit/route/layout present; no explicit signage, emergency light, fire lane condition | Avoid treating mere route diagram as full compliance |
| Extinguishing and emergency evacuation plan formulated | F-31 line 157, MS-05 line 210, R-20 lines 509–517 | RELATED ELEMENT PRESENT: emergency/fire response plan, accepts combined evidence | Confirm extinguishing component in an applicable plan |
| **Organize drill** | C searched across all 1087 lines: `演练` only once at bibliography line 1006; not a C rule/field | **NO OPERATIVE TRACE FOUND** | Source-stage requirement must be separated from 'plan attached'; no blanket initial-material rejection |
| **School fire organization passes onsite inspection before event** | F-50 line 176, MS-25 line 230, R-27 lines 586–594; ST-10 line 842; ST-14 line 846; aggregator lines 879–888 | PARTIAL_GENERIC: onsite review exists, but R-27 condition `有安保安全评估/整改` not visibly entailed by Art.15 legal scope. MS-25 says `保卫处`, which cannot be assumed same as legally competent `学校消防机构`; ST-14 generic postapproval check, no explicit mandatory fire-PASS state | **Conditional pre-event gate mapping gap**. Competent issuer/delegation and scoped version check needed |
| Other government approval where independently legally required | AX-06 lines 66–69, R-11 lines 410–418, ST-11/12 lines 843–844 | Police permit conditional model present; Order 505 and campus fire duties separated at high level | Do not promote no-police-needed into fire-exempt; no proof all other statutory approval types solved |

Other C protective evidence **must not be omitted**: source/current-policy ambiguity ST-01/02 (lines 832–835), specialist review ST-10, non-substitution of venue approval (lines 30–38), generic check R-27, approval-state separation R-16 (465–474), and preexecution flow (956–967). These mitigate risk and **rule out the caricature that C has no fire or human review at all**.

### Concrete potential conflict

`R-27`: trigger is `有安保安全评估/整改`. **If** legal Art.15 trigger TRUE but this separate C trigger is FALSE/unknown and no other site-fire gate is mapped, that rule alone will not produce a mandatory school fire organization's inspection-PASS obligation. This is a **static logical gap**, not evidence that actual deployed implementation issues an approval.

`MS-25`: labeled `保卫处现场检查与整改复验`. An actual institutional delegation could make that the Art.15 school fire authority, but no competent CDUT source in these frozen materials proves it. The correct result is U and **verify source owner**, not pronounce approval invalid.

`R-20` recognizes plan and content reuse. It does **not** imply an actual drill was organized. Distinct official source duty is untraced. Having a plan cannot on its own discharge the drill duty.

### Minimal independent reproduction

Obtain **only the exact authorized public C asset** named above. Do not access or copy EVALUATION_ONLY, frozen Gold, private ACL or hidden case data.

```bash
sha256sum G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md
wc -lc G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md
grep -nE 'R-27｜|MS-25|F-50|ST-10|ST-14|R-20｜|R-19｜|R-11｜' G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md
grep -nE '演练|消防机构|现场检查合格|疏散指示|应急照明|消防车通道' G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md
```

R04 reproducibility method: independent full-text search **and** contextual examination of section 4 axes, section 6 fields/MS, section 9 R-16/19/20/27, section 10 statuses and aggregation, section 11 pre-event lifecycle, so keyword-zero was not treated as definitive absence of semantics.

## Evidence truth labels

- **OBSERVED:** verified frozen raw SHA, matching r02 ledger; specific cited C lines; source Article 15 legal text at source URL; missing explicit statutory-issuer/organized-drill representation in reviewed C.
- **INFERRED:** a later conversion/runtime might omit the required independent pre-event fire check if it translates only the currently stated generic conditional R-27. This has **not** been executed; mark conditional risk only.
- **F:** the statutory duties in Art.15, only for in-scope activities. **S:** no synthetic campus law substituted. **U:** 2026 school 'large event' determination, competent school fire org identity, records/delegation and actual node mapping.
- **Gold historical T05 S1→S2:** `NOT_RUN_ACL`; no private object/version, allowed/denied access audit or semantic diff. No fake 26-case result. Per r03 `gold-lineage-protocol.md`, storage admin and old D remain responsible.

## Stage status

`R04_C_STATIC=SOURCE_DUTY_CROSSWALK_COMPLETED`; `NEW_FORMAL_E1_LOCK=NO`; `E2_GOLD=NOT_RUN_ACL`; `D4=NOT_RUN`; `PI=NOT_RUN`; `END_TO_END=NOT_RUN`; `CDUT_ADMIN_AUTHORITY=NOT_VERIFIED`. Official r01/r02 release gate remains `BLOCKED_INPUT + BLOCKED_SOURCE`.
