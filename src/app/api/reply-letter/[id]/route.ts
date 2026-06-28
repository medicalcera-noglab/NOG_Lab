import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Person, SiteSetting, Inquiry } from '../../../../../payload-types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  // Auth — must be a logged-in admin/editor
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('<h1>401 Unauthorised</h1><p>Please log in to the admin first.</p>', {
      status: 401,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Fetch inquiry
  const inquiry = await payload.findByID({
    collection: 'inquiries',
    id: Number(id),
    depth: 0,
    overrideAccess: true,
  })

  if (!inquiry) {
    return new Response('<h1>404 Not Found</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Fetch PI (role === 'pi') for the signature block
  const peopleResult = await payload.find({
    collection: 'people',
    where: { role: { equals: 'pi' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const pi = (peopleResult.docs[0] as Person | undefined) ?? null

  // Fetch site settings for contact info
  const settings = (await payload.findGlobal({
    slug: 'site_settings',
    depth: 0,
    overrideAccess: true,
  })) as SiteSetting

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.org'
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const labName = settings.labName ?? 'NOG Lab'
  const contactEmail = settings.contactEmail ?? 'info@noglab.org'
  const contactAddress =
    settings.contactAddress ?? 'Khyber Medical University, Peshawar, KPK, Pakistan'

  const piName = pi?.name ?? 'Dr. Shahzad Hussain Shah'
  const piTitle = pi?.academicTitle
    ? `${pi.academicTitle}${pi.institution ? ', ' + pi.institution : ''}`
    : 'Principal Investigator, Khyber Medical University'
  const piEmail = pi?.email ?? contactEmail

  const inq = inquiry as unknown as Inquiry & { replyText?: string | null }
  const applicantName = inq.name ?? ''
  const applicantEmail = inq.email ?? ''
  const positionTitle = inq.positionTitle ?? undefined
  const replyText = inq.replyText ?? undefined
  const inquiryRef = `NOG-APP-${String(id).padStart(4, '0')}`

  const bodyContent = replyText
    ? replyText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
    : '<em style="color:#999">[No reply text entered. Add it in the admin under "Reply / Response" and save before regenerating.]</em>'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reply Letter — ${labName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: #e8e8e8;
    }

    /* ── Print button ────────────────────────────────── */
    .toolbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #0E6E6E;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 28px;
      z-index: 999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .toolbar span { font-size: 13px; opacity: 0.85; }
    .toolbar button {
      padding: 8px 22px;
      background: #fff;
      color: #0E6E6E;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 0.02em;
    }
    .toolbar button:hover { background: #f0fafa; }

    /* ── Page ────────────────────────────────────────── */
    .page-wrap {
      padding: 60px 20px 40px;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 4px 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Header ─────────────────────────────────────── */
    .header {
      background: linear-gradient(135deg, #0E6E6E 0%, #0a5555 100%);
      padding: 24px 30px 20px;
      display: flex;
      align-items: center;
      gap: 18px;
      color: #fff;
    }

    .header-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      border-radius: 10px;
      background: rgba(255,255,255,0.1);
      padding: 4px;
      flex-shrink: 0;
    }

    .header-text { flex: 1; }

    .header-text h1 {
      font-size: 20pt;
      font-weight: 700;
      letter-spacing: -0.3px;
      line-height: 1.1;
    }

    .header-text .tagline {
      font-size: 9pt;
      opacity: 0.75;
      margin-top: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .header-right {
      text-align: right;
      font-size: 8.5pt;
      opacity: 0.8;
      line-height: 1.6;
    }

    /* ── Accent stripe ──────────────────────────────── */
    .accent-stripe {
      height: 4px;
      background: linear-gradient(90deg, #E2725B 0%, #0E6E6E 60%, #E8C9A0 100%);
    }

    /* ── Body area ──────────────────────────────────── */
    .body {
      flex: 1;
      padding: 28px 30px 24px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* ── Date / Reference row ───────────────────────── */
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e8e8e8;
    }
    .meta-row .date { font-size: 10pt; color: #555; }
    .meta-row .ref {
      font-size: 9pt;
      color: #0E6E6E;
      font-weight: 600;
      background: #f0fafa;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #c8e8e8;
    }

    /* ── Recipient ──────────────────────────────────── */
    .recipient {
      margin-bottom: 20px;
    }
    .recipient .to-label {
      font-size: 8.5pt;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
    .recipient .name {
      font-size: 11.5pt;
      font-weight: 600;
      color: #1a1a1a;
    }
    .recipient .email-addr {
      font-size: 9.5pt;
      color: #555;
      margin-top: 2px;
    }

    /* ── Subject ────────────────────────────────────── */
    .subject-block {
      background: #f8fffe;
      border-left: 4px solid #0E6E6E;
      padding: 8px 14px;
      margin-bottom: 22px;
      border-radius: 0 6px 6px 0;
    }
    .subject-block .label {
      font-size: 8.5pt;
      color: #0E6E6E;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .subject-block .value {
      font-size: 11pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-top: 2px;
    }

    /* ── Salutation ─────────────────────────────────── */
    .salutation {
      font-size: 11pt;
      margin-bottom: 16px;
    }

    /* ── Body text ──────────────────────────────────── */
    .letter-body {
      font-size: 10.5pt;
      line-height: 1.85;
      color: #2a2a2a;
      flex: 1;
      margin-bottom: 28px;
    }

    /* ── Signature ──────────────────────────────────── */
    .signature {
      border-top: 1px solid #e8e8e8;
      padding-top: 20px;
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .signature-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .sig-closing { font-size: 10.5pt; color: #555; margin-bottom: 36px; }

    .sig-name {
      font-size: 13pt;
      font-weight: 700;
      color: #0E6E6E;
      margin-bottom: 3px;
    }
    .sig-title { font-size: 9.5pt; color: #555; line-height: 1.5; }
    .sig-email {
      font-size: 9pt;
      color: #0E6E6E;
      margin-top: 4px;
    }

    /* ── Footer ─────────────────────────────────────── */
    .footer {
      background: #f7f7f5;
      border-top: 2px solid #0E6E6E;
      padding: 12px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-lab {
      font-size: 8.5pt;
      font-weight: 600;
      color: #0E6E6E;
    }
    .footer-contact { font-size: 8pt; color: #888; text-align: right; line-height: 1.5; }

    /* ── Print ──────────────────────────────────────── */
    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .page-wrap { padding: 0; }
      .page {
        width: 100%;
        min-height: auto;
        box-shadow: none;
        margin: 0;
      }
      @page {
        size: A4;
        margin: 0;
      }
    }
  </style>
</head>
<body>

  <!-- Print toolbar -->
  <div class="toolbar">
    <span>NOG Lab — Reply Letter &nbsp;|&nbsp; ${inquiryRef}</span>
    <button onclick="window.print()">⬇ Download / Print as PDF</button>
  </div>

  <div class="page-wrap">
    <div class="page">

      <!-- Header -->
      <div class="header">
        <img src="${siteUrl}/NOG_LAB.png" alt="${labName}" class="header-logo" />
        <div class="header-text">
          <h1>${labName}</h1>
          <p class="tagline">Nutrition · Oral · Gut Microbiome Research</p>
        </div>
        <div class="header-right">
          <div>${contactEmail}</div>
          <div>${contactAddress.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
      <div class="accent-stripe"></div>

      <!-- Body -->
      <div class="body">

        <!-- Date / Ref -->
        <div class="meta-row">
          <span class="date">${today}</span>
          <span class="ref">${inquiryRef}</span>
        </div>

        <!-- Recipient -->
        <div class="recipient">
          <p class="to-label">To</p>
          <p class="name">${applicantName}</p>
          <p class="email-addr">${applicantEmail}</p>
        </div>

        <!-- Subject -->
        <div class="subject-block">
          <p class="label">Subject</p>
          <p class="value">RE: Application for ${positionTitle ?? 'Research Position — NOG Lab'}</p>
        </div>

        <!-- Salutation -->
        <p class="salutation">Dear ${applicantName},</p>

        <!-- Body text -->
        <div class="letter-body">${bodyContent}</div>

        <!-- Signature -->
        <div class="signature">
          <div>
            <p class="sig-closing">Yours sincerely,</p>
            <p class="sig-name">${piName}</p>
            <p class="sig-title">${piTitle}</p>
            <p class="sig-email">${piEmail}</p>
          </div>
        </div>

      </div><!-- /body -->

      <!-- Footer -->
      <div class="footer">
        <span class="footer-lab">${labName}</span>
        <span class="footer-contact">
          ${contactEmail}<br>${contactAddress.replace(/\n/g, ', ')}
        </span>
      </div>

    </div><!-- /page -->
  </div>

</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
