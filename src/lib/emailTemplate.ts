/** Branded HTML wrapper for all transactional emails sent by Payload. */
export function emailTemplate({
  subject,
  body,
  siteName = 'NOG Lab',
}: {
  subject: string
  body: string
  siteName?: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #F7F7F5; font-family: Inter, system-ui, sans-serif; color: #1A1A1A; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #0E6E6E; padding: 28px 32px; }
    .header-title { color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
    .header-subtitle { color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0; }
    .body { padding: 32px; font-size: 15px; line-height: 1.6; color: #1A1A1A; }
    .body p { margin: 0 0 16px; }
    .cta { display: inline-block; margin: 8px 0 24px; padding: 12px 24px; background: #E2725B; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .cta:hover { background: #CC5744; }
    .divider { border: none; border-top: 1px solid #E8E6E1; margin: 24px 0; }
    .footer { padding: 20px 32px; font-size: 12px; color: #6B6B68; border-top: 1px solid #E8E6E1; }
    code { background: #EFEDE9; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="header-title">${siteName}</p>
      <p class="header-subtitle">Nutrition, Oral &amp; Gut Microbiome Lab · Khyber Medical University</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      This email was sent automatically by ${siteName}. If you did not request this, you can safely ignore it.
    </div>
  </div>
</body>
</html>`
}
