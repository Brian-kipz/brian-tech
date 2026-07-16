// lib/ytdl2.js
// YouTube downloader helper (placeholder). For production use install 'ytdl-core' or 'youtube-dl'.
const { spawn } = require('child_process')

function downloadYouTube(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Try to use youtube-dl if available
    const proc = spawn('youtube-dl', ['-o', outputPath, url])
    proc.on('error', err => reject(err))
    proc.on('close', code => {
      if (code === 0) resolve(outputPath)
      else reject(new Error('youtube-dl exited with code ' + code))
    })
  })
}

module.exports = { downloadYouTube }
