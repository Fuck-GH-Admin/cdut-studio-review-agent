# D3-10 / independent first-use Agent A

I am an independent template author, not the D3 editor developer. Pinned parent code SHA: `d16f047af653f7ba259456807c1fc150e9d0f417`; repository `Fuck-GH-Admin/cdut-studio-review-agent`; test branch `test/d3-10-agent-a-first-use`. The two author workspaces are personally assembled JSON assets derived from (but not identical to) the `d3-minimal-*` fixture schema.

Scope: single synthetic plain-document check with no shared modules, Claim graph, educational policy or approval. `workspaces/initial.json` revision 1 checks three explicitly requested headings; `workspaces/modified.json` revision 2 also checks substantive readable content beneath each heading. Existing headings and source binding are preserved.

Run on Bun 1.4.0 / Node 22 in an isolated workspace: `bun install --frozen-lockfile && bash docs/design/review-agent/acceptance/d3-10/agent-a/tests/run-acceptance.sh`. The runner creates **two fresh** `mktemp -d` config roots; never point `PROFER_CONFIG_DIR` at production. Outputs are created via the genuine D1/D2/D3 commands in `plans/`, `bundles/`, `logs/`; existing outputs are replaced by re-execution only in this independent acceptance folder. An Actions workflow under `.github/workflows/review-d3-agent-a-acceptance.yml` executes this script and attempts to commit raw evidence to this branch.

Source-of-truth warning: `tests/verify-plan.py` is an **independent structural verifier / GOLD oracle**, **not** the actual Pi document-reading engine. CLI plan compilation and synthetic document review must not be confused. See `verdict.md` and `gaps/` for exact status. No real policy or school files used.

## P2 follow-up (2026-10-11)

Revision 3 (`workspaces/granular-revision-3.json`) retains the same three-section scope but gives each independently scored duty its own Check and source binding. The test invokes real D1 save/read/diff and D2 preview, then submits three separate predeclared synthetic Pi service checks. This is **business modeling with ordinary natural-language tasks**, not new DSL or public implementation changes.

Two P2 issues remain: the initial combined Check overclaims individual coverage, and first-time authors must still write TypeScript to exercise the material + Pi service sequence. See `gaps/P2-A-001-granularity.md`, `gaps/P2-A-002-pi-test-entry.md`. The current test script under `tests/` is a **copyable interim example**, not a shipped general CLI command.

The GitHub Actions workflow now **only uploads test artifacts**, never pushes its own auto-generated evidence commit: this ensures the checked PR HEAD is the exact SHA whose CI status is displayed. Older checked-in `run-log.md` and `plans/` reflect the prior passing run; for revision 3 use the exact-head workflow artifact and CI job logs.
