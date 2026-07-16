// lib/uploadImage.js
// Placeholder uploader. Implementers should replace with real hosting API (imgur, cloudinary, etc.)

async function uploadImageToHosting(filePath, opts = {}) {
  // Return a fake URL for now
  return `https://example.com/uploads/${Date.now()}_${encodeURIComponent(filePath)}`
}

module.exports = { uploadImageToHosting }
