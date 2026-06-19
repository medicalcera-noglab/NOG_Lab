'use client'

import { Link2, Share2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  title: string
  url: string
}

export function SocialShare({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3" aria-label="Share this post">
      <span className="text-muted text-sm font-medium">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-surface-raised rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        aria-label="Share on X / Twitter"
      >
        {/* X (Twitter) — Lucide doesn't ship a Twitter icon; using text */}
        <span className="text-sm leading-none font-bold" aria-hidden>
          𝕏
        </span>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-surface-raised rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        aria-label="Share on LinkedIn"
      >
        <Share2 size={18} />
      </a>
      <button
        onClick={copyLink}
        className="hover:bg-surface-raised rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        aria-label="Copy link"
      >
        <Link2 size={18} />
        {copied && <span className="sr-only">Link copied!</span>}
      </button>
      {copied && (
        <span className="text-accent text-xs" aria-live="polite">
          Copied!
        </span>
      )}
    </div>
  )
}
