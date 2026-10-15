# G07 r03 | Pre-C semantic challenge lock

Status: `RESEARCH_PRE_C_LOCK` (not E1 PASS; no D Gold opened). Created after verified immutable source lock `2287c74b3f7b979bd4cc7f8e21c5e36f31efe058`, after reading prior E0-only audit, **before reading any G07 C business rule body**.

Selection from the pre-existing independent H=38, not selected by C/D results. Only these five independent duty IDs will be treated as the registered targeted static crosscheck.

| Challenge | Pre-existing dutyId | Source locator | Changed fact | Expected limited pre-review distinction | Status/boundary |
|---|---|---|---|---|---|
| Q1 | G07-T02-02 | [O01] 2025 CDUT 财务事项清单 PDF page 5 (0-based page 4), row 6 科研差旅住宿项④(3) | No hotel bill with **project leader signed explanation and college approval**, versus no bill AND no approved explanation | First has a possible documented alternative and must not be automatically denied for absent invoice; second needs evidence/approval. Neither is a final payment authorization | F that 2025 guide lists alternative; U for exact 2026 continued applicability/new 2025 domestic travel regulation |
| Q2 | G07-T03-05 | [O01] 2025 PDF p5/p7 invoice/acceptance; [O05] 2026 procurement planning official notice summary; [O02] 2023 acceptance regulation | Pre-procurement needs assessment without vendor invoice, versus final-contract payment request without contractually required acceptance | Pre-procurement may lack post-performance documents; final settlement must analyze stage-specific evidence | S conditional on actual purchase route and signed contract; latest self-procurement details U |
| Q3 | G07-T04-04 | [O01] 2025 PDF p6 (0-based 5) row 9 materials, contract condition: scientific project single/serial invoice **>20000**, non-scientific **>10000**; separately row 21 testing fee has own trigger text | Two scientifically financed materials invoices 12k + 11k with consecutive invoice numbering, versus two unrelated invoices same amounts; compare materials vs service | Apply `serial_or_single_invoice` aggregation only in its 2025 stated materials context; avoid one per-invoice test or blindly copy material threshold to other service/2026 procurement authorization | F the 2025 document explicitly mentions serial invoices; current 2026 effective contract rules U |
| Q4 | G07-T05-03 | [O07] 2026-01-15 CDUT approval-person-selection notice search text; [O01] 2025 PDF p10 row 19 for stipend/student/expert distinctions | Project controller is a payee with actual independent leadership countersignature, versus controller self-sign only | Must separately track payee, controller, approving leader; absence of verified independent approval is a pending authority issue, not machine-approved | S until complete current official procedure and authentic signature workflow verified |
| Q5 | G07-T07-03 | [O01] 2025 PDF p16 (0-based 15) item 32(3) cash loan return: bank remittance evidence **followed by** smart reimbursement cash-return offset step; [O03] 2026 opening switch | Applicant uploads remittance screenshot, versus finance-issued matched receipt and posted loan offset | Screenshot can support submission, not establish cleared liability; only accounting posting supports ‘settled’. Loan identifier and debtor are distinct from operator | F evidence that administrative cash-return workflow has two steps in 2025; U current live accounting state/access |

### Independent failure hypotheses

- H-Q1: C's required lodging evidence assumes invoice always required and ignores alternative or turns approved explanation into full payment approval.
- H-Q2: C conflates advance procurement authorization and delivery/settlement, asking for nonexistent future acceptance/invoice, or treating procurement planning evidence as final acceptance.
- H-Q3: C loses consecutive-invoice grouping, hardcodes contract amounts by individual invoice, or uses 2025 materials fees threshold as a universal 2026 procurement rule.
- H-Q4: C conflates applicant/payee/project supervisor and allows self-approval (or conversely applies one self-pay restriction to unrelated payees).
- H-Q5: C treats uploaded bank transfer screenshot as confirmed financial loan offset, failing reconciliation.

**Evaluation labels:** `SUPPORTED` only if frozen C rule genuinely represents scenario and applicability; `SEMANTIC_GAP` with exact quote if demonstrably absent/misleading in scope; `INDETERMINATE` if C delegates/unknown current school rule. Not a D failure without valid Gold review. No private or hidden D material will be accessed.
