const { copyFileSync, existsSync, mkdirSync } = require("fs")
const { join } = require("path")

const coreDir = join(__dirname, "..", "node_modules", "@ffmpeg", "core", "dist", "esm")
const ffmpegDir = join(__dirname, "..", "node_modules", "@ffmpeg", "ffmpeg", "dist", "esm")
const destDir = join(__dirname, "..", "public", "ffmpeg")

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true })
}

copyFileSync(join(coreDir, "ffmpeg-core.js"), join(destDir, "ffmpeg-core.js"))
copyFileSync(join(coreDir, "ffmpeg-core.wasm"), join(destDir, "ffmpeg-core.wasm"))
copyFileSync(join(ffmpegDir, "worker.js"), join(destDir, "worker.js"))
copyFileSync(join(ffmpegDir, "const.js"), join(destDir, "const.js"))
copyFileSync(join(ffmpegDir, "errors.js"), join(destDir, "errors.js"))

console.log("✔ FFmpeg core files and worker copied to public/ffmpeg/")
