/**
 * Integrator-I I7 isolated read-only source/ABI gate.
 * No C R10 / A R22 / B R32 production sources are copied or imported.
 * The source map is a reviewed four-line fixed-commit inventory, not a Main grant.
 */
import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { CMainB20TrustedCandidateRead, type CMainB20ReadIdentity } from './review-v3-main-b20-trusted-candidate-read'

type BlobSet={path:string;GitBlobI6:string;GitBlobB23:string;GitBlobC10:string}
type Replayed={path:string;I6:string|null;C_R09:string|null;C_R10:string;disposition:string}
type Delta={path:string;I6:string|null;A_R22?:string|null;B_R32?:string|null}
type MapDoc={
  fixedSHA:Record<string,string>
  counts:Record<string,number>
  alreadyIdenticalB23I6C10:BlobSet[]
  conflictedCOwned:Replayed[]
  C_R10_seven:Replayed[]
  A22_delta:Delta[]
  B32_delta:Delta[]
}
const projectRoot=fileURLToPath(new URL('../../../../../../',import.meta.url)).replace(/\/$/,'')
const mapPath=join(projectRoot,'docs/design/review-agent/acceptance/v3-integrator-i7-r01/I7-00-EXACT-R10-A22-B32-SOURCE-ABI-CLOSURE.json')
const readMap=():MapDoc=>JSON.parse(readFileSync(mapPath,'utf8')) as MapDoc
const gitBlob=(bytes:Uint8Array):string=>createHash('sha1')
  .update(Buffer.from('blob '+bytes.byteLength+'\0')).update(bytes).digest('hex')
const at=(path:string):string=>{
  const absolute=resolve(projectRoot,path)
  if(!absolute.startsWith(projectRoot+'/'))throw Error('I7_UNSAFE_PATH')
  return absolute
}
const cReader=(identity:()=>CMainB20ReadIdentity|undefined,token:()=>string|undefined,
  read:()=>Promise<unknown>|unknown,canRead:()=>boolean=()=>true)=>{
  let calls=0
  const reader=new CMainB20TrustedCandidateRead({
    currentIdentity:identity,
    currentInstallationToken:token,
    canRead:()=>canRead(),
    getPinnedExpectation:()=>({
      templateId:'I7candidate',revision:1,revisionDigest:'a'.repeat(64),
      frozenFingerprint:'b'.repeat(64),
    }),
    readCurrentBundle:async()=>{calls++;return read()},
  })
  return {reader,calls:()=>calls}
}
describe('I7 C R10 versus signed I6 immutable readonly closure',()=>{
  test('I7-LOCK-01 all 21 B R23 sources are BYTE-IDENTICAL in signed I6 and verified C R10',()=>{
    const m=readMap()
    expect(m.fixedSHA.I6).toBe('d4ea818250df93dc00084378e8ab2d8bae0fc42e')
    expect(m.fixedSHA.C10).toBe('2cb8331b8fdff43da70a894ec597820595cb4d2d')
    expect(m.alreadyIdenticalB23I6C10).toHaveLength(21)
    for(const row of m.alreadyIdenticalB23I6C10){
      expect(row.GitBlobI6).toBe(row.GitBlobB23)
      expect(row.GitBlobB23).toBe(row.GitBlobC10)
      expect(existsSync(at(row.path))).toBe(true)
      expect(gitBlob(readFileSync(at(row.path)))).toBe(row.GitBlobC10)
    }
  })
  test('I7-LOCK-02 old I6 C Host/Plan/Run/ledger blobs differ from C R10 and cannot silently win',()=>{
    const m=readMap()
    expect(m.conflictedCOwned).toHaveLength(5)
    for(const row of m.conflictedCOwned){
      expect(row.disposition).toBe('CONFLICTED_C_OWNED_KEEP_NEW_C')
      expect(row.I6).not.toBe(row.C_R10)
      expect(gitBlob(readFileSync(at(row.path)))).toBe(row.I6)
      expect(gitBlob(readFileSync(at(row.path)))).not.toBe(row.C_R10)
    }
  })
  test('I7-LOCK-03 C R10 seven physical Main/Preload/shared paths are not replayed into I7',()=>{
    const m=readMap()
    expect(m.C_R10_seven).toHaveLength(7)
    for(const row of m.C_R10_seven){
      expect(row.disposition).toBe('C_OWNED_NOT_I7_REPLAYABLE')
      if(row.I6===null)expect(existsSync(at(row.path))).toBe(false)
      else expect(gitBlob(readFileSync(at(row.path)))).toBe(row.I6)
      if(row.I6!==null)expect(row.I6).not.toBe(row.C_R10)
    }
  })
  test('I7-LOCK-04 A R22 six and B R32 seven source deltas remain compare-only',()=>{
    const m=readMap()
    expect(m.A22_delta).toHaveLength(6)
    expect(m.B32_delta).toHaveLength(7)
    for(const row of [...m.A22_delta,...m.B32_delta]){
      expect(row.path).not.toContain('..')
      if(row.I6===null)expect(existsSync(at(row.path))).toBe(false)
      else expect(gitBlob(readFileSync(at(row.path)))).toBe(row.I6)
    }
  })
  test('I7-TRUST-01 missing real Main Principal/Owner/installer denies before any B20 read',async()=>{
    const f=cReader(()=>undefined,()=> 'fixture-install',()=>({}))
    await expect(f.reader.read('I7candidate')).rejects.toThrow('MAIN_IDENTITY_NOT_INSTALLED')
    expect(f.calls()).toBe(0)
    const identity:CMainB20ReadIdentity={
      principalId:'non-real-fixture',sessionId:'session',
      windowId:'window',frameId:'frame',ownerId:'owner',
      ownerGeneration:1,authorityEpoch:'epoch',
      caseCandidateId:'case',
    }
    const uninstalled=cReader(()=>identity,()=>undefined,()=>({}))
    await expect(uninstalled.reader.read('I7candidate')).rejects.toThrow('MAIN_INSTALLATION_MISSING')
    expect(uninstalled.calls()).toBe(0)
    const revoked=cReader(()=>identity,()=> 'fixture-install',()=>({}),()=>false)
    await expect(revoked.reader.read('I7candidate')).rejects.toThrow('MAIN_ACL_REVOKED')
    expect(revoked.calls()).toBe(0)
  })
  test('I7-TRUST-02 cold Bun OS PID cannot inherit an Electron Main installation or owner',()=>{
    const worker=fileURLToPath(new URL('./review-v3-integration-i7-cold-uninstalled.worker.ts',import.meta.url))
    const child=spawnSync(process.execPath,[worker],{encoding:'utf8',timeout:20000,
      env:{...process.env,PROFER_CONFIG_DIR:join(projectRoot,'.i7-non-existent-authority')},
    })
    expect(child.error).toBeUndefined()
    if(child.status!==0)throw Error('I7 cold PID failed: '+child.stderr)
    const line=child.stdout.split('\n').find(x=>x.startsWith('I7_COLD_NO_MAIN '))
    expect(line).toBeDefined()
    const record=JSON.parse(line!.slice('I7_COLD_NO_MAIN '.length)) as {
      pid:number;independentMainInstalled:boolean;schoolPublished:boolean;runAck:boolean;denied:string
    }
    expect(record.pid).not.toBe(process.pid)
    expect(record).toMatchObject({independentMainInstalled:false,schoolPublished:false,
      runAck:false,denied:'C_MAIN_B20_MAIN_INSTALLATION_MISSING'})
  })
})