import { Inter, Amiri } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-amiri',
})

export const metadata = {
  title: 'Bayan Chat — Clarity Through the Quran',
  description: 'Speak what is on your heart. Find clarity, comfort, and guidance through Quranic verses tailored to your feelings.',
  openGraph: {
    title: 'Bayan Chat — Clarity Through the Quran',
    description: 'Speak what is on your heart. Find clarity through Quranic verses.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <body>
        <div className="deco-side left" aria-hidden />
        <div className="deco-side right" aria-hidden />
        {children}
      </body>
    </html>
  )
}
