# Dev-C C-Tx-R01 — Cross-PID CaseAggregate CAS, durable Receipt, crash fencing

**C-only session technical evidence; A/B/I read only the single common #145 ABCI protocol.** This file does not authorize I modifications to case-store-v2, new Main IPC/Preload nor production releases.

## Fixed source & signed cross-line gates

- C #144 prior signed R05 `8273ff4669d4fe55065584b14513557468beecb8`: 5/5 Gate O, Bun 4107 pass/5 skip/0 fail. R04 `b51e5f...` 5/5 signed before R05.
- I #150 Stage 1 `36dd1c37bc18d7614d8d4835b5213d5cb6459792`, C formal `C-I3-FINAL-ENG-ACCEPT-R01 / C_ACCEPTED_FOR_ENGINEERING_I3=YES_EXACT_SHA_SCOPED`, 34/34 exact source blobs, C0 +167 byte-preserving lease, PR CI 4211 pass/5 skip/0 fail. Not imported into C branch. I Stage 2 tech-only and no production lease.
- B #142 R14 source `4330e9f749771925f018e49ac3f5df7b09c00da3` 3/3 Gate O and C scoped `B-CR-002-A/B/C` decisions, not live Main channel authorization.
- Signatures published solely in #145 `DECISIONS:C`, decision commit `84a7ce838aea2a454827f57d1edf2fa38f35274f`. These permissions are not superseded by this document.

## Why a real engineering change is needed

Before R01, `case-store-v2.ts` used a `Map<caseId, Promise>` queue, strong only **inside one JS process**. Two Electron Main PIDs can both read revision N, validate N and each atomically rename their separate `state.v2.json.tmp`, silently overwriting one successful durable command/receipt. Atomic rename prevents torn bytes; **it does not serialize multi-PID CAS**.

## Actual C-owned engineering

- `review-v3-case-disk-tx.ts`: per-case OS-visible exclusive `mkdir('.state.v2.tx.lock')` ownership, unique UUID token and fsynced owner metadata, async wait for another PID, AsyncLocalStorage scoped ownership and token revalidation. No wall-clock timeout may permit automatic stealing; a paused PID and PID reuse must fail closed.
- `case-store-v2.ts` narrow modification: existing `enqueueCase` now serializes command and creation inside the exact OS directory lease; existing public `writeAggregate` direct migration/fixture path uses the SAME lease (synchronously refuses if another PID holds it). Existing `submitCommand` logic retains current revision CAS, requestId+payload hash idempotency, receipt append and mutation in one state file; no second Plan/Case store and no new IPC.
- Durable state write: write complete UTF-8 JSON to exclusive unique temp fd, `fsync(fd)`, reassert same lock token, rename over `state.v2.json`, then `fsync` case directory on POSIX. Windows lacks portable directory fsync; full power-loss durability on Windows not proven by the Linux Gate O. On failure after rename, caller must reread durable Receipt before retry, never optimistically issue a new requestId.
- `recoverC2AbandonedCaseDiskLock`: **offline Main maintenance-only** action, no IPC; takes independent caller authorization for exact persisted owner, serializes recoverers using separate recovery lock, checks PID liveness via `kill(pid,0)`; only provably dead `ESRCH` PID can have lock removed. PID reuse, live/uninspectable PID and missing/truncated owner refuse. Recovery never reconstructs Host evidence, never publishes a Plan, never creates a school decision. Admin permission is external and must be truly authenticated at future Gate E.
- `review-v3-case-disk-tx.test.ts`: in-process two CAS writes exactly one success, one `VERSION_CONFLICT` and one Receipt; duplicate idempotent; real Bun **independent child PID** holds lock and parent direct writer blocked, parent command waits then commits; child crash leaves fence and requires explicit offline owner recovery; live same-PID lock cannot be stolen.

### Safety caveats to keep visible

