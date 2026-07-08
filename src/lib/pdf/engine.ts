import { PDFDocument, degrees } from "pdf-lib"

export interface CompressOptions {
  level: "low" | "medium" | "high"
}

export async function mergePdfs(files: { name: string; bytes: ArrayBuffer }[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create()

  for (const file of files) {
    const doc = await PDFDocument.load(file.bytes)
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices())
    pages.forEach((page) => mergedDoc.addPage(page))
  }

  return mergedDoc.save({ useObjectStreams: true })
}

export async function splitByPageRange(
  bytes: ArrayBuffer,
  startPage: number,
  endPage: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const newDoc = await PDFDocument.create()
  const indices: number[] = []
  for (let i = startPage; i <= endPage && i < doc.getPageCount(); i++) {
    indices.push(i)
  }
  const pages = await newDoc.copyPages(doc, indices)
  pages.forEach((page) => newDoc.addPage(page))
  return newDoc.save({ useObjectStreams: true })
}

export async function extractPages(bytes: ArrayBuffer, pageIndices: number[]): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const newDoc = await PDFDocument.create()
  const pages = await newDoc.copyPages(doc, pageIndices)
  pages.forEach((page) => newDoc.addPage(page))
  return newDoc.save({ useObjectStreams: true })
}

export async function splitEveryPage(bytes: ArrayBuffer): Promise<Uint8Array[]> {
  const doc = await PDFDocument.load(bytes)
  const results: Uint8Array[] = []

  for (let i = 0; i < doc.getPageCount(); i++) {
    const newDoc = await PDFDocument.create()
    const [page] = await newDoc.copyPages(doc, [i])
    newDoc.addPage(page)
    results.push(await newDoc.save({ useObjectStreams: true }))
  }

  return results
}

export async function rotateAllPages(
  bytes: ArrayBuffer,
  angle: 90 | 180 | 270,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const pages = doc.getPages()
  pages.forEach((page) => {
    const current = page.getRotation().angle
    page.setRotation(degrees((current + angle) % 360))
  })
  return doc.save({ useObjectStreams: true })
}

export async function rotateSelectedPages(
  bytes: ArrayBuffer,
  pageIndices: number[],
  angle: 90 | 180 | 270,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const pages = doc.getPages()
  pageIndices.forEach((i) => {
    if (i >= 0 && i < pages.length) {
      const current = pages[i].getRotation().angle
      pages[i].setRotation(degrees((current + angle) % 360))
    }
  })
  return doc.save({ useObjectStreams: true })
}

export async function compressPdf(
  bytes: ArrayBuffer,
  options: CompressOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)

  const saveOptions: Parameters<typeof doc.save>[0] = {
    useObjectStreams: true,
    addDefaultPage: false,
  }

  if (options.level === "low") {
    saveOptions.objectsPerTick = 100
  } else if (options.level === "medium") {
    saveOptions.objectsPerTick = 50
  } else {
    saveOptions.objectsPerTick = 20
  }

  return doc.save(saveOptions)
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function protectPdf(
  bytes: ArrayBuffer,
  password: string,
): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const plaintext = new Uint8Array(bytes)
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext)

  const header = new TextEncoder().encode("TFENC1")
  const result = new Uint8Array(header.length + salt.length + iv.length + encrypted.byteLength)
  result.set(header, 0)
  result.set(salt, header.length)
  result.set(iv, header.length + salt.length)
  result.set(new Uint8Array(encrypted), header.length + salt.length + iv.length)
  return result
}

export async function unlockPdf(
  bytes: ArrayBuffer,
  password: string,
): Promise<Uint8Array> {
  const data = new Uint8Array(bytes)
  const header = new TextEncoder().encode("TFENC1")

  const actualHeader = data.slice(0, header.length)
  if (actualHeader.every((b, i) => b !== header[i])) {
    throw new Error("Not a Zilita encrypted PDF")
  }

  const salt = data.slice(header.length, header.length + 16)
  const iv = data.slice(header.length + 16, header.length + 16 + 12)
  const encrypted = data.slice(header.length + 16 + 12)

  const key = await deriveKey(password, salt)
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted)
  return new Uint8Array(decrypted)
}

export async function signPdf(
  bytes: ArrayBuffer,
  signatures: {
    pageIndex: number
    x: number
    y: number
    width: number
    height: number
    imageBytes: Uint8Array
  }[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const firstPageSize = doc.getPage(0).getSize()

  for (const sig of signatures) {
    if (sig.pageIndex >= 0 && sig.pageIndex < doc.getPageCount()) {
      const page = doc.getPage(sig.pageIndex)
      const pageSize = page.getSize()
      try {
        const pngImage = await doc.embedPng(sig.imageBytes)
        page.drawImage(pngImage, {
          x: sig.x,
          y: pageSize.height - sig.y - sig.height,
          width: sig.width,
          height: sig.height,
        })
      } catch {
        const jpgImage = await doc.embedJpg(sig.imageBytes)
        page.drawImage(jpgImage, {
          x: sig.x,
          y: pageSize.height - sig.y - sig.height,
          width: sig.width,
          height: sig.height,
        })
      }
    }
  }

  return doc.save({ useObjectStreams: true })
}

export async function getPageCount(bytes: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(bytes)
  return doc.getPageCount()
}

export function bytesToSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
