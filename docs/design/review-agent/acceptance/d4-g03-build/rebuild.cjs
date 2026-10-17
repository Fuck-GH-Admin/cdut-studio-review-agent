'use strict'
// Rebuild strictly from the ten Library C originals. Never write/modify inputs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto')
const sourceDir=process.argv[2],destination=process.argv[3]
if(!sourceDir||!destination){console.error('Usage: node rebuild.cjs <directory containing verified ten original C Markdown files> <out-dir>');process.exit(2)}
const catalog=require('./catalog.json').templates
const build=require('./generate.cjs')
for(const spec of catalog){
 const filename=path.join(sourceDir,spec.sourceFile)
 const raw=fs.readFileSync(filename),sha=crypto.createHash('sha256').update(raw).digest('hex')
 if(sha!==spec.sourceSha256)throw Error(spec.id+' immutable business input mismatch: '+sha)
 const d=build(raw.toString('utf8'),spec),target=path.join(destination,spec.templateId)
 fs.mkdirSync(target,{recursive:true})
 for(const k of ['workspace','selection','case','coverage','manifest'])
  fs.writeFileSync(path.join(target,k+'.json'),JSON.stringify(d[k],null,2)+'\n')
 console.log(spec.id+' sha='+sha+' numbered R='+d.coverage.originalRuleCount+' author checks='+d.manifest.checkCount)
}
// This script intentionally does not overwrite the original C files or touch hidden Gold.
