import type { Metadata, Viewport } from 'next';
import './globals.css';

const title = 'Bajaj Air Coolers · Product Knowledge Assessment';
const description = 'Bajaj Air Coolers product knowledge training: a 50-question learner assessment.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { type: 'website', title, description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C4795',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
