# NOG Lab — Admin User Guide

A step-by-step guide for lab members who manage content through the admin panel.
No coding required.

---

## Accessing the Admin Panel

Open your browser and go to:

```
https://noglab.org/admin
```

Log in with your email and password. If 2FA is enabled you will be prompted for
a 6-digit code from your authenticator app after entering your password.

> **Tip:** Bookmark the admin URL. The public site and the admin panel are on the
> same domain — the admin panel is at `/admin`.

---

## Roles & What You Can Do

| Role            | Can do                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| **Super Admin** | Everything: create/edit/delete any content, manage users, change site settings |
| **Editor**      | Create and publish any content; cannot manage users or site settings           |
| **Contributor** | Write drafts only; an editor must review and publish your work                 |

---

## Managing People (Team Members)

1. In the left sidebar, click **People**.
2. Click **Create New** (top right).
3. Fill in:
   - **Full Name** — will appear on the website exactly as typed
   - **Role / Title** — e.g. "PhD Researcher", "Lab Director"
   - **Bio** — rich text; supports bold, italic, links, and bullet lists
   - **Photo** — upload a portrait (JPEG/PNG, ideally 800×800 px)
   - **Research Interests** — comma-separated tags
   - **Affiliation** — institutional affiliation
4. Set **Status** to _Published_ when the profile should be visible on the site.
5. Click **Save**.

> **Screenshot placeholder:** _People list view showing name, role, and status columns_

---

## Managing Publications

1. Click **Publications** in the sidebar.
2. Click **Create New**.
3. To auto-fill from a DOI:
   - Paste the DOI (e.g. `10.1038/s41564-023-01234-5`) into the **DOI** field
   - Click **Fetch from Crossref**
   - Review the pre-filled title, authors, year, and journal
4. Fill in or verify:
   - **Type** — journal article, conference, preprint, book chapter
   - **Abstract** — paste the plain-text abstract
   - **PDF Link** — optional open-access PDF URL
5. Save. Publications are always public (no draft/publish toggle).

> **Screenshot placeholder:** _Publication create form with DOI fetch button highlighted_

---

## Writing Blog Posts

### Creating a draft

1. Click **Blog Posts** → **Create New**.
2. Write the **Title** and **Content** (rich text editor).
3. Add a **Cover Image** and **Tags**.
4. Leave Status as _Draft_ while you are writing.
5. **Save** at any time — drafts are never shown on the public site.

### Scheduling publication

- Set **Scheduled Publish At** to a future date and time.
- The site will automatically publish the post at that time (checked hourly by a
  background job). You do not need to be logged in.

### Publishing immediately

- Change **Status** to _Published_ and save.

### Workflow for Contributors

Contributors cannot publish directly. To request review:

1. Save your draft.
2. Change **Status** to _Review_ and save.
3. Notify an editor — they will review and change the status to _Published_.

> **Screenshot placeholder:** _Blog post editor showing the Status dropdown with Draft / Review / Published options_

---

## Managing News & Events

Same as blog posts, with an extra **Event Date** field.

- Past events remain visible (for historical record).
- Upcoming events with a future **Event Date** are highlighted on the homepage.

---

## Managing Projects

1. Click **Projects** → **Create New**.
2. Fill in **Title**, **Summary**, **Full Description** (rich text), and **Status**
   (Ongoing / Completed / Planned).
3. Add **Study Sites** under the _Sites_ tab — each site needs a name, GPS
   coordinates (click the map picker), district, and province.
4. Link **Publications** to the project under the _Publications_ tab.
5. Save.

> **Screenshot placeholder:** _Project form showing the map picker for adding a study site_

---

## Uploading Media

1. Click **Media** in the sidebar.
2. Drag and drop files, or click **Upload**.
3. Fill in the **Alt Text** field — this is required for accessibility and SEO.
4. Supported types: JPEG, PNG, WebP, GIF, PDF, MP4.

All media is stored in Cloudflare R2 and served via CDN. Large files (videos)
may take a minute to upload.

---

## Site Settings (Super Admin only)

**Settings → Site Settings** controls:

- **Lab Name** — appears in the navbar and browser tab
- **Tagline** — one-line description shown on the homepage hero
- **Contact Email** — shown in the contact form confirmation
- **Social Links** — Twitter/X, LinkedIn, GitHub
- **Analytics ID** — Plausible domain (e.g. `noglab.org`)
- **Footer Text** — copyright line at the bottom of every page

---

## Navigation (Super Admin only)

**Settings → Navigation** lets you reorder, add, or remove links in the top
navigation bar and the footer. Drag to reorder.

---

## Recovering a Deleted Item

All deletes are **soft deletes** — the item is hidden but not gone. A Super Admin
can restore it:

1. In the collection list, click the **…** menu at the top right.
2. Enable **Show Deleted**.
3. Find the item and click **Restore**.

---

## Logging Out

Click your name (bottom left of the sidebar) → **Log out**.

Sessions expire after 2 hours of inactivity. If you are working for a long period,
save your work frequently.

---

## Getting Help

Contact the site administrator or open an issue at:
[github.com/your-org/noglab/issues](https://github.com/your-org/noglab/issues)
