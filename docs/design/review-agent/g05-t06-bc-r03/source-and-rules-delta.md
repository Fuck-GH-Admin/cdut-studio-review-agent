# G05-T06 B/C r03｜source-and-rules-delta

**2026-10-16, author-side, new branch.** This is a research correction of material pre-review semantics, not E PASS, D hidden gold, production rollout, or issuance of meeting permission. The historic B v0.2/C v0.1 and E r01/r02/r03 archival artifacts remain unmodified.

## F｜Official source facts

1. [L01 CDUT international conference regulations 2017 Article 2](https://dice.cdut.edu.cn/info/1030/1101.htm): the three-or-more country/region historical category counts **participants without employment or appointment with CDUT or its affiliated units** (excluding HK/Macau/Taiwan). A German-national CDUT-employed professor is not necessarily a third-country external participant. **U:** applicability of this 2017 special regulation in 2026 remains unconfirmed.
2. [L02 CDUT 2025 Conference Measures Article 5(3)](https://kjc.cdut.edu.cn/__local/4/8B/F5/215698571B2D5ED2946921CC3A2_D50922B2_32715.pdf): secondary-unit-name academic conference **under 1000** → scientific/social-science functional office **filing**; secondary unit **1000 or more** → **approval**; university-name **regional/national** academic conference → same functional office **approval**, including when attendance is 900. Separately, an international conference requires foreign-affairs review/filing and then the supervising school leader's approval. These are distinct permission events.

## B → C bounded repair

- B v0.3 (from immutable v0.2): correct AX-07; add AX-13/AX-14 and F-69 (CDUT employment/appointment relation), F-70 (eligible external country set), F-71 (official organizer nominal scope), F-72 (meeting regional/national scope). Correct R-04/R-05/R-17/R-46 without renumbering other rules.
- Freeze SHA-256 for B v0.3 **before** making C edits. New B rules file SHA-256: `16797a78a07662813461c010fbb667909997664caeb813ff1652717566adc321`.
- C v0.2 (from immutable v0.1, after B freeze): narrow BR-04/BR-06, R-04/R-05/R-17/R-46, trace rows and author self-checks. Other **45 original rule sections unchanged**. New C MD SHA-256 `355824dd67da75a5d24f1f8ddf680bfefae6d46021d12398a2ea0d8a14d243c4`; old C MD `0775e73d1ce248b735fc963e93583e765d89eb4e810d27b48c1d803f784b7bcb`.
- The **complete** revised B/C files, full SHA-256 manifests, unified diffs and reproducible author-only checker are in the separately supplied local ZIP artifact. This GitHub commit records the source/rule delta; it does **not** claim that those full local files were committed to the repository.

## S｜Single-factor author counterexamples (not independent D gold)

| Case | Constant facts | Only changed fact | Source-level outcome |
|---|---|---|---|
| BC-FX-01A | In China, two clearly nonemployed Chinese and Belgian participants, plus German national | German is **CDUT employed** | 2017 qualified external-country count = 2 |
| BC-FX-01B | As above | German is **not CDUT or affiliate employed/appointed** | 2017 qualified external-country count = 3 |
| BC-FX-02A | Regional academic conference, **900** attendees | **Secondary-unit name** | 2025 functional route = **filing** |
| BC-FX-02B | Same region, scope, attendance and subject | **University name** | 2025 functional route = **approval** |

UNKNOWN appointment status must not be treated as FALSE. Unknown university/secondary-unit capacity, meeting reach, policy version or actual OA approvals remain unresolved. The 2017 historical category cannot authorize an exemption from all school meeting reviews; the professional filing path does not authorize hosting.

## U｜Remaining uncertainties

- Actual 2026 applicability of L01 and relationship with L02; authorized personnel record access; rules for university-name non-regional/non-national meetings; current OA and superior-authority approval trace; all legitimate exceptions.
- The official 2025 PDF's text was retrieved; attempted web page screenshots returned cache miss, so visual PDF inspection is not claimed.
- E v1.1 r03 is a **research trial**. The formal E v1.0 E0–E4 gates remain untouched. No author-produced result is given to D as independent truth.
