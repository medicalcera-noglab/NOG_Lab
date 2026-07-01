/**
 * One-time migration: upload all locally-stored media files to Cloudinary,
 * then update the DB URL columns so Vercel can serve them.
 *
 * Run from the project root:
 *   node scripts/migrate-local-media-to-cloudinary.cjs
 *
 * Requires credentials already in .env.local (hardcoded below for one-shot use).
 */
'use strict'

const { Client } = require('pg')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const path = require('path')

// ── Config ────────────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: 'dj52fs4lo',
  api_key: '297952429481913',
  api_secret: 'JLS88RQVbqMwDU6sDFOFDickymQ',
})

const DB_URL =
  'postgresql://neondb_owner:npg_CH5fbjzWJn1A@ep-frosty-salad-aoswqdhc.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const MEDIA_DIR = path.join(__dirname, '..', 'public', 'media')

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip extension to get Cloudinary public_id (mirrors storage.ts toPublicId). */
function toPublicId(filename) {
  return filename.replace(/\.[^.]+$/, '')
}

/** Compute the Cloudinary delivery URL (mirrors storage.ts generateURL). */
function generateUrl(filename) {
  return cloudinary.url(`nog-lab/media/${toPublicId(filename)}`, {
    secure: true,
    fetch_format: 'auto',
    quality: 'auto',
  })
}

/** Upload a local file to Cloudinary; skips if already uploaded. */
async function uploadFile(filePath, filename) {
  const publicId = `nog-lab/media/${toPublicId(filename)}`
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { public_id: publicId, overwrite: true, resource_type: 'auto' },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      },
    )
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const client = new Client({ connectionString: DB_URL })
  await client.connect()
  console.log('Connected to Neon DB')

  // 1. Get all media records that still have local URLs
  const { rows } = await client.query(`
    SELECT
      id, filename, url,
      thumbnail_u_r_l,
      sizes_thumbnail_filename, sizes_thumbnail_url,
      sizes_medium_filename,    sizes_medium_url,
      sizes_large_filename,     sizes_large_url
    FROM media
    WHERE url LIKE '/api/media/file/%'
    ORDER BY id
  `)

  console.log(`\nFound ${rows.length} media records with local URLs\n`)

  let successCount = 0
  let errorCount = 0

  for (const row of rows) {
    console.log(`── id=${row.id}  "${row.filename}"`)

    // Build the list of (filePath, filename, colName) triples for this record
    const files = [
      { fn: row.filename, col: 'url' },
      { fn: row.sizes_thumbnail_filename, col: 'sizes_thumbnail_url' },
      { fn: row.sizes_medium_filename, col: 'sizes_medium_url' },
      { fn: row.sizes_large_filename, col: 'sizes_large_url' },
    ].filter((f) => f.fn)

    const newUrls = {}

    for (const { fn, col } of files) {
      const filePath = path.join(MEDIA_DIR, fn)
      if (!fs.existsSync(filePath)) {
        console.log(`   MISSING local file: ${fn}`)
        continue
      }
      try {
        await uploadFile(filePath, fn)
        newUrls[col] = generateUrl(fn)
        console.log(`   ✓ ${fn}`)
      } catch (err) {
        console.error(`   ✗ FAILED ${fn}: ${err.message}`)
        errorCount++
      }
    }

    // thumbnail_u_r_l mirrors sizes_thumbnail_url
    if (newUrls['sizes_thumbnail_url']) {
      newUrls['thumbnail_u_r_l'] = newUrls['sizes_thumbnail_url']
    }

    if (Object.keys(newUrls).length === 0) {
      console.log('   Nothing updated (files missing or all uploads failed)')
      continue
    }

    // Build parameterised UPDATE
    const cols = Object.keys(newUrls)
    const vals = Object.values(newUrls)
    const setClauses = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ')
    vals.push(row.id)

    await client.query(`UPDATE media SET ${setClauses} WHERE id = $${vals.length}`, vals)

    console.log(`   DB updated (${cols.length} columns)`)
    successCount++
  }

  await client.end()
  console.log(`\n──────────────────────────────────────────────`)
  console.log(`Done.  Succeeded: ${successCount}  Errors: ${errorCount}`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
