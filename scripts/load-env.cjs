// Loaded via tsx --require before any ESM imports resolve.
// Reads .env.local (then .env) using only built-in Node fs so no
// external package is needed. Variables already in process.env are
// never overwritten (shell-level overrides always win).
const fs = require('fs')
const path = require('path')

function load(file) {
  const full = path.resolve(__dirname, '..', file)
  if (!fs.existsSync(full)) return
  const lines = fs.readFileSync(full, 'utf8').split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    if (!key || key in process.env) continue // never overwrite
    let val = line.slice(eq + 1).trim()
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

load('.env.local')
load('.env')
