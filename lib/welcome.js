// lib/welcome.js
// Welcome and goodbye helper
const cfg = require('./messageConfig')

function welcome(user) {
  const name = user && user.name ? user.name : 'there'
  return cfg.messages.welcome(name)
}

function goodbye(user) {
  const name = user && user.name ? user.name : 'friend'
  return cfg.messages.goodbye(name)
}

module.exports = { welcome, goodbye }
