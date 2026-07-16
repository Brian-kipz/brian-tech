// lib/exif.js
// Minimal helper to produce sticker EXIF metadata (for webp stickers)

function makeExif(packname = 'BRIAN-TECH', author = 'BRIAN') {
  // This is a lightweight placeholder. Creating real exif for webp stickers needs binary assembly.
  return { packname, author }
}

module.exports = { makeExif }
