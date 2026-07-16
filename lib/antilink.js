// lib/antilink.js
// Basic antilink handler. The bot integration should call `handle` on incoming messages.

const { hasLink } = require('./antilinkHelper')

module.exports = {
  handle(message = {}, options = {}) {
    // message: { id, from, text, isGroup, isAdmin }
    // options: { allowedGroups: [], ignoreAdmins: true }
    if (!message || !message.text) return { action: 'none' }
    if (!message.isGroup) return { action: 'none' }
    if (options.ignoreAdmins && message.isAdmin) return { action: 'none' }

    if (hasLink(message.text)) {
      // bot integration should delete the message and optionally warn
      return { action: 'delete', reason: 'link detected' }
    }
    return { action: 'none' }
  }
}
