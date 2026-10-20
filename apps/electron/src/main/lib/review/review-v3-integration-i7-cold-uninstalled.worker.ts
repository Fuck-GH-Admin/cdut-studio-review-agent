/**
 * I7 independent cold OS PID: an offline C reader cannot recover a live
 * Electron Main principal/owner/native picker from disk or old UI previews.
 * No C R10 runtime is imported; this is a deliberate NOT-INSTALLED negative.
 */
import {
  CMainB20TrustedCandidateRead,
} from './review-v3-main-b20-trusted-candidate-read'
let readCount=0
const reader=new CMainB20TrustedCandidateRead({
  currentIdentity:()=>undefined,
  currentInstallationToken:()=>undefined,
  canRead:()=>false,
  getPinnedExpectation:()=>undefined,
  readCurrentBundle:()=>{readCount++;return {}},
})
let denied=''
try {
  await reader.read('I7candidate')
} catch(e) { denied=(e as Error).message }
if(denied!=='C_MAIN_B20_MAIN_INSTALLATION_MISSING' &&
   denied!=='C_MAIN_B20_MAIN_IDENTITY_NOT_INSTALLED') {
  throw Error('I7_COLD_PRINCIPAL_UNEXPECTED:'+denied)
}
if(readCount!==0)throw Error('I7_COLD_B20_READ_BEFORE_CURRENT_MAIN')
console.log('I7_COLD_NO_MAIN '+JSON.stringify({
  pid:process.pid,independentMainInstalled:false,schoolPublished:false,
  runAck:false,denied,
}))