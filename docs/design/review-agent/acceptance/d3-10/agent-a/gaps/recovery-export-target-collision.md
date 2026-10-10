# A-003 — repeat-run output collision (observed, recoverable)

- Reproduction: GitHub Actions run [38090488603](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38090488603) (branch commit `828d88b0ab311068187623fdf249c99a3c9065b2`), step 15 `review-d3-library.ts export .../bundles/portable.json` exits 1 because this output already exists from earlier successful run; step 16 import likewise encounters existing target. Step 17 still previews the previously imported workspace successfully.
- Expected: D3 CLI export/import intentionally refuses overwrite; an independent runner must choose fresh output filenames or explicitly remove only its own generated targets.
- Actual: runner initially did not account for generated evidence already being checked in, so these were unexpected nonzero statuses. No production data or D3 implementation was altered.
- Recovery: before repeat run, delete only `bundles/portable.json` and `bundles/reimported-workspace.json` inside this acceptance directory; preserve and archive prior run logs. The runner now does this explicitly. A duplicate import within a run is still tested as an expected refused operation.
- Classification: **acceptance harness reuse error** / documentation usability friction; not a demonstrated D3 defect. Status pending clean re-run evidence.

Also in this run, step 20 (new independent Pi structured interface script) exited 1. Its raw stderr was in the Actions artifact, not yet tracked in Git owing to a repository ignore rule; next run will print unexpected stderr to job logs and force-stage raw stderr/stdout.
