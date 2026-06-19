import { ThemeProvider } from '@/providers/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { cn } from '@/lib/utils'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* Skip-to-content — visible on focus, transparent otherwise */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed top-2 left-2 z-50 rounded-lg px-4 py-2 text-sm font-medium',
          'bg-primary text-primary-fg',
          'focus:ring-ring focus:ring-offset-bg focus:ring-2 focus:ring-offset-2 focus:outline-none',
        )}
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <Footer />
    </ThemeProvider>
  )
}
