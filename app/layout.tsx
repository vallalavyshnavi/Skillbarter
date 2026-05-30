import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SkillBarter — Learn Skills. Teach Skills. Earn Opportunities.',
  description:
    'SkillBarter is an AI-powered peer-to-peer skill exchange platform that connects learners with teachers, provides verified certifications, and links youth with employers.',
  keywords: ['skill exchange', 'peer learning', 'skill credits', 'certifications', 'youth employment'],
  openGraph: {
    title: 'SkillBarter — AI-Powered Skill Exchange Platform',
    description: 'Teach what you know. Learn what you need. Earn your future.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
