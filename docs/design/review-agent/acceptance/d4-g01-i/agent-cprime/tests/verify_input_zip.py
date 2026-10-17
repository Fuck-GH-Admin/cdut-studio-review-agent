#!/usr/bin/env python3
"""Agent C C0: verify *input* r02 only. No Gold access or runtime claims."""
import hashlib,json,sys,zipfile
EXPECTED='33ad9e1fe5104cae91463218293ae58ccd27c934ff091b0687b20c64d699b26c'
BASE='d4-g01-i-test-input/'
def h(raw):return hashlib.sha256(raw).hexdigest()
def validate(path):
    raw=open(path,'rb').read();errs=[];z=zipfile.ZipFile(path);names=set(z.namelist())
    if h(raw)!=EXPECTED:errs.append('SHA_MISMATCH')
    if z.testzip():errs.append('CRC_FAIL')
    if len(names)!=len(z.namelist()):errs.append('ZIP_DUPLICATE_NAMES')
    def get(path):
        n=BASE+path
        if n not in names:errs.append('MISSING:'+path);return b''
        return z.read(n)
    manifest=json.loads(get('manifest.json'))
    idx=json.loads(get('material-index.json'))
    if len(names)!=120 or len(manifest['cases'])!=28 or manifest['containsGold']:errs.append('COUNT_OR_GOLD_MARKER')
    if len(manifest['files'])!=119:errs.append('MANIFEST_COUNT')
    for record in manifest['files']:
        data=get(record['path'])
        if h(data)!=record['sha256'] or len(data)!=record['size']:errs.append('FILE_CHECK:'+record['path'])
    for record in idx['items']:
        if h(get(record['path']))!=record['sha256']:errs.append('MATERIAL_CHECK:'+record['path'])
    ids=[]
    for ref in manifest['cases']:
        case=json.loads(get(ref['casePath']))
        fixture=json.loads(get(ref['fixture']))
        ids.append(case['caseId'])
        if case['caseId']!=ref['caseId'] or fixture['caseId']!=case['caseId'] or not fixture.get('testOnly'):errs.append('CASE_FIXTURE:'+ref['caseId'])
        for f in case['inputFiles']:get(f)
        for evidence in case['evidenceRefs']:
            if evidence['materialPath'] not in case['inputFiles']:errs.append('UNREGISTERED_EVIDENCE:'+ref['caseId'])
    if len(set(ids))!=28 or len(idx['items'])!=59:errs.append('CASE_OR_MATERIAL_COUNT')
    return {'inputSha256':h(raw),'zipMembers':len(names),'cases':len(ids),'manifestChecked':len(manifest['files']),'materialsChecked':len(idx['items']),'errors':errs,'phase':'C0_NO_GOLD','productRuntime':'NOT_RUN'}
if __name__=='__main__':
    if len(sys.argv)!=2:sys.exit('Usage: verify_input_zip.py INPUT.zip')
    r=validate(sys.argv[1]);print(json.dumps(r,ensure_ascii=False,indent=2));sys.exit(1 if r['errors'] else 0)
