import { ThemeProvider } from '@/providers/ThemeProvider'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
