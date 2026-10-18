/** W1 native OS-picker input expansion. Nothing here accepts Renderer filesystem paths.
 * Main copies only bounded regular files into a private temporary directory.
 * ZIP extraction is streamed, size-limited and never uses entry paths as host paths.
 */
import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { basename, extname, join, posix } from 'node:path'
import { pipeline } from 'node:stream/promises'
import JSZip from 'jszip'

export const D4_BATCH_MAX_FILES = 100
export const D4_BATCH_MAX_FILE_BYTES = 50 * 1024 * 1024
export const D4_BATCH_MAX_TOTAL_BYTES = 100 * 1024 * 1024
const MAX_ZIP_COMPRESSED = 50 * 1024 * 1024
const MAX_DEPTH = 8
const EXTENSIONS = new Set([
  '.md', '.txt', '.csv', '.json', '.html', '.htm', '.eml', '.pdf',
  '.doc', '.docx', '.docm', '.dot', '.dotx', '.wps', '.xls', '.xlsx', '.xlsm',
  '.et', '.ppt', '.pptx', '.pptm', '.dps', '.rtf', '.odt', '.ods', '.odp',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp',
])
export interface D4BatchFile {
  name: string
  sourcePath: string
  sizeBytes: number
  originLabel: string
}
export interface D4BatchSkip {
  originLabel: string
  reason: string
}
function safeLabel(label: string): string {
  return label.slice(0, 300)
}
function safeEntryName(raw: string): boolean {
  const parts = raw.split('/')
  return raw.length < 600 && !raw.includes('\\') && !raw.startsWith('/') &&
    !raw.includes('\0') && !/^[A-Za-z]:/.test(raw) &&
    parts.every((part, i) => part !== '.' && part !== '..' && (part.length > 0 || i === parts.length - 1))
}
export function isSafeD4ZipEntry(raw: string): boolean { return safeEntryName(raw) }
function safeHostFileName(name: string): boolean {
  if (!name || name.length > 240 || name === '.' || name === '..' ||
      /[\\/:*?"<>|\x00-\x1f]/.test(name) || /[. ]$/.test(name)) return false
  // Windows reserves these names irrespective of file extension.
  return !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)
}
export async function stageD4NativeBatch(
  selectedPaths: readonly string[], privateDir: string,
): Promise<{ files: D4BatchFile[]; skipped: D4BatchSkip[] }> {
  const files: D4BatchFile[] = []
  const skipped: D4BatchSkip[] = []
  const digests = new Set<string>()
  let bytesTotal = 0
  let examined = 0
  const visit = (): void => {
    examined += 1
    if (examined > 5000) throw new Error('D4_INTAKE_TOO_MANY_ENTRIES: 单次最多扫描 5000 个目录/文件/ZIP 条目')
  }
  const skip = (label: string, reason: string): void => { skipped.push({ originLabel: safeLabel(label), reason }) }
  const target = (name: string): string => {
    const dir = join(privateDir, String(files.length))
    mkdirSync(dir)
    return join(dir, name)
  }
  const accept = async (
    name: string, label: string, size: number,
    stream: () => Readable,
  ): Promise<void> => {
    if (!safeHostFileName(name)) { skip(label, '文件名不安全或不兼容 Windows'); return }
    if (!EXTENSIONS.has(extname(name).toLowerCase())) { skip(label, '不支持的文件格式'); return }
    if (size < 1 || size > D4_BATCH_MAX_FILE_BYTES) { skip(label, '空文件或超过单文件 50 MB'); return }
    if (files.length >= D4_BATCH_MAX_FILES) { skip(label, '超过 100 份材料上限'); return }
    if (bytesTotal + size > D4_BATCH_MAX_TOTAL_BYTES) { skip(label, '超过批次 100 MB 解压后体积上限'); return }
    const dest = target(name)
    let written = 0
    const sha = createHash('sha256')
    try {
      // `pipeline` propagates disk, decompression and size failures. Even
      // malicious ZIP headers cannot bypass the live byte cap.
      const limiter = new Transform({
        transform(chunk: Buffer, _encoding, callback) {
          const buffer = Buffer.from(chunk)
          written += buffer.length
          if (written > size || written > D4_BATCH_MAX_FILE_BYTES || bytesTotal + written > D4_BATCH_MAX_TOTAL_BYTES) {
            callback(new Error('解压后实际体积超出声明或上限'))
            return
          }
          sha.update(buffer)
          callback(null, buffer)
        },
      })
      await pipeline(stream(), limiter, createWriteStream(dest, { flags: 'wx' }))
      if (written !== size) throw new Error('压缩包声明与实际解压大小不符')
      const digest = sha.digest('hex')
      if (digests.has(digest)) { skip(label, '与本批次已有材料内容重复（SHA-256）'); rmSync(join(privateDir, String(files.length)), { recursive: true, force: true }); return }
      digests.add(digest)
      bytesTotal += written
      files.push({ name, sourcePath: dest, sizeBytes: written, originLabel: safeLabel(label) })
    } catch (error) {
      rmSync(join(privateDir, String(files.length)), { recursive: true, force: true })
      skip(label, '读取或解压失败：' + (error instanceof Error ? error.message : String(error)))
    }
  }
  async function fromZip(zipPath: string, label: string): Promise<void> {
    const archiveStat = lstatSync(zipPath)
    if (!archiveStat.isFile() || archiveStat.size > MAX_ZIP_COMPRESSED) {
      skip(label, 'ZIP 不是普通文件或压缩包超过 50 MB')
      return
    }
    try {
      const zip = await JSZip.loadAsync(readFileSync(zipPath), { checkCRC32: false })
      const members = Object.values(zip.files).sort((a, b) => a.name.localeCompare(b.name))
      if (members.length > 500) { skip(label, 'ZIP 条目超过 500，请拆分'); return }
      for (const entry of members) {
        visit()
        const raw = (entry as typeof entry & { unsafeOriginalName?: string }).unsafeOriginalName ?? entry.name
        if (!safeEntryName(raw)) { skip(label + '/' + raw, 'ZIP 路径不安全'); continue }
        if (entry.dir) continue
        if (raw.split('/').length > MAX_DEPTH) { skip(label + '/' + raw, 'ZIP 目录层级过深'); continue }
        const name = posix.basename(raw)
        const data = (entry as typeof entry & { _data?: { uncompressedSize?: number } })._data
        const size = data?.uncompressedSize
        if (!Number.isSafeInteger(size) || size === undefined) { skip(label + '/' + raw, 'ZIP 无可信解压后长度'); continue }
        await accept(name, label + '/' + raw, size, () => entry.nodeStream() as unknown as Readable)
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('D4_INTAKE_TOO_MANY_ENTRIES')) throw error
      skip(label, 'ZIP 格式错误或无法读取：' + (error instanceof Error ? error.message : String(error)))
    }
  }
  async function walk(sourcePath: string, label: string, depth: number): Promise<void> {
    visit()
    if (depth > MAX_DEPTH) { skip(label, '目录层级超过 8'); return }
    let info: ReturnType<typeof lstatSync>
    try { info = lstatSync(sourcePath) } catch { skip(label, '路径无法读取'); return }
    if (info.isSymbolicLink()) { skip(label, '符号链接不允许跟随'); return }
    if (info.isDirectory()) {
      let entries: string[]
      try { entries = readdirSync(sourcePath).sort() } catch { skip(label, '文件夹无法读取'); return }
      if (entries.length > 1000) { skip(label, '单级文件夹条目超过 1000'); return }
      for (const entry of entries) await walk(join(sourcePath, entry), label + '/' + entry, depth + 1)
      return
    }
    if (!info.isFile()) { skip(label, '不是普通文件'); return }
    if (extname(sourcePath).toLowerCase() === '.zip') { await fromZip(sourcePath, label); return }
    await accept(basename(sourcePath), label, info.size, () => createReadStream(sourcePath))
  }
  for (const path of selectedPaths) await walk(path, basename(path), 0)
  return { files, skipped }
}
