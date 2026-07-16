// lib/converter.js
// Small wrapper to call ffmpeg for simple conversions. Requires ffmpeg installed on the host.
const { spawn } = require('child_process')

function convertVideoToAudio(inputPath, outputPath, opts = {}) {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', inputPath]
    if (opts.audioBitrate) args.push('-b:a', opts.audioBitrate)
    args.push(outputPath)
    const ff = spawn('ffmpeg', args)
    ff.on('error', err => reject(err))
    ff.on('close', code => {
      if (code === 0) resolve(outputPath)
      else reject(new Error('ffmpeg exited with code ' + code))
    })
  })
}

module.exports = { convertVideoToAudio }
