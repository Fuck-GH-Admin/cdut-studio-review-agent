import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'bun:test'
import { createFileOwnerPersistence } from './review-pi-owner-adapter'

const adapterUri = pathToFileURL(fileURLToPath(new URL('./review-pi-owner-adapter.ts', import.meta.url))).href

describe('V3 A4 real two-OS-PID durable write fencing (no business Run)', () => {
  it('A-FAIL-02: child PID CAS wins, stale parent PID cannot overwrite', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-crosspid-'))
    try {
      const file = join(dir, 'owner-cas.json')
      const store = createFileOwnerPersistence(file)
      store.write('old-snapshot')
      const code = [
        `import { createFileOwnerPersistence } from ${JSON.stringify(adapterUri)};`,
        `const s = createFileOwnerPersistence(${JSON.stringify(file)});`,
        `if (s.read() !== 'old-snapshot') process.exit(11);`,
        `s.compareAndWrite?.('old-snapshot', 'child-committed');`,
        `if (s.read() !== 'child-committed') process.exit(12);`,
      ].join('\n')
      const subprocess = spawnSync(process.execPath, ['-e', code], {
        encoding: 'utf8', timeout: 20_000,
      })
      expect(subprocess.error).toBeUndefined()
      expect(subprocess.status).toBe(0)
      expect(readFileSync(file, 'utf8')).toBe('child-committed')
      expect(() => store.compareAndWrite?.('old-snapshot', 'stale-parent')).toThrow()
      expect(readFileSync(file, 'utf8')).toBe('child-committed')
      expect(store.compareAndWrite).toBeTypeOf('function')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('A-FAIL-02: second PID cannot claim a live file lock even with correct snapshot', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-lockpid-'))
    try {
      const file = join(dir, 'owner-cas.json')
      const store = createFileOwnerPersistence(file)
      store.write('initial')
      const code = [
        `import { openSync, closeSync } from 'node:fs';`,
        `const fd = openSync(${JSON.stringify(file + '.write-lock')}, 'wx');`,
        `closeSync(fd);`,
      ].join('\n')
      const child = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', timeout: 20_000 })
      expect(child.error).toBeUndefined()
      expect(child.status).toBe(0)
      expect(() => store.compareAndWrite?.('initial', 'blocked-by-lock')).toThrow()
      expect(readFileSync(file, 'utf8')).toBe('initial')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
