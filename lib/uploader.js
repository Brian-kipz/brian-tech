// lib/uploader.js
// General file uploader placeholder

async function uploadFile(filePath, { destination } = {}) {
  return { success: true, url: `https://example.com/${encodeURIComponent(filePath)}`, destination }
}

module.exports = { uploadFile }
