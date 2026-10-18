# Reproduction commands

Run from a clean worktree checked out at PR #109 HEAD `4dce31f4792a188e969c0bdbedd844620a82aaf6`.

```sh
bun install --frozen-lockfile
mkdir -p /tmp/cdut-d4-p1c-empty-config
python3 audit/d4-p1c-gui-r01/evidence/fixtures/make-fixtures.py /tmp/cdut-d4-p1c-fixtures
```

In terminal 1, keep the virtual display alive:

```sh
Xvfb :112 -screen 0 1600x1000x24 -nolisten tcp
```

In terminal 2, start the real Electron client with a fresh isolated profile and no model configuration:

```sh
DISPLAY=:112 D4_CDP_PORT=9241 bun run scripts/review-d4-product-loop.ts \
  --model-config /tmp/cdut-d4-p1c-empty-config --no-sandbox
```

The Electron window must be operated through its visible UI. Use the OS GTK picker to authorize files. The CDP helper in `cdp-driver.mjs` sends mouse/keyboard input to visible controls and captures screenshots. `double-click` was used for the C-10 rapid submit check. Do not call `createCase`, `stageD4Intake`, or any other write IPC directly.

Only read-only Main IPC methods were used for case verification: `listCases`, `getCase`, `getAggregateV2`, and `listRunsV2`. Readback scripts are under `readback/`.

The picker route used in the captured run was: click “Other Locations” → “Computer” → open `/tmp` → search for `cdut-d4-p1c-fixtures` → open the synthetic fixture folder → select the displayed fixture(s) → click “Open”. Native screenshots mask the host-volume sidebar while retaining the synthetic file list and selection.
