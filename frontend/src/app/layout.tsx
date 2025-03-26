import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

// Setup font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata for SEO
export const metadata: Metadata = {
  title: {
    template: '%s | Claude App Development Platform',
    default: 'Claude App Development Platform',
  },
  description: 'End-to-end application development platform powered by Claude',
  keywords: [
    'app development',
    'project planning',
    'claude',
    'ai',
    'project management',
    'development platform',
  ],
  authors: [
    {
      name: 'Your Name',
      url: 'https://github.com/yourusername',
    },
  ],
  creator: 'Your Name',
  publisher: 'Your Company',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}