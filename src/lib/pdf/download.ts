import JSZip from "jszip"

export function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadAsZip(
  files: { bytes: Uint8Array; filename: string }[],
  zipFilename: string,
): Promise<void> {
  const zip = new JSZip()
  files.forEach((f) => {
    zip.file(f.filename, f.bytes.buffer as ArrayBuffer)
  })
  const blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = zipFilename
  a.click()
  URL.revokeObjectURL(url)
}
