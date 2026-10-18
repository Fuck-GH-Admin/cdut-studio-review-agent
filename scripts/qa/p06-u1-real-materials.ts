/** 本轮合法合成 Office/PDF 夹具与真实解析；不连接模型、不更改共享解析实现。 */
import JSZip from 'jszip'
import XLSX from 'xlsx'
import PptxGenJS from 'pptxgenjs'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { executeParseDocumentTool } from '../../apps/electron/src/main/lib/document-parse-tools'
import { parseFileIntoSourceDocument } from '../../apps/electron/src/main/lib/review/document-service'

const root = resolve(process.env.QA_MATERIAL_ROOT ?? '')
if (!process.env.QA_MATERIAL_ROOT || !root.includes('local-u1-raw-')) throw Error('必须使用本轮独立材料目录')
mkdirSync(root, { recursive: true })
const hash = (b: Buffer) => createHash('sha256').update(b).digest('hex')
const mode = process.argv[2] ?? 'generate'
const out = (name: string, data: unknown) => writeFileSync(join(root, name), JSON.stringify(data, null, 2) + '\n')
async function docx(path: string, marker: string) {
  const z = new JSZip()
  z.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
  z.file('_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
  z.file('word/document.xml', `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${marker} paragraph one</w:t></w:r></w:p><w:p><w:r><w:t>${marker} paragraph two budget 100</w:t></w:r></w:p><w:tbl><w:tblPr/><w:tblGrid><w:gridCol w:w="3000"/><w:gridCol w:w="3000"/></w:tblGrid><w:tr><w:tc><w:p><w:r><w:t>Item</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${marker} table 100</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:sectPr/></w:body></w:document>`)
  writeFileSync(path, await z.generateAsync({ type: 'nodebuffer' }))
}
function textPdf(path: string, text: string, y = 740) {
  const stream = `BT /F1 18 Tf 40 ${y} Td (${text}) Tj ET`
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]
  let s = '%PDF-1.4\n', offsets = [0]
  for (let i=0;i<objects.length;i++) { offsets.push(Buffer.byteLength(s)); s += `${i+1} 0 obj\n${objects[i]}\nendobj\n` }
  const xref = Buffer.byteLength(s)
  s += `xref\n0 6\n0000000000 65535 f \n` + offsets.slice(1).map(o => `${String(o).padStart(10,'0')} 00000 n \n`).join('') + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  writeFileSync(path,s)
}
if (mode === 'generate') {
  for (const label of ['A','B']) {
    const dir = join(root,label); mkdirSync(dir,{recursive:true})
    const marker = 'P06_U1_SYNTHETIC_' + label
    await docx(join(dir,'proof.docx'), marker)
    const wb = XLSX.utils.book_new()
    for (const sheet of ['Budget','Details']) XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([[marker,sheet],['budget',label==='A'?100:120],['item','reading']]),sheet)
    writeFileSync(join(dir,'proof.xlsx'), XLSX.write(wb,{type:'buffer',bookType:'xlsx'}))
    const ppt = new PptxGenJS(); ppt.author='P06_SYNTHETIC'; ppt.subject='隔离验收'
    for (const page of [1,2]) ppt.addSlide().addText(`${marker} slide ${page}`,{x:1,y:1,w:7,h:1})
    await ppt.writeFile({fileName:join(dir,'proof.pptx')})
  }
  mkdirSync(join(root,'same'),{recursive:true})
  for(const ext of ['docx','xlsx','pptx']) copyFileSync(join(root,'A','proof.'+ext),join(root,'same','proof.'+ext))
  textPdf(join(root,'readable.pdf'),'P06_U1_READABLE_PDF budget 100')
  textPdf(join(root,'blank.pdf'),'')
  writeFileSync(join(root,'corrupt.pdf'),'%PDF-1.4\nP06_CORRUPT_ONLY\n')
  out('fixture-manifest.json',['A','B','same'].flatMap(d=>['docx','xlsx','pptx'].map(e=>join(d,'proof.'+e))).concat(['readable.pdf','blank.pdf','corrupt.pdf']).map(p=>({path:p,sha256:hash(readFileSync(join(root,p))),bytes:readFileSync(join(root,p)).length})))
  console.log('已创建两段含表 DOCX、双 Sheet XLSX、双页 PPTX、文字/空白/损坏 PDF')
} else if (mode.startsWith('office') || mode === 'restart') {
  const rows: unknown[]=[]
  for (const ext of ['docx','xlsx','pptx']) for (const scenario of ['different','same','reverse','cross-format','modified']) {
    const workspace=join(root,'workspaces',ext+'-'+scenario); mkdirSync(workspace,{recursive:true})
    const context={agentCwd:workspace,allowedRoots:[root]}
    let paths = scenario==='same' ? [join(root,'A','proof.'+ext),join(root,'same','proof.'+ext)] : scenario==='reverse' ? [join(root,'B','proof.'+ext),join(root,'A','proof.'+ext)] : scenario==='cross-format' ? [join(root,'A','proof.docx'),join(root,'B','proof.'+(ext==='docx'?'xlsx':ext))] : [join(root,'A','proof.'+ext),join(root,'B','proof.'+ext)]
    for (const path of paths) {
      try {
        const parsed=await executeParseDocumentTool({filePath:path},context)
        const m=parsed.materialized
        if(mode.startsWith('office')) {
          const repeated=await executeParseDocumentTool({filePath:path},context)
          rows.push({ext,scenario:'same-source-cache',input:path,revision:parsed.file.revision,repeatedRevision:repeated.file.revision,first:m,repeated:repeated.materialized})
        }
        const registryPath=join(workspace,'.context/artifacts/registry.json')
        rows.push({ext,scenario,mode,input:path,inputHash:hash(readFileSync(path)),file:parsed.file,pageCount:parsed.pageCount,cleanText:parsed.cleanText,pages:parsed.pages,materialized:m,registry:existsSync(registryPath)?JSON.parse(readFileSync(registryPath,'utf8')):null,sourceMatches:m?.sourcePath===path})
      }catch(error){rows.push({ext,scenario,mode,input:path,error:String(error)})}
    }
    if(scenario==='modified'&&mode.startsWith('office')) {
      // 同物理路径改字节，再解析；原件 hash 始终保留在 manifest。
      const mod=join(workspace,'modified.'+ext)
      const writeRevision = async (marker: string) => {
        const archive=await JSZip.loadAsync(readFileSync(join(root,'A','proof.'+ext)))
        for(const name of Object.keys(archive.files).filter(n=>n.endsWith('.xml'))) {
          const text=await archive.file(name)!.async('string')
          archive.file(name,text.replaceAll('P06_U1_SYNTHETIC_A',marker))
        }
        writeFileSync(mod,await archive.generateAsync({type:'nodebuffer'}))
      }
      await writeRevision('P06_U1_REVISION_ONE')
      const before=await executeParseDocumentTool({filePath:mod},context)
      await writeRevision('P06_U1_REVISION_TWO')
      const after=await executeParseDocumentTool({filePath:mod},context)
      rows.push({ext,scenario:'same-path-revision',before,after})
    }
  }
  out('office-'+mode+'.json',{sourceSha:process.env.QA_APPLICATION_SHA,level:'REAL_PARSER_FUNCTION',rows})
  console.log(JSON.stringify({mode,rows:rows.length,errors:rows.filter((r:any)=>r.error).length,wrongSource:rows.filter((r:any)=>r.sourceMatches===false).length,officeAcceptance:'BLOCKED_UPSTREAM_IF_COLLISION'}))
} else if (mode === 'body-pdf') {
  // 原 readable.pdf 的 y=740 进入页眉过滤边界；保留原件，另建正文对照。
  textPdf(join(root,'readable-body.pdf'),'P06_U1_READABLE_BODY_PDF budget 100',500)
  const path=join(root,'readable-body.pdf')
  const document=await parseFileIntoSourceDocument(path,basename(path),'evidence')
  const { parsePdfDocument } = await import('@profer/core/pdf-engine')
  const headerAst=await parsePdfDocument(new Uint8Array(readFileSync(join(root,'readable.pdf'))))
  out('body-pdf.json',{inputHash:hash(readFileSync(path)),document,originalHeader:{hash:hash(readFileSync(join(root,'readable.pdf'))),pages:headerAst.pages,readingOrderedBlocks:headerAst.readingOrderedBlocks}})
  if(document.parseStatus!=='parsed'||!document.blocks.some(b=>b.text.includes('P06_U1_READABLE_BODY_PDF')))throw Error('正文 PDF 没有真实文字块')
  console.log(JSON.stringify({parseStatus:document.parseStatus,blocks:document.blocks.length,headerKinds:headerAst.pages.flatMap(p=>p.blocks.map(b=>b.kind))}))
} else if (mode === 'review') {
  const rows=[]
  for(const file of ['A/proof.docx','B/proof.docx','A/proof.xlsx','A/proof.pptx','readable.pdf','scan.pdf','blank.pdf','corrupt.pdf']) {
    const path=join(root,file)
    try { rows.push({file,inputHash:hash(readFileSync(path)),document:await parseFileIntoSourceDocument(path,basename(path),'evidence')}) }
    catch(error) {rows.push({file,error:String(error)})}
  }
  out('review-parser.json',{level:'REAL_PARSER_FUNCTION',rows});console.log(JSON.stringify(rows.map((r:any)=>({file:r.file,status:r.document?.parseStatus,blocks:r.document?.blocks?.length,error:r.error}))))
} else throw Error('未知执行模式')
