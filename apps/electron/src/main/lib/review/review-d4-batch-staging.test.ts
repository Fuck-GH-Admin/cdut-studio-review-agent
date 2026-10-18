import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import { isSafeD4ZipEntry, stageD4NativeBatch } from './review-d4-batch-staging'

const root = mkdtempSync(join(tmpdir(), 'd4-w1-folder-zip-test-'))
const workspace = join(root, 'incoming')
mkdirSync(workspace)
afterAll(() => rmSync(root, { recursive: true, force: true }))
let n = 0
const destination = (): string => {
  const path = join(root, 'stage-' + String(++n))
  mkdirSync(path)
  return path
}

describe('W1 native OS picked folder, ZIP, duplicate and invalid file handling', () => {
  test('nested folder preserves original basenames and rejects unsupported/duplicate/symlink entries', async () => {
    const folder = join(workspace, 'round1')
    mkdirSync(join(folder, 'sub'), { recursive: true })
    writeFileSync(join(folder, '公共教学教室申请.md'), 'classroom example')
    writeFileSync(join(folder, 'sub', 'proof.txt'), 'different proof')
    writeFileSync(join(folder, 'sub', 'duplicate.txt'), 'classroom example')
    writeFileSync(join(folder, 'sub', 'program.exe'), 'malicious')
    writeFileSync(join(folder, 'sub', 'empty.md'), '')
    symlinkSync(join(folder, '公共教学教室申请.md'), join(folder, 'sub', 'link.md'))
    const stage = await stageD4NativeBatch([folder], destination())
    expect(stage.files.map(x => x.name).sort()).toEqual(['proof.txt', '公共教学教室申请.md'].sort())
    expect(stage.files.every(x => existsSync(x.sourcePath))).toBe(true)
    expect(stage.files.map(x => readFileSync(x.sourcePath, 'utf8')).sort()).toEqual(['classroom example','different proof'].sort())
    expect(stage.skipped).toHaveLength(4)
    expect(stage.skipped.some(x => x.reason.includes('SHA-256'))).toBe(true)
    expect(stage.skipped.some(x => x.reason.includes('符号链接'))).toBe(true)
    expect(stage.skipped.some(x => x.reason.includes('空文件'))).toBe(true)
    expect(stage.skipped.some(x => x.reason.includes('格式'))).toBe(true)
  })

  test('safe ZIP extracts nested sources while retaining origin path and recording wrong-type inputs', async () => {
    const zip = new JSZip()
    zip.file('folder/教室借用申请.md', 'classroom zip source')
    zip.file('folder/购买凭证.txt', 'synthetic support material')
    zip.file('folder/malware.exe', 'no executables')
    zip.file('folder/copy-of-application.md', 'classroom zip source')
    const path = join(workspace, 'source.zip')
    writeFileSync(path, await zip.generateAsync({ type: 'nodebuffer' }))
    const result = await stageD4NativeBatch([path], destination())
    expect(result.files).toHaveLength(2)
    expect(result.files.map(x => x.originLabel)).toContain('source.zip/folder/教室借用申请.md')
    expect(result.skipped).toHaveLength(2)
    expect(result.skipped.some(x => x.reason.includes('SHA-256'))).toBe(true)
    expect(result.skipped.some(x => x.reason.includes('不支持'))).toBe(true)
    expect(result.files.some(x => x.sourcePath.includes('folder'))).toBe(false)
  })

  test('ZIP slip names are always rejected before filesystem extraction', () => {
    for (const label of ['../outside.md','/etc/passwd','a/../../escape.md','a\\b.md','C:/evil.md','a/./b.md']) {
      expect(isSafeD4ZipEntry(label)).toBe(false)
    }
    expect(isSafeD4ZipEntry('good/relative-name.md')).toBe(true)
  })

  test('damaged ZIP does not prevent another native-selected file from importing', async () => {
    const bad = join(workspace, 'damaged.zip')
    const good = join(workspace, '教室说明.md')
    writeFileSync(bad, 'not a real zip')
    writeFileSync(good, 'other source')
    const stage = await stageD4NativeBatch([bad, good], destination())
    expect(stage.files.map(x => x.name)).toEqual(['教室说明.md'])
    expect(stage.skipped).toHaveLength(1)
    expect(stage.skipped[0]!.reason).toContain('ZIP')
  })

  test('100 accepted files cap explicitly records the 101st omission', async () => {
    const folder = join(workspace, 'large')
    mkdirSync(folder)
    for (let i = 0; i < 101; i++) {
      writeFileSync(join(folder, String(i).padStart(3, '0') + '.md'), 'unique-document-' + i)
    }
    const result = await stageD4NativeBatch([folder], destination())
    expect(result.files).toHaveLength(100)
    expect(result.skipped).toHaveLength(1)
    expect(result.skipped[0]!.reason).toContain('100')
  })
})
