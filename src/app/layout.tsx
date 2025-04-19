import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Polaroid-Style AI Generator | Transform Your Photos into Retro Polaroids',
  description: 'Transform your favorite photos into nostalgic Polaroid-style images with our AI-powered generator. Easy to use, instant results, and free downloads.',
  keywords: 'polaroid, ai generator, photo transformation, retro photos, vintage photos, polaroid style, ai photo tool',
  authors: [{ name: 'Polaroid AI Generator Team' }],
  openGraph: {
    title: 'Polaroid-Style AI Generator | Transform Your Photos into Retro Polaroids',
    description: 'Transform your favorite photos into nostalgic Polaroid-style images with our AI-powered generator.',
    url: 'https://polaroid-ai-generator.com',
    siteName: 'Polaroid-Style AI Generator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Polaroid-Style AI Generator Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polaroid-Style AI Generator | Transform Your Photos into Retro Polaroids',
    description: 'Transform your favorite photos into nostalgic Polaroid-style images with our AI-powered generator.',
    images: ['/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white py-6 border-t">
          <div className="container-custom text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Polaroid-Style AI Generator. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Created with ❤️ using Next.js and RunningHub API
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
} 