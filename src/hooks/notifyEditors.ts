import type { CollectionAfterChangeHook } from 'payload'

/**
 * Fires after a blog_post is saved.
 * When status transitions to 'review', emails all editors and super_admins
 * so they know the post is awaiting approval.
 */
export const notifyEditorsHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only on updates where status just became 'review'
  if (operation !== 'update' || doc.status !== 'review' || previousDoc?.status === 'review') {
    return doc
  }

  try {
    const { docs: editors } = await req.payload.find({
      collection: 'users',
      where: {
        or: [{ role: { equals: 'editor' } }, { role: { equals: 'super_admin' } }],
      },
      limit: 100,
      overrideAccess: true,
    })

    if (editors.length === 0) return doc

    const base =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const reviewUrl = `${base}/admin/collections/blog_posts/${doc.id}`
    const authorName =
      typeof doc.author === 'object' ? (doc.author as { name?: string }).name : 'A contributor'

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"></head>
      <body style="font-family:Inter,sans-serif;background:#F7F7F5;padding:32px 0;margin:0">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          <div style="background:#0E6E6E;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">NOG Lab · Blog Review</p>
          </div>
          <div style="padding:32px">
            <h1 style="margin:0 0 8px;font-size:20px;color:#1A1A1A">Post ready for review</h1>
            <p style="margin:0 0 20px;color:#6b6b68;font-size:15px">
              <strong style="color:#1A1A1A">${String(doc.title)}</strong> was submitted
              for review by <strong style="color:#1A1A1A">${String(authorName)}</strong>.
            </p>
            <a href="${reviewUrl}"
               style="display:inline-block;background:#0E6E6E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Open in Admin →
            </a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #E8E6E1">
            <p style="margin:0;font-size:12px;color:#9a9896">
              You received this because you are an editor on the NOG Lab site.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    await Promise.all(
      editors.map((editor) =>
        req.payload.sendEmail({
          to: editor.email as string,
          subject: `[NOG Lab] Ready for review: "${String(doc.title)}"`,
          html,
        }),
      ),
    )
  } catch (err) {
    // Don't let email failure block the save
    req.payload.logger.error({ err, msg: 'notifyEditors hook failed' })
  }

  return doc
}
