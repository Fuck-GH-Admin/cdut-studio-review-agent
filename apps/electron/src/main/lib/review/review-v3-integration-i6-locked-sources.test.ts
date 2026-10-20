/**
 * I6 ONLY. Verifies the actual bytes of C-signed I5 production+test parents
 * without installing a Main grant or importing future A/B/C sources.
 * A Git blob SHA is computed over "blob <len>\0<bytes>", NOT file sha256.
 */
import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const at=(name:string)=>fileURLToPath(new URL('./'+name,import.meta.url))
const pinned: ReadonlyArray<readonly [string,string]> = [
  ['review-template-author-store-v3-b1.ts', '065251ca843c51e68e225dc688bb7a8caab2fea7'],
  ['review-template-plan-adapter-v3-b1.ts', '974f0b0d127301ed71ad10df5ae64623ce378882'],
  ['review-intake-adapter-v3-b2.ts', 'e911663006cb105aad382a6a107630534e014739'],
  ['review-source-version-adapter-v3-b2.ts', 'b2101be80e3dce561f6365c3378b2930245dda73'],
  ['review-import-checkpoint-v3-b2.ts', '35b4d9e757b5b1530c7ca0407c405e8513b5caf7'],
  ['review-import-ledger-v3-b2.ts', '273b8ea71ed739f01238c5bcf1f57be7a39a6502'],
  ['review-zip-staging-v3-b2.ts', '38d87196e49b73c62b6019ff2b1dceac3f02b175'],
  ['review-zip-intake-v3-b2.ts', '2289f2fb2ca395fb81d93270e3d33116359993c4'],
  ['review-import-handoff-v3-b2.ts', 'b1a8e05ffb49cf26888b5252700eb508cca4e3b4'],
  ['review-v3-b1-b2-candidate-source-bridge.ts', 'e322df7ddc0910f5065d7a887507218cac7a7713'],
  ['review-v3-b1-b2-main-read-bundle-v3-b.ts', '2ff051fc5d18a2c0ef9465188a3611a71a0989ee'],
  ['review-v3-main-b20-trusted-candidate-read.ts', 'd0e6ea271e0b20474060131f1f29a74b876463c3'],
  ['review-v3-main-author-revision-read.ts', 'ba80feb8d29844376c22e7422cde5ff33792b94f'],
  ['review-v3-native-pi-crosspid-r19.worker.ts', 'ffbb803a7e93e47488bcb7e97f0537258ff76f04'],
  ['review-v3-native-pi-crosspid-r19.test.ts', '7855139e7bdf367f8ed023483c8905a59903ca27'],
  ['review-v3-sdk-diskfault-r19.test.ts', '094698f65a93b47a5fa5cba5080132ea5e733547'],
  ['review-v3-native-pi-revoke-r19.test.ts', '27f9d589b37f7560bc1945b5ba2a303f746436e3'],
  ['review-v3-main-host-receipt-registry.ts', 'bba17b3c3e01ebf0be643bf00fbf1284028f1e7f'],
  ['review-v3-run-writer.ts', 'e48506faf30c17b0e3071a692becd7a5f2fb9e5b'],
  ['review-v3-technical-ledger.ts', 'a0ed06a05775674143f584b140b1cb36d490a6f2'],
  ['plan-binding-v3.ts', '8a252806f9d470b4abc3b9896f58509768885f79'],
]
const sourceNotAuthorized: readonly string[] = [
  'review-v3-durable-host-fence.ts',
  'review-v3-main-native-archive-registry.ts',
  'review-v3-main-author-plan-ipc.ts',
  'review-v3-main-trusted-assembly.ts',
  'review-v3-technical-sequence-driver.ts',
  'review-v3-b3-unmatched-author-bootstrap.ts',
  'review-v3-b-candidate-readiness-workbench.ts',
]
function gitBlob(bytes:Uint8Array):string {
  const header=Buffer.from('blob '+bytes.byteLength+'\0')
  return createHash('sha1').update(header).update(bytes).digest('hex')
}
describe('I6 exact I5 source lock and no unauthorized I6 replay',()=>{
  test('I6-LOCK-01 physical Git blob bytes of '+pinned.length+' inherited modules stay at signed I5',()=>{
    for(const [name,blob] of pinned)expect(gitBlob(readFileSync(at(name)))).toBe(blob)
  })
  test('I6-LOCK-02 Git blob uses actual byte count, changed bytes never pass the signed source map',()=>{
    const [name,blob]=pinned[0]!
    const bytes=readFileSync(at(name))
    expect(gitBlob(bytes)).toBe(blob)
    expect(gitBlob(Buffer.concat([bytes,Buffer.from('\nI6 tamper probe')]))).not.toBe(blob)
    expect(gitBlob(Buffer.from(''))).not.toBe(blob)
  })
  test('I6-LOCK-03 unsigned C R09/A R21/B R29 files stay absent in I6 isolated tree',()=>{
    for(const name of sourceNotAuthorized)expect(existsSync(at(name))).toBe(false)
  })
  test('I6-LOCK-04 the source lock contains no path traversal, duplicate or authority-writer rename',()=>{
    const names=pinned.map(x=>x[0])
    expect(new Set(names).size).toBe(names.length)
    expect(names.every(n=>/^[A-Za-z][A-Za-z0-9._-]+$/.test(n))).toBe(true)
    expect(sourceNotAuthorized.every(n=>!names.includes(n))).toBe(true)
  })
})
