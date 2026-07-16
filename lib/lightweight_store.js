// lib/lightweight_store.js
// Simple JSON file-backed lightweight store
const fs = require('fs')

class LightweightStore {
  constructor(filePath) {
    this.filePath = filePath || './data_store.json'
    this.map = new Map()
    this._loaded = false
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8')
        const obj = JSON.parse(raw)
        Object.entries(obj).forEach(([k,v]) => this.map.set(k, v))
      }
    } catch (e) {
      // ignore
    }
    this._loaded = true
  }
  save() {
    const obj = Object.fromEntries(this.map)
    fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf8')
  }
  get(key) { if (!this._loaded) this.load(); return this.map.get(key) }
  set(key, value) { this.map.set(key, value); this.save() }
  delete(key) { this.map.delete(key); this.save() }
  has(key) { return this.map.has(key) }
}

module.exports = LightweightStore