- File path is local filesystem, not distributed DB: SMB/NFS/faulty mounts, PID namespaces/shared directories across different hosts are not claimed safe. No ephemeral distributed lease or auto-lock eviction. Older versions of the app writing without this new fence remain unsafe if run side-by-side.
- Crash between mkdir and fsynced owner metadata leaves orphan lock with unknown owner, intentionally requires offline forensic recovery.
- All standard source writes use new fence; any external non-C native filesystem mutation bypassing `case-store-v2` must be blocked by Main permissions. This alone is not real provider Host physical receipt authentication.
- A true power-cut/fsync durability fault matrix and Windows-specific storage tests belong Gate E, not synthetic Bun Gate O.
- Production IPC is unchanged. I Main lease `CONDITIONAL_NOT_ACTIVE`, Business writer `DENIED`, all C files C-only. No source drift into signed I3 #150.

## Exact engineering Gate

Current engineering R01 checkpoint **`6febe8698e932e34a0137bf3d2eb04748a70ce7b`**. New same-SHA GitHub Actions triggered: PR CI `39311898390`, Baseline `39311898382`, Batch `39311898453`, D1 `39311898303`, D2 `39311898284`. **As authored, pending/queued; do not sign PASS until real same-SHA jobs/logs and child-PID tests are successful.**

If a real TypeScript/Bun/child-PID Gate O error occurs, preserve exact first fail, fix only C-owned files, and rerun 5 workflows at the next immutable SHA. Scope of final possible sign-off is `C_TX_R01_GATE_O=PASS_EXACT_SHA_LOCAL_FS_TECH_ONLY`, never Gate E/L/P.

School L BLOCKED_NO_AUTH; Electron/Provider E NOT_RUN; Product P NOT_RUN; Release NO_GO.

## First real Gate O fail and repair (immutable evidence)

Original C-Tx code SHA `6febe8698e932e34a0137bf3d2eb04748a70ce7b`: D2 `39311898284`, job `118263343910` **FAILED TypeScript** before any new Bun child-process tests: `review-v3-case-disk-tx.ts` lines 171,174,180 `TS2345/TS18048` because potentially absent owner wasn't narrowed by throw-only `refuse`. Not a permission or application logic PASS; do not inherit earlier R05 tests.

C-only narrow correction **`c78fec4369e6a893e4a0c89eca48657ea16b17b0`** explicitly returns `refuse('missing or invalid lock owner; inspect offline before changing')` before any maintenance authorization, PID check or filesystem unlock. If unknown Owner, fail closed as designed; no branch may treat missing owner as authorized. New exact-SHA GitHub Actions: PR `39312568970`, Baseline `39312568963`, Batch `39312569050`, D1 `39312568919`, D2 `39312568879` triggered but pending at creation. **C-Tx Gate O not signed until actual green CI and all child-PID tests.**

## C-Tx R01 exact-SHA Gate O SIGNED — 2026-10-20

After real D2 TypeScript first fail `6febe869...` at job `118263343910` (optional orphan Owner TS2345/TS18048), C repaired the fail-closed branch using `return refuse(...)` and froze production SHA **`c78fec4369e6a893e4a0c89eca48657ea16b17b0`**. No source/hook/trust check relaxed.

Independent GitHub Actions at **the same final SHA**:
- PR CI `39312568970`, job `118265833081`: **completed/success**, TypeScript, boundaries, skin, Main/Preload/Renderer build all green, full Bun **4111 pass/5 OS skip/0 fail (4116 tests across 474 files)**. Raw CI logs show all **4/4** `C-Tx R01 same-Case durable multi-PID CAS fence` cases `(pass)`, including real independent Bun PID lock contention 536ms and child PID crash/authorized owner recovery 73ms.
- Review Baseline `39312568963`: SUCCESS.
- Review batch focused `39312569050`: SUCCESS.
- D1 Authoring `39312568919`: SUCCESS.
- D2 Scoped Pi `39312568879`: SUCCESS.

**C formally signs `C_TX_R01_GATE_O=PASS_EXACT_SHA_LOCAL_FILESYSTEM_TECHNICAL_ONLY`.** This is cross-PID **local FS** proof for controlled Case command/receipt transaction paths; it is NOT a production cross-machine/network drive/power-loss guarantee, not a real Electron Gate E on macOS/Windows, not automatic stale-lock recovery, not B-school policy publication or C2 business decision approval. E NOT_RUN, L BLOCKED_NO_AUTH, P NOT_RUN, Release NO_GO. I3 #150 frozen source remains C R03, and no I C production write lease is granted.
